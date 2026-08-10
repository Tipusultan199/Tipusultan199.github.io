/* Shared behaviour for every page. Loaded with `defer`. */
(function () {
  "use strict";

  var root = document.documentElement;

  /* ---------------------------------------------------------- theme */

  function applyTheme(mode) {
    if (mode === "light" || mode === "dark") {
      root.setAttribute("data-theme", mode);
    } else {
      root.removeAttribute("data-theme");
    }
  }

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set) return set;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
      toggle.setAttribute("aria-label", "Switch to " + (next === "dark" ? "light" : "dark") + " theme");
    });
  }

  /* ------------------------------------------------------ mobile nav */

  var navBtn = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navBtn && navLinks) {
    navBtn.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", String(open));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        navLinks.classList.remove("open");
        navBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        navLinks.classList.remove("open");
        navBtn.setAttribute("aria-expanded", "false");
        navBtn.focus();
      }
    });
  }

  /* ------------------------------------------- sticky header shadow */

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ------------------------------------------------- reveal on scroll */

  var revealables = document.querySelectorAll(".reveal");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!revealables.length) {
    /* nothing to do */
  } else if (reduced || !("IntersectionObserver" in window)) {
    revealables.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });

    revealables.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 60 + "ms";
      io.observe(el);
    });
  }

  /* ------------------------------------------------------- scroll spy */

  var spyLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav-links a[href^="#"]')
  );
  if (spyLinks.length && "IntersectionObserver" in window) {
    var sections = spyLinks
      .map(function (a) { return document.querySelector(a.getAttribute("href")); })
      .filter(Boolean);

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        spyLinks.forEach(function (a) {
          a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });

    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ------------------------------------------ publication search/filter */

  var pubList = document.getElementById("pub-list");
  if (pubList) {
    var items = Array.prototype.slice.call(pubList.querySelectorAll(".pub"));
    var search = document.getElementById("pub-search");
    var filters = Array.prototype.slice.call(document.querySelectorAll(".filter[data-filter]"));
    var empty = document.getElementById("pub-empty");
    var active = "all";

    function refresh() {
      var q = (search && search.value || "").trim().toLowerCase();
      var shown = 0;

      items.forEach(function (item) {
        var okFilter = active === "all" || item.dataset.type === active || item.dataset.year === active;
        var okQuery = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
        var show = okFilter && okQuery;
        item.hidden = !show;
        if (show) shown++;
      });

      if (empty) empty.hidden = shown !== 0;
    }

    if (search) search.addEventListener("input", refresh);

    filters.forEach(function (btn) {
      btn.addEventListener("click", function () {
        active = btn.dataset.filter;
        filters.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b === btn));
        });
        refresh();
      });
    });

    refresh();
  }

  /* ------------------------------------------------------ copy BibTeX */

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-bibtex]");
    if (!btn) return;

    var text = btn.getAttribute("data-bibtex").replace(/\\n/g, "\n");
    var done = function () {
      var old = btn.textContent;
      btn.textContent = "copied";
      setTimeout(function () { btn.textContent = old; }, 1600);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch (err) { /* ignore */ }
      document.body.removeChild(ta);
      done();
    }
  });

  /* ------------------------------------- pause offscreen looping video */

  var loops = document.querySelectorAll("video[data-autoloop]");
  if (loops.length && "IntersectionObserver" in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay blocked */ });
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    loops.forEach(function (v) { vio.observe(v); });
  }

  /* ------------------------------------------------------ footer year */

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
