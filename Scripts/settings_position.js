document.addEventListener("DOMContentLoaded", function () {

  const BUILTIN_META = {
    "greeting-display":    { label: "Greeting",   color: "#00b894", key: "pos_greeting-display" },
    "clock":               { label: "Clock",       color: "#0984e3", key: "pos_clock"            },
    "search-box":          { label: "Search Bar",  color: "#6c5ce7", key: "pos_search-box"       },
    "quick-links-section": { label: "Quick Links", color: "#e17055", key: "pos_quick-links"      },
    "weather-widget":      { label: "Weather",     color: "#00cec9", key: "pos_weather"          },
  };

  // px / py: screen position of the origin point, as a % of the viewport.
  // ox / oy: the origin point as a fraction of the widget box (0..1). This is
  // the spot that stays pinned when the content resizes - so a text field whose
  // length changes (greeting, clock) grows AWAY from the origin instead of
  // shrinking toward its own center. Default origin is the center (0.5, 0.5).
  const DEFAULTS = {
    "greeting-display":    { px: 50, py: 41, ox: 0.5, oy: 0.5 },
    "clock":               { px: 50, py: 50, ox: 0.5, oy: 0.5 },
    "search-box":          { px: 50, py: 70, ox: 0.5, oy: 0.5 },
    "quick-links-section": { px: 50, py: 60, ox: 0.5, oy: 0.5 },
    "weather-widget":      { px: 0,  py: 0,  ox: 0.5, oy: 0.5 },
    "spotify-widget":      { px: 10, py: 88, ox: 0.5, oy: 0.5 },
  };

  const STYLE_OVERRIDES = {
    "weather-widget": { position: "relative", top: "auto", left: "auto" },
  };

  const num = (v, d) => (typeof v === "number" && isFinite(v) ? v : d);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function buildRegistry() {
    const reg = {};
    Object.entries(BUILTIN_META).forEach(([id, meta]) => {
      if (document.getElementById(id)) reg[id] = meta;
    });
    document.querySelectorAll("[data-widget]").forEach(el => {
      const id = el.dataset.widget;
      if (!reg[id]) {
        reg[id] = {
          label: el.dataset.widgetLabel || id,
          color: el.dataset.widgetColor || "#a29bfe",
          key:   `pos_${id}`,
        };
        if (!DEFAULTS[id]) DEFAULTS[id] = { px: 50, py: 50, ox: 0.5, oy: 0.5 };
      }
    });
    return reg;
  }

  const canvas = document.getElementById("layout-canvas");

  function getWrapper(id) {
    let el = document.getElementById(`lw-${id}`);
    if (!el) {
      el = document.createElement("div");
      el.className = "layout-widget";
      el.id = `lw-${id}`;
      canvas.appendChild(el);
    }
    return el;
  }

  // ---- migration from the older saved formats -------------------------------

  // legacy 9-point anchor system: {anchor, dx, dy, scale}
  const LEGACY_ANCHORS = {
    "top-left":      (W, H) => [0,     0    ],
    "top-center":    (W, H) => [W / 2, 0    ],
    "top-right":     (W, H) => [W,     0    ],
    "center-left":   (W, H) => [0,     H / 2],
    "center":        (W, H) => [W / 2, H / 2],
    "center-right":  (W, H) => [W,     H / 2],
    "bottom-left":   (W, H) => [0,     H    ],
    "bottom-center": (W, H) => [W / 2, H    ],
    "bottom-right":  (W, H) => [W,     H    ],
  };
  const LEGACY_FRAC = {
    "top-left":      [0,   0  ], "top-center":    [0.5, 0  ], "top-right":    [1,   0  ],
    "center-left":   [0,   0.5], "center":        [0.5, 0.5], "center-right": [1,   0.5],
    "bottom-left":   [0,   1  ], "bottom-center": [0.5, 1  ], "bottom-right": [1,   1  ],
  };

  function migrateAnchor(p) {
    const W = window.innerWidth, H = window.innerHeight;
    const [ax, ay] = LEGACY_ANCHORS[p.anchor](W, H);
    const [fx, fy] = LEGACY_FRAC[p.anchor];
    const cx = ax + num(p.dx, 0), cy = ay + num(p.dy, 0);
    return { px: (cx / W) * 100, py: (cy / H) * 100, ox: fx, oy: fy, scale: num(p.scale, 1) };
  }

  // oldest format: {x, y} as a centered % position
  function migrateXY(p) {
    return { px: num(p.x, 50), py: num(p.y, 50), ox: 0.5, oy: 0.5, scale: num(p.scale, 1) };
  }

  function getSavedPos(meta, id) {
    try {
      const p = JSON.parse(localStorage.getItem(meta.key));
      if (p) {
        if (typeof p.px === "number" && typeof p.ox === "number") {
          return {
            px: p.px, py: num(p.py, 50),
            ox: clamp(num(p.ox, 0.5), 0, 1), oy: clamp(num(p.oy, 0.5), 0, 1),
            scale: num(p.scale, 1),
          };
        }
        if (p.anchor && LEGACY_ANCHORS[p.anchor]) return migrateAnchor(p);
        if (typeof p.x === "number")              return migrateXY(p);
      }
    } catch {}
    const d = DEFAULTS[id] || { px: 50, py: 50, ox: 0.5, oy: 0.5 };
    return { px: d.px, py: d.py, ox: num(d.ox, 0.5), oy: num(d.oy, 0.5), scale: 1 };
  }

  // ---- applying a position --------------------------------------------------

  // transform-origin must match the origin point so scale() grows from the
  // pinned spot, and the translate shifts the box so its (ox,oy) point lands on
  // the left/top coordinate we set.
  function applyOriginStyles(wrapper, ox, oy, scale) {
    wrapper.style.transformOrigin = `${ox * 100}% ${oy * 100}%`;
    wrapper.style.transform = `translate(${-ox * 100}%, ${-oy * 100}%) scale(${scale})`;
  }

  function applyPosition(id, px, py, ox, oy, scale = 1) {
    const wrapper = getWrapper(id);
    wrapper.dataset.px    = px;
    wrapper.dataset.py    = py;
    wrapper.dataset.ox    = ox;
    wrapper.dataset.oy    = oy;
    wrapper.dataset.scale = scale;
    wrapper.style.left = `${px}%`;
    wrapper.style.top  = `${py}%`;
    applyOriginStyles(wrapper, ox, oy, scale);
    const native = document.getElementById(id);
    if (native && native.parentNode !== wrapper) {
      if (STYLE_OVERRIDES[id]) Object.assign(native.style, STYLE_OVERRIDES[id]);
      wrapper.appendChild(native);
    }
    if (!dragActive) reflowWidget(wrapper);
  }

  // re-clamp the saved origin so the box stays on screen; the stored px/py are
  // the intent and are read fresh every time, so clamping never accumulates.
  function reflowWidget(wrapper) {
    const px = parseFloat(wrapper.dataset.px);
    const py = parseFloat(wrapper.dataset.py);
    const ox = parseFloat(wrapper.dataset.ox);
    const oy = parseFloat(wrapper.dataset.oy);
    if (!isFinite(px) || !isFinite(py)) return;
    const W = window.innerWidth, H = window.innerHeight, m = 4;
    const rect = wrapper.getBoundingClientRect();
    const w = rect.width, h = rect.height;
    let cx = (px / 100) * W, cy = (py / 100) * H;
    cx = clamp(cx, m + ox * w, W - m - (1 - ox) * w);
    cy = clamp(cy, m + oy * h, H - m - (1 - oy) * h);
    wrapper.style.left = `${(cx / W) * 100}%`;
    wrapper.style.top  = `${(cy / H) * 100}%`;
  }

  function loadPositions() {
    const reg = buildRegistry();
    Object.entries(reg).forEach(([id, meta]) => {
      const pos = getSavedPos(meta, id);
      applyPosition(id, pos.px, pos.py, pos.ox, pos.oy, pos.scale);
    });
  }

  let dragActive = false;
  let snapshot   = {};
  const cleanups  = [];
  const shieldMap = new Map();

  const SNAP_THRESHOLD = 6;
  const ORIGIN_SNAP    = 0.12;       // snap origin to 0 / 0.5 / 1 within 12% of the box
  const SCALE_MIN = 0.4, SCALE_MAX = 3;
  let snapEnabled = localStorage.getItem("lge_snap") !== "false";
  let guideV = null, guideH = null;

  const snapFrac = f => {
    for (const t of [0, 0.5, 1]) if (Math.abs(f - t) <= ORIGIN_SNAP) return t;
    return f;
  };

  function deoverlap() {
    const GAP = 6, H = window.innerHeight;
    const items = Array.from(document.querySelectorAll(".layout-widget"))
      .map(el => ({ el, r: el.getBoundingClientRect() }))
      .filter(it => it.r.width > 0 && it.r.height > 0)
      .sort((a, b) => a.r.top - b.r.top);

    for (let i = 1; i < items.length; i++) {
      const a = items[i];
      let minTop = -Infinity;
      for (let j = 0; j < i; j++) {
        const b = items[j];
        const overlapX = a.r.right > b.r.left && a.r.left < b.r.right;
        if (overlapX) minTop = Math.max(minTop, b.r.bottom + GAP);
      }
      if (minTop > -Infinity && a.r.top < minTop) {
        const centerPx = a.r.top + a.r.height / 2 + (minTop - a.r.top);
        a.el.style.top = `${(centerPx / H) * 100}%`;
        a.r = a.el.getBoundingClientRect();
      }
    }
  }

  let reflowScheduled = false;
  function reflowAll() {
    reflowScheduled = false;
    if (dragActive) return;
    document.querySelectorAll(".layout-widget").forEach(reflowWidget);
    deoverlap();
  }
  function scheduleReflow() {
    if (reflowScheduled || dragActive) return;
    reflowScheduled = true;
    requestAnimationFrame(reflowAll);
  }

  loadPositions();
  window.addEventListener("resize", scheduleReflow);

  // re-clamp on content resize too, not just window resize (greeting text length varies a lot)
  const contentResizeObserver = new ResizeObserver(scheduleReflow);
  Object.keys(buildRegistry()).forEach(id => {
    const native = document.getElementById(id);
    if (native) contentResizeObserver.observe(native);
  });

  let initialReflowDone = false;
  function initialReflow() {
    if (initialReflowDone) return;
    initialReflowDone = true;
    reflowAll();
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initialReflow);
  }
  window.addEventListener("load", () => {
    setTimeout(initialReflow, 150);
  });

  function setGuide(axis, pos, start, end) {
    const g = axis === "v" ? guideV : guideH;
    if (!g) return;
    if (pos == null) { g.classList.remove("lge-guide-visible"); return; }
    if (axis === "v") {
      g.style.left   = `${pos}px`;
      g.style.top    = `${start}px`;
      g.style.height = `${end - start}px`;
    } else {
      g.style.top   = `${pos}px`;
      g.style.left  = `${start}px`;
      g.style.width = `${end - start}px`;
    }
    g.classList.add("lge-guide-visible");
  }

  function bestSnap(points, targets) {
    let best = null;
    for (const p of points) {
      for (const t of targets) {
        const d = t.pos - p;
        if (Math.abs(d) <= SNAP_THRESHOLD && (!best || Math.abs(d) < Math.abs(best.delta)))
          best = { delta: d, pos: t.pos, min: t.min, max: t.max };
      }
    }
    return best;
  }

  function coverRect(el, rect) {
    el.style.left   = `${rect.left}px`;
    el.style.top    = `${rect.top}px`;
    el.style.width  = `${rect.width}px`;
    el.style.height = `${rect.height}px`;
  }

  // place the origin dot at the (ox,oy) point of the native box, in screen px
  function positionOrigin(dot, native, wrapper) {
    const r  = native.getBoundingClientRect();
    const ox = parseFloat(wrapper.dataset.ox);
    const oy = parseFloat(wrapper.dataset.oy);
    dot.style.left = `${r.left + ox * r.width}px`;
    dot.style.top  = `${r.top  + oy * r.height}px`;
  }

  function syncAllShields() {
    shieldMap.forEach(({ shield, label, origin, native, wrapper }) => {
      const r = native.getBoundingClientRect();
      coverRect(shield, r);
      label.style.left = `${r.left + r.width / 2}px`;
      label.style.top  = `${r.top - 22}px`;
      positionOrigin(origin, native, wrapper);
    });
  }

  function isHidden(el) {
    const r  = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return (
      (r.width === 0 && r.height === 0) ||
      cs.display     === "none"   ||
      cs.visibility  === "hidden" ||
      cs.opacity     === "0"
    );
  }

  function buildShields(reg) {
    guideV = document.createElement("div");
    guideV.className = "lge-guide lge-guide-v";
    guideH = document.createElement("div");
    guideH.className = "lge-guide lge-guide-h";
    document.body.append(guideV, guideH);

    Object.entries(reg).forEach(([id, meta]) => {
      const native = document.getElementById(id);
      if (!native || isHidden(native)) return;

      const rect    = native.getBoundingClientRect();
      const wrapper = getWrapper(id);
      wrapper.classList.add("lge-draggable");

      const shield = document.createElement("div");
      shield.className = "lge-input-shield";
      coverRect(shield, rect);
      document.body.appendChild(shield);

      const handle = document.createElement("div");
      handle.className = "lge-resize-handle";
      shield.appendChild(handle);

      // draggable origin point - the spot that stays pinned when content resizes
      const origin = document.createElement("div");
      origin.className = "lge-origin-handle";
      origin.style.background = meta.color;
      document.body.appendChild(origin);
      positionOrigin(origin, native, wrapper);

      const label = document.createElement("div");
      label.className = "lge-drag-label";
      label.textContent = meta.label;
      label.style.color     = meta.color;
      label.style.left      = `${rect.left + rect.width / 2}px`;
      label.style.top       = `${rect.top - 22}px`;
      label.style.transform = "translateX(-50%)";
      document.body.appendChild(label);

      wrapper.querySelectorAll("input, button, a, select, textarea").forEach(el => {
        if ("lgeTabIndex" in el.dataset) return;
        el.dataset.lgeTabIndex = el.tabIndex;
        el.tabIndex = -1;
      });

      let startMx, startMy, startCx, startCy, targets;

      function syncShield() {
        const r = native.getBoundingClientRect();
        coverRect(shield, r);
        label.style.left = `${r.left + r.width / 2}px`;
        label.style.top  = `${r.top - 22}px`;
        positionOrigin(origin, native, wrapper);
      }

      function collectTargets() {
        const W = window.innerWidth, H = window.innerHeight;
        const xs = [0, W / 2, W].map(pos => ({ pos, min: 0, max: H }));
        const ys = [0, H / 2, H].map(pos => ({ pos, min: 0, max: W }));
        shieldMap.forEach((entry, otherId) => {
          if (otherId === id) return;
          const r = entry.native.getBoundingClientRect();
          [r.left, r.left + r.width / 2, r.right].forEach(pos =>
            xs.push({ pos, min: r.top, max: r.bottom }));
          [r.top, r.top + r.height / 2, r.bottom].forEach(pos =>
            ys.push({ pos, min: r.left, max: r.right }));
        });
        return { xs, ys };
      }

      // ---- moving the whole widget ----
      function onMove(e) {
        const client = e.touches ? e.touches[0] : e;
        const W = window.innerWidth, H = window.innerHeight;
        const ox = parseFloat(wrapper.dataset.ox), oy = parseFloat(wrapper.dataset.oy);
        let cx = startCx + (client.clientX - startMx);
        let cy = startCy + (client.clientY - startMy);

        const r = native.getBoundingClientRect();
        const left = cx - ox * r.width,  right  = cx + (1 - ox) * r.width;
        const top  = cy - oy * r.height, bottom = cy + (1 - oy) * r.height;

        if (snapEnabled) {
          const sx = bestSnap([left, cx, right], targets.xs);
          const sy = bestSnap([top, cy, bottom], targets.ys);
          if (sx) cx += sx.delta;
          if (sy) cy += sy.delta;

          if (sx) setGuide("v", sx.pos, Math.min(sx.min, top), Math.max(sx.max, bottom));
          else    setGuide("v", null);
          if (sy) setGuide("h", sy.pos, Math.min(sy.min, left), Math.max(sy.max, right));
          else    setGuide("h", null);
        }

        const m = 4;
        cx = clamp(cx, m + ox * r.width,  W - m - (1 - ox) * r.width);
        cy = clamp(cy, m + oy * r.height, H - m - (1 - oy) * r.height);

        const px = (cx / W) * 100, py = (cy / H) * 100;
        wrapper.style.left = `${px}%`;
        wrapper.style.top  = `${py}%`;
        wrapper.dataset.px = px;
        wrapper.dataset.py = py;
        syncShield();
      }

      function onUp() {
        wrapper.classList.remove("lge-dragging");
        shield.classList.remove("lge-shield-dragging");
        setGuide("v", null);
        setGuide("h", null);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup",   onUp);
        window.removeEventListener("touchmove", onMove);
        window.removeEventListener("touchend",  onUp);
      }

      function onDown(e) {
        e.preventDefault();
        const client = e.touches ? e.touches[0] : e;
        startMx = client.clientX;
        startMy = client.clientY;
        startCx = (parseFloat(wrapper.style.left) / 100) * window.innerWidth;
        startCy = (parseFloat(wrapper.style.top)  / 100) * window.innerHeight;
        targets = collectTargets();
        wrapper.classList.add("lge-dragging");
        shield.classList.add("lge-shield-dragging");
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup",   onUp);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend",  onUp);
      }

      // ---- dragging the origin point (box stays put, only the pin moves) ----
      function onOriginMove(e) {
        const client = e.touches ? e.touches[0] : e;
        const W = window.innerWidth, H = window.innerHeight;
        const r = native.getBoundingClientRect();
        let ox = r.width  ? (client.clientX - r.left) / r.width  : 0.5;
        let oy = r.height ? (client.clientY - r.top)  / r.height : 0.5;
        ox = clamp(snapFrac(ox), 0, 1);
        oy = clamp(snapFrac(oy), 0, 1);

        // keep the box exactly where it is: the origin screen point is just the
        // (ox,oy) spot of the current box, and that becomes the new px/py.
        const cx = r.left + ox * r.width;
        const cy = r.top  + oy * r.height;
        const px = (cx / W) * 100, py = (cy / H) * 100;

        wrapper.dataset.ox = ox;
        wrapper.dataset.oy = oy;
        wrapper.dataset.px = px;
        wrapper.dataset.py = py;
        wrapper.style.left = `${px}%`;
        wrapper.style.top  = `${py}%`;
        applyOriginStyles(wrapper, ox, oy, parseFloat(wrapper.dataset.scale) || 1);

        setGuide("v", cx, r.top, r.bottom);
        setGuide("h", cy, r.left, r.right);
        syncShield();
      }

      function onOriginUp() {
        shield.classList.remove("lge-shield-dragging");
        origin.classList.remove("lge-origin-dragging");
        setGuide("v", null);
        setGuide("h", null);
        window.removeEventListener("mousemove", onOriginMove);
        window.removeEventListener("mouseup",   onOriginUp);
        window.removeEventListener("touchmove", onOriginMove);
        window.removeEventListener("touchend",  onOriginUp);
      }

      function onOriginDown(e) {
        e.preventDefault();
        e.stopPropagation();
        origin.classList.add("lge-origin-dragging");
        shield.classList.add("lge-shield-dragging");
        label.classList.add("lge-label-visible");
        window.addEventListener("mousemove", onOriginMove);
        window.addEventListener("mouseup",   onOriginUp);
        window.addEventListener("touchmove", onOriginMove, { passive: false });
        window.addEventListener("touchend",  onOriginUp);
      }

      // ---- resizing (scale grows from the origin point) ----
      let rsOx, rsOy, rsStartDist, rsStartScale;

      function onResizeMove(e) {
        const client = e.touches ? e.touches[0] : e;
        const dist = Math.hypot(client.clientX - rsOx, client.clientY - rsOy);
        const scale = clamp(rsStartScale * (dist / rsStartDist), SCALE_MIN, SCALE_MAX);
        applyOriginStyles(wrapper, parseFloat(wrapper.dataset.ox), parseFloat(wrapper.dataset.oy), scale);
        wrapper.dataset.scale = scale;
        syncShield();
      }

      function onResizeUp() {
        wrapper.classList.remove("lge-dragging");
        shield.classList.remove("lge-shield-dragging");
        window.removeEventListener("mousemove", onResizeMove);
        window.removeEventListener("mouseup",   onResizeUp);
        window.removeEventListener("touchmove", onResizeMove);
        window.removeEventListener("touchend",  onResizeUp);
      }

      function onResizeDown(e) {
        e.preventDefault();
        e.stopPropagation();
        const client = e.touches ? e.touches[0] : e;
        const r = native.getBoundingClientRect();
        const ox = parseFloat(wrapper.dataset.ox), oy = parseFloat(wrapper.dataset.oy);
        rsOx = r.left + ox * r.width;   // measure distance from the pinned origin
        rsOy = r.top  + oy * r.height;
        rsStartScale = parseFloat(wrapper.dataset.scale) || 1;
        rsStartDist = Math.hypot(client.clientX - rsOx, client.clientY - rsOy) || 1;
        wrapper.classList.add("lge-dragging");
        shield.classList.add("lge-shield-dragging");
        window.addEventListener("mousemove", onResizeMove);
        window.addEventListener("mouseup",   onResizeUp);
        window.addEventListener("touchmove", onResizeMove, { passive: false });
        window.addEventListener("touchend",  onResizeUp);
      }

      shieldMap.set(id, { shield, label, origin, native, wrapper });

      shield.addEventListener("mouseenter", () => label.classList.add("lge-label-visible"));
      shield.addEventListener("mouseleave", () => {
        if (!shield.classList.contains("lge-shield-dragging"))
          label.classList.remove("lge-label-visible");
      });
      shield.addEventListener("mousedown",  onDown);
      shield.addEventListener("touchstart", onDown, { passive: false });
      handle.addEventListener("mousedown",  onResizeDown);
      handle.addEventListener("touchstart", onResizeDown, { passive: false });
      origin.addEventListener("mousedown",  onOriginDown);
      origin.addEventListener("touchstart", onOriginDown, { passive: false });

      cleanups.push(() => {
        shield.removeEventListener("mousedown",  onDown);
        shield.removeEventListener("touchstart", onDown);
        handle.removeEventListener("mousedown",  onResizeDown);
        handle.removeEventListener("touchstart", onResizeDown);
        origin.removeEventListener("mousedown",  onOriginDown);
        origin.removeEventListener("touchstart", onOriginDown);
        wrapper.querySelectorAll("input, button, a, select, textarea").forEach(el => {
          if (!("lgeTabIndex" in el.dataset)) return;
          el.tabIndex = Number(el.dataset.lgeTabIndex);
          delete el.dataset.lgeTabIndex;
        });
        wrapper.classList.remove("lge-draggable", "lge-dragging");
        shield.remove();
        label.remove();
        origin.remove();
      });
    });

    const resizeObs = new ResizeObserver(syncAllShields);
    shieldMap.forEach(({ native }) => resizeObs.observe(native));
    window.addEventListener("resize", syncAllShields);

    cleanups.push(() => {
      resizeObs.disconnect();
      window.removeEventListener("resize", syncAllShields);
      shieldMap.clear();
      guideV.remove();
      guideH.remove();
      guideV = guideH = null;
    });
  }

  function enterDragMode() {
    if (dragActive) return;
    dragActive = true;

    const reg = buildRegistry();

    snapshot = {};
    Object.entries(reg).forEach(([id, meta]) => {
      snapshot[id] = { ...getSavedPos(meta, id) };
    });

    if (typeof closeSidebar === "function") {
      closeSidebar();
      const overlay = document.getElementById("modal-overlay");
      if (overlay) overlay.style.pointerEvents = "none";
      setTimeout(() => {
        if (overlay) overlay.style.pointerEvents = "";
        buildShields(reg);
      }, 420);
    } else {
      buildShields(reg);
    }

    showPill();
  }

  function exitDragMode(save) {
    if (!dragActive) return;
    dragActive = false;

    if (save) {
      const reg = buildRegistry();
      Object.entries(reg).forEach(([id, meta]) => {
        const wrapper = getWrapper(id);
        const native  = document.getElementById(id);
        if (!native) return;
        const rect = native.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;

        // dataset is kept current throughout dragging, so it is the source of truth
        const px    = parseFloat(wrapper.dataset.px);
        const py    = parseFloat(wrapper.dataset.py);
        // note: num() guards NaN but keeps a valid 0 - a plain `|| 0.5` would
        // wrongly reset a left/top origin (ox/oy === 0) back to center.
        const ox    = clamp(num(parseFloat(wrapper.dataset.ox), 0.5), 0, 1);
        const oy    = clamp(num(parseFloat(wrapper.dataset.oy), 0.5), 0, 1);
        const scale = num(parseFloat(wrapper.dataset.scale), 1);
        if (!isFinite(px) || !isFinite(py)) return;

        applyPosition(id, px, py, ox, oy, scale);
        localStorage.setItem(meta.key, JSON.stringify({ px, py, ox, oy, scale }));
      });
    } else {
      Object.entries(snapshot).forEach(([id, pos]) =>
        applyPosition(id, pos.px, pos.py, pos.ox, pos.oy, pos.scale));
    }

    cleanups.forEach(fn => fn());
    cleanups.length = 0;
    hidePill();
    reflowAll();
  }

  let pillEl = null;

  function showPill() {
    if (pillEl) return;
    pillEl = document.createElement("div");
    pillEl.id = "lge-pill";
    pillEl.innerHTML = `
      <span id="lge-pill-label">Layout Edit Mode</span>
      <button class="lge-pill-btn lge-pill-toggle" id="lge-pill-snap"></button>
      <button class="lge-pill-btn" id="lge-pill-reset">Reset</button>
      <button class="lge-pill-btn" id="lge-pill-cancel">Cancel</button>
      <button class="lge-pill-btn" id="lge-pill-save">Save</button>`;
    document.body.appendChild(pillEl);
    requestAnimationFrame(() => requestAnimationFrame(() => pillEl.classList.add("lge-pill-visible")));

    const snapBtn = pillEl.querySelector("#lge-pill-snap");
    const renderSnap = () => {
      snapBtn.textContent = `Snap: ${snapEnabled ? "On" : "Off"}`;
      snapBtn.classList.toggle("lge-toggle-on", snapEnabled);
    };
    renderSnap();
    snapBtn.addEventListener("click", () => {
      snapEnabled = !snapEnabled;
      localStorage.setItem("lge_snap", snapEnabled);
      renderSnap();
      if (!snapEnabled) { setGuide("v", null); setGuide("h", null); }
    });

    pillEl.querySelector("#lge-pill-reset").addEventListener("click", () => {
      Object.keys(buildRegistry()).forEach(id => {
        const d = DEFAULTS[id] || { px: 50, py: 50, ox: 0.5, oy: 0.5 };
        applyPosition(id, d.px, d.py, num(d.ox, 0.5), num(d.oy, 0.5), 1);
      });
      setGuide("v", null);
      setGuide("h", null);
      syncAllShields();
    });

    pillEl.querySelector("#lge-pill-cancel").addEventListener("click", () => exitDragMode(false));
    pillEl.querySelector("#lge-pill-save").addEventListener("click",   () => exitDragMode(true));
  }

  function hidePill() {
    if (!pillEl) return;
    const el = pillEl;
    pillEl = null;
    el.classList.remove("lge-pill-visible");
    const cleanup = () => el.remove();
    el.addEventListener("transitionend", cleanup, { once: true });
    setTimeout(cleanup, 600);
  }

  const openBtn = document.getElementById("open-layout-editor");
  if (openBtn) openBtn.addEventListener("click", enterDragMode);

  const saveBtn = document.getElementById("save-settings");
  if (saveBtn) saveBtn.addEventListener("click", () => {
    if (typeof closeSidebar === "function") closeSidebar();
  });
});
