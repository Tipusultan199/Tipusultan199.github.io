# tipusultan199.github.io

Personal research portfolio — Tipu Sultan, Ph.D. researcher in safe human–robot teaming,
EEG decoding, multimodal information fusion, vision-language-action models, and assistive robotics
at Saint Louis University (MechaRithm Lab).

**Live site:** https://tipusultan199.github.io/

## What's here

| Page | Contents |
|---|---|
| `index.html` | Concise research homepage with current T-RO and Information Fusion directions, selected projects and publications, bio, and contact |
| `projects/neurocommitssm.html` | NeuroCommitSSM — IROS 2026 |
| `projects/trisafe-trans.html` | TriSaFe-Trans — BioRob 2026 |
| `projects/video-to-robot.html` | Video-to-robot imitation learning — T-RO, in preparation |
| `projects/information-fusion.html` | Reliability-aware fusion — pre-registered, ongoing |

## Structure

```
.
├── index.html
├── 404.html
├── projects/            case-study pages
└── assets/
    ├── css/home.css     focused homepage design
    ├── css/styles.css   shared styling for detailed project pages
    ├── js/site.js       theme toggle, nav, scroll-spy, publication filter, BibTeX copy
    ├── img/
    │   ├── figures/     paper figures (PNG + WebP)
    │   ├── photos/      lab photography, responsive widths
    │   ├── social/      Open Graph and social sharing artwork
    │   └── posters/     video poster frames
    ├── video/           H.264 MP4, web-optimised
    └── docs/            CV and papers (PDF)
```

No build step and no dependencies. It is plain HTML, CSS and vanilla JavaScript, so any static
host will serve it as-is.

## Running it locally

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from the filesystem mostly works, but a server is preferable —
`file://` blocks some resource loads.

## Editing content

- **Text, publications, numbers** — edit the HTML directly; publication entries are plain
  `<li class="pub">` items with `data-type` and `data-year` attributes that drive the filters.
- **Colours and spacing** — the CSS custom properties at the top of `assets/css/styles.css`.
  Light values sit on `:root`; the dark palette is defined twice, once under
  `prefers-color-scheme` and once under `[data-theme="dark"]`, so the manual toggle wins in both
  directions. Change both if you change a colour.
- **New publication** — copy an existing `<li class="pub">` block and update the fields. The
  BibTeX button reads from the `data-bibtex` attribute, where `\n` marks line breaks.

## Media notes

Source videos were HEVC, which Chrome and Firefox will not decode inside MP4. Everything in
`assets/video/` is re-encoded to H.264 (`yuv420p`, `+faststart`) at 720p, taking the payload from
196 MB to 20 MB. Large videos use `preload="none"` with a poster image, so opening a page does not
download them.

## Licence

Code and layout: MIT. Paper figures, PDFs and photographs remain © Tipu Sultan and the respective
publishers, and are included here for academic and portfolio use.
