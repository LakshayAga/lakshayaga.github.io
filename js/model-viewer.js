/**
 * ModelViewer — A self-contained Three.js 3D model viewer.
 *
 * Usage:
 *   import { ModelViewer } from './model-viewer.js';
 *
 *   // Immediate load:
 *   const viewer = new ModelViewer(container, { modelPath: 'assets/models/phone_stand.glb' });
 *
 *   // Deferred load (lazy — call loadModel() after IntersectionObserver fires):
 *   const viewer = new ModelViewer(container);          // shows placeholder immediately
 *   viewer.loadModel('assets/models/phone_stand.glb'); // fetch only when in view
 *
 *   // Cleanup:
 *   viewer.destroy();
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelViewer {
  /**
   * @param {HTMLElement} container
   * @param {object}  [options]
   * @param {string|null} [options.modelPath]      Path to .glb. null → placeholder only.
   * @param {number}  [options.bgColor]            Background colour hex (default matches --bg).
   * @param {boolean} [options.autoRotate]         Auto-rotate until first interaction (default true).
   * @param {number}  [options.autoRotateSpeed]    Rotation speed (default 0.5).
   */
  constructor(container, options = {}) {
    this.container = container;
    this.opts = Object.assign(
      { modelPath: null, bgColor: 0x0e0f12, autoRotate: true, autoRotateSpeed: 0.5 },
      options
    );
    this._rafId = null;
    this._placeholder = null;
    this._modelLoaded = false;
    this._init();
  }

  /* ─────────────────────────────── init ─────────────────────────────── */

  _init() {
    const { container, opts } = this;
    const W = container.clientWidth;
    const H = container.clientHeight;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(opts.bgColor);

    // Camera
    this.camera = new THREE.PerspectiveCamera(42, W / H, 0.01, 1000);
    this.camera.position.set(0, 1.2, 4.5);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(W, H);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(this.renderer.domElement);

    // Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.minDistance = 0.5;
    this.controls.maxDistance = 30;
    this.controls.autoRotate = opts.autoRotate;
    this.controls.autoRotateSpeed = opts.autoRotateSpeed;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; });

    // Lights + ground
    this._setupLights();
    this._addGroundPlane();

    // Always show placeholder immediately — canvas is never blank
    this._addPlaceholder();

    // If a path was provided at construction time, start loading right away
    if (opts.modelPath) {
      this._showLoader();   // make loader visible before fetch starts
      this._fetchGLB(opts.modelPath);
    } else {
      // No model — show placeholder, hide loader
      this._hideLoader();
    }

    // Responsive resize
    this._ro = new ResizeObserver(() => this._onResize());
    this._ro.observe(container);

    // Render loop
    this._animate();
  }

  /* ─────────────────────────────── public API ────────────────────────── */

  /**
   * Start loading a GLB after construction (e.g. triggered by IntersectionObserver).
   * Calling this when a model is already loaded is a no-op.
   * @param {string} path
   */
  loadModel(path) {
    if (this._modelLoaded) return;
    this._showLoader();
    this._fetchGLB(path);
  }

  /* ─────────────────────────────── lighting ─────────────────────────── */

  _setupLights() {
    const s = this.scene;
    s.add(new THREE.AmbientLight(0xffffff, 0.45));

    const key = new THREE.DirectionalLight(0xfff5e8, 2.0);
    key.position.set(4, 8, 5);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = key.shadow.camera.bottom = -6;
    key.shadow.camera.right = key.shadow.camera.top = 6;
    key.shadow.bias = -0.001;
    s.add(key);

    const fill = new THREE.DirectionalLight(0x8ab4f8, 0.5);
    fill.position.set(-5, 2, -3);
    s.add(fill);

    const rim = new THREE.DirectionalLight(0xd4a574, 0.35);
    rim.position.set(0, -4, -6);
    s.add(rim);
  }

  /* ─────────────────────────────── ground ───────────────────────────── */

  _addGroundPlane() {
    const plane = new THREE.Mesh(
      new THREE.CircleGeometry(5, 64),
      new THREE.MeshStandardMaterial({ color: 0x111318, roughness: 0.8 })
    );
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = -1.2;
    plane.receiveShadow = true;
    this.scene.add(plane);
  }

  /* ─────────────────────────────── placeholder ──────────────────────── */

  _addPlaceholder() {
    const geo = new THREE.TorusKnotGeometry(0.72, 0.22, 160, 32, 2, 3);
    const mat = new THREE.MeshStandardMaterial({ color: 0xc8a96e, metalness: 0.75, roughness: 0.18 });
    this._placeholder = new THREE.Mesh(geo, mat);
    this._placeholder.castShadow = true;
    this.scene.add(this._placeholder);
  }

  _removePlaceholder() {
    if (this._placeholder) {
      this.scene.remove(this._placeholder);
      this._placeholder.geometry.dispose();
      this._placeholder.material.dispose();
      this._placeholder = null;
    }
  }

  /* ─────────────────────────────── GLB loader ───────────────────────── */

  _fetchGLB(path) {
    console.log('[ModelViewer] Starting GLB fetch:', path);

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');

    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      path,
      (gltf) => {
        console.log('[ModelViewer] GLB loaded successfully:', path);
        const model = gltf.scene;

        const box = new THREE.Box3().setFromObject(model);
        const centre = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const scale = 2.0 / Math.max(size.x, size.y, size.z);

        model.scale.setScalar(scale);
        model.position.x = -centre.x * scale;
        model.position.y = -centre.y * scale + (-1.2 + (size.y * scale) / 2);
        model.position.z = -centre.z * scale;

        model.traverse((child) => {
          if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
        });

        this._removePlaceholder();
        this.scene.add(model);
        this._modelLoaded = true;
        this._hideLoader();
        dracoLoader.dispose();
      },
      (xhr) => {
        if (xhr.total > 0) {
          // Server sent Content-Length — show percentage
          const pct = Math.round((xhr.loaded / xhr.total) * 100);
          this._setLoaderLabel(`${pct}%`);
        } else if (xhr.loaded > 0) {
          // No Content-Length (Python http.server) — show MB received
          const mb = (xhr.loaded / 1048576).toFixed(1);
          this._setLoaderLabel(`${mb} MB…`);
        }
      },
      (err) => {
        console.error('[ModelViewer] GLB load error:', err);
        this._hideLoader();
        dracoLoader.dispose();
      }
    );
  }

  /* ─────────────────────────────── loader UI ────────────────────────── */

  _showLoader() {
    const el = this.container.querySelector('[data-loader-overlay]');
    if (el) { el.style.opacity = '1'; el.style.pointerEvents = 'auto'; }
  }

  _setLoaderLabel(text) {
    const el = this.container.querySelector('[data-loader-pct]');
    if (el) el.textContent = text;
  }

  _hideLoader() {
    const el = this.container.querySelector('[data-loader-overlay]');
    if (!el) return;
    el.style.opacity = '0';
    el.style.pointerEvents = 'none';
    setTimeout(() => el.remove(), 600);
  }

  /* ─────────────────────────────── resize ───────────────────────────── */

  _onResize() {
    const W = this.container.clientWidth;
    const H = this.container.clientHeight;
    if (!W || !H) return;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }

  /* ─────────────────────────────── loop ─────────────────────────────── */

  _animate() {
    this._rafId = requestAnimationFrame(() => this._animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  /* ─────────────────────────────── cleanup ──────────────────────────── */

  destroy() {
    if (this._rafId) cancelAnimationFrame(this._rafId);
    this._ro.disconnect();
    this.controls.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
