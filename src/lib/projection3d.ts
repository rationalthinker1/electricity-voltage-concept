/**
 * Tiny 3D projection utility for the textbook's 3D demos.
 *
 * No deps. No Three.js. Pure-functional helpers to project 3D points to 2D
 * canvas pixels through a simple orbital camera (yaw, pitch, distance). The
 * pedagogical 3D demos in this project (Poynting around a coax, 3D dipole
 * radiation pattern, etc.) all share this projection so the visual style
 * stays consistent.
 *
 * Conventions
 * ───────────
 * - Right-handed coordinates: +x right, +y up, +z out of the screen at
 *   yaw=0, pitch=0.
 * - Yaw rotates around the world +y axis (camera orbits horizontally).
 * - Pitch rotates around the world +x axis after yaw (camera orbits
 *   vertically).
 * - Camera looks at the world origin; distance is along the camera's local
 *   forward axis.
 * - Perspective projection with field-of-view in radians (default π/4 ≈ 45°).
 *
 * The companion drag-to-rotate handler is exported as `attachOrbit` —
 * wire it inside an AutoResizeCanvas setup() callback to get mouse +
 * touch orbiting for free.
 */

export interface Vec3 { x: number; y: number; z: number }

export interface Point2D { x: number; y: number; depth: number }

export interface OrbitCamera {
  /** Rotation around world +y, radians. */
  yaw: number;
  /** Rotation around world +x (after yaw), radians. [-π/2, π/2] */
  pitch: number;
  /** Distance from origin along camera-forward. */
  distance: number;
  /** Field-of-view, radians. */
  fov: number;
}

export function v3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

export function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

export function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function scale(a: Vec3, s: number): Vec3 {
  return { x: a.x * s, y: a.y * s, z: a.z * s };
}

export function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

export function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function length(a: Vec3): number {
  return Math.sqrt(a.x * a.x + a.y * a.y + a.z * a.z);
}

export function normalize(a: Vec3): Vec3 {
  const l = length(a);
  return l === 0 ? { x: 0, y: 0, z: 0 } : scale(a, 1 / l);
}

/**
 * Project a world-space 3D point onto canvas-space pixels through the orbit
 * camera. The returned `depth` is the camera-space z (smaller = closer to
 * the eye); use it to sort painter-algorithm-style or to skip points behind
 * the camera (depth ≤ 0).
 */
export function project(p: Vec3, cam: OrbitCamera, w: number, h: number): Point2D {
  // Rotate world point into camera space.
  // Yaw around y: x' = x cos - z sin; z' = x sin + z cos
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  let x = p.x * cy - p.z * sy;
  let z = p.x * sy + p.z * cy;
  let y = p.y;
  // Pitch around the camera's x-axis: y'' = y cos - z sin; z'' = y sin + z cos
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  const ynew = y * cp - z * sp;
  const znew = y * sp + z * cp;
  y = ynew;
  z = znew;
  // Translate so camera sits at +cam.distance on its local z axis.
  const depth = cam.distance - z;
  // Perspective divide.
  const focal = (Math.min(w, h) / 2) / Math.tan(cam.fov / 2);
  const sx = depth > 0 ? (x / depth) * focal : x * focal;
  const sy2 = depth > 0 ? (-y / depth) * focal : -y * focal;
  return { x: w / 2 + sx, y: h / 2 + sy2, depth };
}

/**
 * Painter's-algorithm helper. Given an array of items each carrying a 3D
 * anchor point, returns the indices in back-to-front order under the
 * supplied camera (largest depth first).
 */
export function depthSortIndices<T extends { anchor: Vec3 }>(
  items: T[], cam: OrbitCamera, w: number, h: number,
): number[] {
  const depths = items.map((it, i) => ({ i, d: project(it.anchor, cam, w, h).depth }));
  depths.sort((a, b) => b.d - a.d);
  return depths.map(d => d.i);
}

/**
 * Attach drag-to-rotate handlers to a canvas. The caller owns the camera
 * ref (the demo's stateRef); this just mutates `cam.yaw` and `cam.pitch`
 * as the user drags. Returns a cleanup function that removes the listeners.
 *
 * Usage inside an AutoResizeCanvas setup callback:
 *
 *   const cam: OrbitCamera = { yaw: 0.4, pitch: 0.25, distance: 4, fov: Math.PI/4 };
 *   const dispose = attachOrbit(canvas, cam);
 *   // ...rAF draw loop reads cam.yaw / cam.pitch...
 *   return () => { dispose(); cancelAnimationFrame(raf); };
 */
export function attachOrbit(canvas: HTMLCanvasElement, cam: OrbitCamera): () => void {
  let dragging = false;
  let lastX = 0, lastY = 0;
  const PITCH_MAX = Math.PI / 2 - 0.05;

  function down(x: number, y: number) {
    dragging = true; lastX = x; lastY = y;
    canvas.style.cursor = 'grabbing';
  }
  function move(x: number, y: number) {
    if (!dragging) return;
    const dx = x - lastX, dy = y - lastY;
    lastX = x; lastY = y;
    cam.yaw += dx * 0.01;
    cam.pitch = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, cam.pitch + dy * 0.01));
  }
  function up() {
    dragging = false;
    canvas.style.cursor = 'grab';
  }

  function onMouseDown(e: MouseEvent) { const r = canvas.getBoundingClientRect(); down(e.clientX - r.left, e.clientY - r.top); }
  function onMouseMove(e: MouseEvent) { const r = canvas.getBoundingClientRect(); move(e.clientX - r.left, e.clientY - r.top); }
  function onMouseUp() { up(); }

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    down(e.touches[0]!.clientX - r.left, e.touches[0]!.clientY - r.top);
  }
  function onTouchMove(e: TouchEvent) {
    if (e.touches.length === 0) return;
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    move(e.touches[0]!.clientX - r.left, e.touches[0]!.clientY - r.top);
  }
  function onTouchEnd() { up(); }

  canvas.style.cursor = 'grab';
  canvas.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('touchstart', onTouchStart, { passive: false });
  canvas.addEventListener('touchmove', onTouchMove, { passive: false });
  canvas.addEventListener('touchend', onTouchEnd);

  return () => {
    canvas.removeEventListener('mousedown', onMouseDown);
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
    canvas.removeEventListener('touchstart', onTouchStart);
    canvas.removeEventListener('touchmove', onTouchMove);
    canvas.removeEventListener('touchend', onTouchEnd);
    canvas.style.cursor = '';
  };
}
