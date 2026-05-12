/* ═══════════════════════════════════════════════════════════════
   Field · Theory — shared runtime
   Exposes window.Field with constants, materials, and UI helpers.
═══════════════════════════════════════════════════════════════ */

(function () {
  const PHYS = {
    e:     1.602e-19,        // elementary charge (C)
    k:     8.9875e9,         // Coulomb constant (N·m²/C²)
    mu_0:  4 * Math.PI * 1e-7, // permeability of free space (T·m/A)
    eps_0: 8.854e-12,        // permittivity of free space (F/m)
    c:     2.998e8,          // speed of light (m/s)
    me:    9.109e-31,        // electron mass (kg)
  };

  // Materials with conductivity σ (S/m) and free-electron density n (1/m³)
  const MATERIALS = {
    copper:    { name: 'Copper',     sigma: 5.96e7, n: 8.50e28 },
    silver:    { name: 'Silver',     sigma: 6.30e7, n: 5.86e28 },
    gold:      { name: 'Gold',       sigma: 4.10e7, n: 5.90e28 },
    aluminum:  { name: 'Aluminum',   sigma: 3.77e7, n: 6.00e28 },
    iron:      { name: 'Iron',       sigma: 1.00e7, n: 1.70e29 },
    tungsten:  { name: 'Tungsten',   sigma: 1.79e7, n: 6.30e28 },
    nichrome:  { name: 'Nichrome',   sigma: 9.09e5, n: 9.00e28 }, // heating element
  };

  /* ─── Formatting helpers ─── */
  // Scientific notation with HTML superscript
  function sci(n, digits = 2) {
    if (n === 0 || !isFinite(n)) return '0';
    const abs = Math.abs(n);
    if (abs >= 1e-2 && abs < 1e4) return n.toFixed(digits);
    const exp = Math.floor(Math.log10(abs));
    const mantissa = n / Math.pow(10, exp);
    return `${mantissa.toFixed(digits)}×10<sup>${exp}</sup>`;
  }

  // Engineering notation with SI prefix
  function eng(n, digits = 3, unit = '') {
    if (n === 0 || !isFinite(n)) return `0${unit ? ' ' + unit : ''}`;
    const prefixes = [
      { exp: -12, sym: 'p' }, { exp: -9, sym: 'n' }, { exp: -6, sym: 'µ' },
      { exp: -3, sym: 'm' },  { exp: 0,  sym: ''  }, { exp: 3,  sym: 'k' },
      { exp: 6,  sym: 'M' },  { exp: 9,  sym: 'G' }, { exp: 12, sym: 'T' },
    ];
    const abs = Math.abs(n);
    const log = Math.log10(abs);
    let chosen = prefixes[4]; // default ''
    for (let i = prefixes.length - 1; i >= 0; i--) {
      if (log >= prefixes[i].exp) { chosen = prefixes[i]; break; }
    }
    const val = n / Math.pow(10, chosen.exp);
    return `${val.toFixed(digits)} ${chosen.sym}${unit}`;
  }

  function pretty(n, digits = 3) {
    if (!isFinite(n)) return '—';
    const abs = Math.abs(n);
    if (abs === 0) return '0';
    if (abs >= 1e-3 && abs < 1e6) return n.toFixed(digits);
    return sci(n, digits);
  }

  /* ─── Slider binding ─── */
  // Binds a range input to a label/value display and a callback.
  // Also auto-updates the --pct CSS var for the gradient track.
  function bindSlider(id, opts) {
    const input = document.getElementById(id);
    const valueEl = document.getElementById(id + '-value');
    if (!input) { console.warn('Slider not found:', id); return null; }

    const format = opts && opts.format ? opts.format : (v) => v.toFixed(2);
    const onChange = opts && opts.onChange ? opts.onChange : () => {};

    function paintTrack() {
      const min = parseFloat(input.min);
      const max = parseFloat(input.max);
      const val = parseFloat(input.value);
      const pct = ((val - min) / (max - min)) * 100;
      input.style.setProperty('--pct', pct + '%');
    }

    function update() {
      const v = parseFloat(input.value);
      if (valueEl) valueEl.textContent = format(v);
      paintTrack();
      onChange(v);
    }

    input.addEventListener('input', update);
    update();
    return { input, set: (v) => { input.value = v; update(); }, get: () => parseFloat(input.value) };
  }

  /* ─── Canvas helpers ─── */
  function resizeCanvas(canvas, container) {
    const dpr = window.devicePixelRatio || 1;
    const target = container || canvas.parentElement;
    const w = target.clientWidth;
    const h = parseInt(canvas.dataset.height || 480);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h, ctx, dpr };
  }

  function autoResize(canvas, onResize) {
    let info = resizeCanvas(canvas);
    onResize(info);
    let raf;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        info = resizeCanvas(canvas);
        onResize(info);
      });
    });
    return info;
  }

  /* ─── Reveal-on-scroll observer ─── */
  function initReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  }

  /* ─── Progress bar ─── */
  function initProgress() {
    const bar = document.getElementById('progress');
    if (!bar) return;
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      bar.style.width = pct + '%';
    });
  }

  window.Field = {
    PHYS, MATERIALS,
    sci, eng, pretty,
    bindSlider, resizeCanvas, autoResize,
    initReveals, initProgress,
  };

  document.addEventListener('DOMContentLoaded', () => {
    window.Field.initReveals();
    window.Field.initProgress();
  });
})();
