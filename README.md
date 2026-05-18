# Lakshay Agarwal — Portfolio

Personal portfolio website showcasing engineering, product design, and research projects — built as a static site with no frameworks.

**Live:** [lakshayaga.github.io](https://lakshayaga.github.io)

---

## Structure

```
portfolio/
├── index.html              # Landing page (hero, about, skills, projects preview, leadership, contact)
├── projects.html           # Full projects listing, categorised by domain
├── script.js               # Shared utilities (copyright year, etc.)
├── styles.css              # Global design system & shared components
├── styles-project.css      # Styles specific to individual project detail pages
│
├── projects/               # Individual project detail pages
│   ├── phone-stand.html    # Ergonomic Phone Stand — PoC with 3D model viewer
│   └── project.html        # Generic "coming soon" page for unbuilt projects
│
├── js/
│   └── model-viewer.js     # Reusable Three.js ModelViewer class
│
└── assets/
    ├── favicon.svg
    ├── iitd-logo.png
    ├── mlvtec-logo.png
    └── models/
        └── phone_stand.glb # 3D model for the phone stand project page
```

---

## Tech Stack

| Concern | Technology |
|---|---|
| Markup | HTML5 (semantic) |
| Styling | Vanilla CSS (custom properties, no framework) |
| Scripting | Vanilla JavaScript (ES Modules) |
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

> **Note:** Three.js uses `fetch` internally to load GLB files. Opening HTML files directly via `file://` will block the request. Use a local HTTP server during development:
> ```bash
> python -m http.server 8080
> ```
> Then open `http://localhost:8080`.

---

## Development

No build step required. Edit files directly and serve with any static HTTP server.

**Recommended workflow (VS Code):**
Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension → right-click any HTML file → *Open with Live Server*. Auto-reloads on every save.

---

## Projects

| Project | Category | Status | Page |
|---|---|---|---|
| Design of Detachable Cannula | Engineering | In Progress | Coming soon |
| Automated Four-Bar Linkage (ML) | Engineering | Completed | Coming soon |
| Lower Limb Exoskeleton | Engineering | Design Phase | Coming soon |
| Spine Exoskeleton Research | Engineering | Completed | Coming soon |
| Ergonomic Mobile Phone Stand | Product Design | Completed | `projects/phone-stand.html` |
| Foldable Ergonomic Laptop Stand | Product Design | Design Phase | Coming soon |
| Terrain Representation | Product Design | Completed | Coming soon |
| Custom Vernier Caliper | Product Design | Completed | Coming soon |
| Development of Refractory Bricks | Research | Completed | Coming soon |
| SAG Web Application Design | Graphic & UI | Completed | Coming soon |
| CreateX 2024 Event Website | Graphic & UI | Completed | Coming soon |
| OpenHack 2024 Event Website | Graphic & UI | Completed | Coming soon |

---

*Built with AI assistance (Google Deepmind Antigravity)*
