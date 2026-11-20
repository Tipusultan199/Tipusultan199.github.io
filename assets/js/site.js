/* Shared behaviour for every page. Loaded with `defer`. */
(function () {
  "use strict";

  var root = document.documentElement;
  var colorScheme = window.matchMedia("(prefers-color-scheme: dark)");

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
    return colorScheme.matches ? "dark" : "light";
  }

  var toggle = document.querySelector(".theme-toggle");
  if (toggle) {
    var updateThemeLabel = function () {
      toggle.setAttribute("aria-label", "Switch to " + (currentTheme() === "dark" ? "light" : "dark") + " theme");
    };
    updateThemeLabel();
    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      applyTheme(next);
      try { localStorage.setItem("theme", next); } catch (e) { /* private mode */ }
      updateThemeLabel();
    });
    if (colorScheme.addEventListener) colorScheme.addEventListener("change", updateThemeLabel);
  }

  /* ------------------------------------------------------ mobile nav */

  var navBtn = document.querySelector(".nav-toggle");
  var navLinks = document.getElementById("nav-links");
  if (navBtn && navLinks) {
    var setMenuOpen = function (open) {
      navLinks.classList.toggle("open", open);
      navBtn.setAttribute("aria-expanded", String(open));
      navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    setMenuOpen(false);
    navBtn.addEventListener("click", function () {
      setMenuOpen(!navLinks.classList.contains("open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) setMenuOpen(false);
    });
    document.addEventListener("click", function (e) {
      if (!navLinks.contains(e.target) && !navBtn.contains(e.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        setMenuOpen(false);
        navBtn.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.getComputedStyle(navBtn).display === "none") setMenuOpen(false);
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
          var active = a.getAttribute("href") === "#" + entry.target.id;
          a.classList.toggle("active", active);
          if (active) a.setAttribute("aria-current", "location");
          else a.removeAttribute("aria-current");
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

  var copyStates = new WeakMap();
  document.querySelectorAll("[data-bibtex]").forEach(function (btn) {
    btn.setAttribute("aria-live", "polite");
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest && e.target.closest("[data-bibtex]");
    if (!btn) return;

    var text = btn.getAttribute("data-bibtex").replace(/\\n/g, "\n");
    var state = copyStates.get(btn);
    if (!state) {
      state = { label: btn.textContent, timer: null };
      copyStates.set(btn, state);
    }
    var feedback = function (copied) {
      if (state.timer) clearTimeout(state.timer);
      btn.textContent = copied ? "Copied" : "Copy failed";
      state.timer = setTimeout(function () { btn.textContent = state.label; }, 1600);
    };

    var fallbackCopy = function () {
      var focused = document.activeElement;
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var copied = false;
      try { copied = document.execCommand("copy"); } catch (err) { /* unavailable */ }
      document.body.removeChild(ta);
      if (focused && focused.focus) focused.focus({ preventScroll: true });
      return copied;
    };

    if (navigator.clipboard && window.isSecureContext) {
      try {
        navigator.clipboard.writeText(text).then(function () { feedback(true); }, function () { feedback(fallbackCopy()); });
      } catch (err) {
        feedback(fallbackCopy());
      }
    } else {
      feedback(fallbackCopy());
    }
  });

  /* ------------------------------------- pause offscreen looping video */

  var loops = document.querySelectorAll("video[data-autoloop]");
  if (loops.length && !reduced && "IntersectionObserver" in window) {
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
