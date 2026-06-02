# Lakshay Agarwal — Portfolio

Personal portfolio website showcasing engineering, product design, and research projects — built as a static site with no frameworks.

**Live:** [lakshayaga.github.io](https://lakshayaga.github.io)

---

## Structure

```
portfolio/
├── index.html              # Structural skeleton — all text loaded dynamically from data/
├── projects.html           # Full projects listing, categorised by domain
├── script.js               # Shared year utility (used by project detail pages)
├── styles.css              # Global design system & shared components
├── styles-project.css      # Styles specific to individual project detail pages
│
├── data/
│   └── site-content.json   # ← Edit this file to update all landing page content
│
├── js/
│   ├── home-loader.js      # Fetches site-content.json and populates index.html
│   └── model-viewer.js     # Reusable Three.js GLB model viewer class
│
├── projects/               # Individual project detail pages
│   ├── phone-stand.html    # Ergonomic Phone Stand — custom layout with 3D model viewer
│   └── project.html        # "Coming soon" placeholder for unbuilt project pages
│
└── assets/
    ├── favicon.svg
    ├── iitd-logo.png
    ├── mlvtec-logo.png
    └── models/
        └── phone_stand.glb # 3D model for the phone stand project page
```

---

## Editing Landing Page Content

All visible text on the home page is controlled from a **single file**: [`data/site-content.json`](data/site-content.json).

To update any content on the homepage, open that file and edit the relevant section. **No HTML or JavaScript knowledge is needed.**

| Section in JSON | What it controls on the page |
|---|---|
| `hero` | Name, tagline, intro paragraph, button labels |
| `about` | The About section paragraphs |
| `skills` | The skill category cards (title + tools list) |
| `projects` | Project entries shown in the Projects preview |
| `leadership` | Leadership experience entries |
| `education` | Education history rows (institution, degree, dates) |
| `contact` | Intro text and contact link list (email, phone, LinkedIn, GitHub) |

> **Note:** Because the page loads content via a network request, you must use a local web server to preview changes. Opening `index.html` directly via `file://` will show empty sections. See the **Development** section below.

---

## Tech Stack

| Concern | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, no framework) |
| Scripting | Vanilla JavaScript (ES Modules) |
| Content | JSON (`data/site-content.json`) loaded at runtime via `fetch` |
| 3D Rendering | [Three.js r165](https://threejs.org/) via CDN import map |
| 3D Controls | Three.js OrbitControls (drag, zoom, pan) |
| Model Format | GLTF / GLB with optional Draco compression |
| Fonts | Google Fonts — Inter, Space Grotesk |

---

## 3D Model Viewer

Individual project pages can embed an interactive Three.js canvas mid-page via the `ModelViewer` class in `js/model-viewer.js`.

**Features:**
- Accepts any `.glb` file path; falls back to a procedural placeholder if the model fails to load
- Auto-centres and scales the model to fit the viewport
- OrbitControls: drag to rotate, scroll to zoom, right-click to pan
- Auto-rotates until the user first interacts
- Draco decompression support (via Google's decoder CDN)
- Graceful resize via `ResizeObserver`

**Adding a 3D model to a project page:**
```js
import { ModelViewer } from '../js/model-viewer.js';

const viewer = new ModelViewer(
  document.getElementById('model-viewer-container'),
  { modelPath: '../assets/models/your_model.glb' }
);

// Clean up on page unload
window.addEventListener('pagehide', () => viewer.destroy());
```

**Exporting models:** Any CAD tool (SolidWorks, Fusion 360, Blender) can export to `.glb`. To compress a model significantly (~60–80% smaller), run:
```bash
npx @gltf-transform/cli optimize assets/models/your_model.glb assets/models/your_model.glb --compress draco
```

> **Note:** Three.js uses `fetch` internally to load GLB files. Opening HTML files directly via `file://` will block the request. Use a local HTTP server during development (see below).

---

## Development

No build step required. Edit files directly and serve with any static HTTP server.

**Quick start:**
```bash
python -m http.server 8080
```
Then open `http://localhost:8080` in your browser.

> This is required for both the 3D model viewer and the dynamic content system — both use `fetch`, which does not work with `file://` URLs.

**Recommended workflow (VS Code):**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension → right-click `index.html` → *Open with Live Server*. Auto-reloads on every save, and serves over HTTP automatically.

---

## Projects

| Project | Category | Status | Page |
|---|---|---|---|
| Automated Four-Bar Linkage (ML) | Engineering | Completed | Coming soon |
| Exoskeleton Design: Lower Limb & Spine Research | Engineering | Design Phase | Coming soon |
| Development of Refractory Bricks using Mining Waste | Research | Completed | Coming soon |
| SAG Web Application Design | Graphic & UI | Completed | Coming soon |
| Ergonomic Mobile Phone Stand | Product Design | Completed | `projects/phone-stand.html` |
| Foldable Ergonomic Laptop Stand | Product Design | Design Phase | Coming soon |

---

*Built with AI assistance (Google DeepMind Antigravity)*
