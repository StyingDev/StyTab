document.addEventListener("DOMContentLoaded", function () {

  const BUILTIN_META = {
    "greeting-display":    { label: "Greeting",   color: "#00b894", key: "pos_greeting-display" },
    "clock":               { label: "Clock",       color: "#0984e3", key: "pos_clock"            },
    "search-box":          { label: "Search Bar",  color: "#6c5ce7", key: "pos_search-box"       },
    "quick-links-section": { label: "Quick Links", color: "#e17055", key: "pos_quick-links"      },
    "weather-widget":      { label: "Weather",     color: "#00cec9", key: "pos_weather"          },
  };

  const DEFAULTS = {
    "greeting-display":    { x: 50, y: 41 },
    "clock":               { x: 50, y: 50 },
    "search-box":          { x: 50, y: 70 },
    "quick-links-section": { x: 50, y: 60 },
    "weather-widget":      { x: 3.5, y: 5 },
    "spotify-widget":      { x: 10, y: 88 },
  };

  const STYLE_OVERRIDES = {
    "weather-widget": { position: "relative", top: "auto", left: "auto" },
  };

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
        if (!DEFAULTS[id]) DEFAULTS[id] = { x: 50, y: 50 };
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

  const ANCHORS = {
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

  function nearestAnchor(cx, cy, W, H) {
    let best = null, bestDist = Infinity;
    for (const [name, fn] of Object.entries(ANCHORS)) {
      const [ax, ay] = fn(W, H);
      const d = Math.hypot(cx - ax, cy - ay);
      if (d < bestDist) { bestDist = d; best = name; }
    }
    return best;
  }

  function migrateOldPos(p) {
    const W = typeof p.w === "number" ? p.w : window.innerWidth;
    const H = typeof p.h === "number" ? p.h : window.innerHeight;
    const cx = (p.x / 100) * W;
    const cy = (p.y / 100) * H;
    const anchor = nearestAnchor(cx, cy, W, H);
    const [ax, ay] = ANCHORS[anchor](W, H);
    return { anchor, dx: cx - ax, dy: cy - ay, scale: typeof p.scale === "number" ? p.scale : 1 };
  }

  function applyPosition(id, anchor, dx, dy, scale = 1) {
    const wrapper = getWrapper(id);
    wrapper.dataset.anchor = anchor;
    wrapper.dataset.dx     = dx;
    wrapper.dataset.dy     = dy;
    wrapper.dataset.scale  = scale;
    wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
    const native = document.getElementById(id);
    if (native && native.parentNode !== wrapper) {
      if (STYLE_OVERRIDES[id]) Object.assign(native.style, STYLE_OVERRIDES[id]);
      wrapper.appendChild(native);
    }
    if (!dragActive) reflowWidget(wrapper);
  }

  function getSavedPos(meta, id) {
    try {
      const p = JSON.parse(localStorage.getItem(meta.key));
      if (p) {
        if (p.anchor && ANCHORS[p.anchor])
          return { anchor: p.anchor, dx: p.dx || 0, dy: p.dy || 0, scale: typeof p.scale === "number" ? p.scale : 1 };
        if (typeof p.x === "number")
          return migrateOldPos(p);
      }
    } catch {}
    const d = DEFAULTS[id] || { x: 50, y: 50 };
    const W = window.innerWidth, H = window.innerHeight;
    const cx = (d.x / 100) * W, cy = (d.y / 100) * H;
    const anchor = nearestAnchor(cx, cy, W, H);
    const [ax, ay] = ANCHORS[anchor](W, H);
    return { anchor, dx: cx - ax, dy: cy - ay, scale: 1 };
  }

  function reflowWidget(wrapper) {
    const anchor = wrapper.dataset.anchor || "center";
    const dx = parseFloat(wrapper.dataset.dx) || 0;
    const dy = parseFloat(wrapper.dataset.dy) || 0;
    if (!ANCHORS[anchor]) return;
    const W = window.innerWidth, H = window.innerHeight, m = 4;
    const [ax, ay] = ANCHORS[anchor](W, H);
    const rect = wrapper.getBoundingClientRect();
    const hw = rect.width / 2, hh = rect.height / 2;
    const cx = clamp(ax + dx, hw + m, W - hw - m);
    const cy = clamp(ay + dy, hh + m, H - hh - m);
    wrapper.style.left = `${(cx / W) * 100}%`;
    wrapper.style.top  = `${(cy / H) * 100}%`;
  }

  function loadPositions() {
    const reg = buildRegistry();
    Object.entries(reg).forEach(([id, meta]) => {
      const pos = getSavedPos(meta, id);
      applyPosition(id, pos.anchor, pos.dx, pos.dy, pos.scale);
    });
  }

  let dragActive = false;
  let snapshot   = {};
  const cleanups  = [];
  const shieldMap = new Map();

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const SNAP_THRESHOLD = 6;
  const SCALE_MIN = 0.4, SCALE_MAX = 3;
  let snapEnabled = localStorage.getItem("lge_snap") !== "false";
  let guideV = null, guideH = null;

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

  function syncAllShields() {
    shieldMap.forEach(({ shield, label, native }) => {
      const r = native.getBoundingClientRect();
      coverRect(shield, r);
      label.style.left = `${r.left + r.width / 2}px`;
      label.style.top  = `${r.top - 22}px`;
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

      let startMx, startMy, startPx, startPy, targets;

      function syncShield() {
        const r = native.getBoundingClientRect();
        coverRect(shield, r);
        label.style.left = `${r.left + r.width / 2}px`;
        label.style.top  = `${r.top - 22}px`;
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

      function onMove(e) {
        const client = e.touches ? e.touches[0] : e;
        let cx = (startPx / 100) * window.innerWidth  + (client.clientX - startMx);
        let cy = (startPy / 100) * window.innerHeight + (client.clientY - startMy);

        if (snapEnabled) {
          const r = native.getBoundingClientRect();
          const hw = r.width / 2, hh = r.height / 2;
          const sx = bestSnap([cx - hw, cx, cx + hw], targets.xs);
          const sy = bestSnap([cy - hh, cy, cy + hh], targets.ys);
          if (sx) cx += sx.delta;
          if (sy) cy += sy.delta;

          if (sx) setGuide("v", sx.pos, Math.min(sx.min, cy - hh), Math.max(sx.max, cy + hh));
          else    setGuide("v", null);
          if (sy) setGuide("h", sy.pos, Math.min(sy.min, cx - hw), Math.max(sy.max, cx + hw));
          else    setGuide("h", null);
        }

        wrapper.style.left = `${clamp((cx / window.innerWidth)  * 100, 1, 99)}%`;
        wrapper.style.top  = `${clamp((cy / window.innerHeight) * 100, 1, 99)}%`;
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
        startPx = parseFloat(wrapper.style.left);
        startPy = parseFloat(wrapper.style.top);
        targets = collectTargets();
        wrapper.classList.add("lge-dragging");
        shield.classList.add("lge-shield-dragging");
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup",   onUp);
        window.addEventListener("touchmove", onMove, { passive: false });
        window.addEventListener("touchend",  onUp);
      }

      let rsCx, rsCy, rsStartDist, rsStartScale;

      function onResizeMove(e) {
        const client = e.touches ? e.touches[0] : e;
        const dist = Math.hypot(client.clientX - rsCx, client.clientY - rsCy);
        const scale = clamp(rsStartScale * (dist / rsStartDist), SCALE_MIN, SCALE_MAX);
        wrapper.style.transform = `translate(-50%, -50%) scale(${scale})`;
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
        rsCx = r.left + r.width / 2;
        rsCy = r.top + r.height / 2;
        rsStartScale = parseFloat(wrapper.dataset.scale) || 1;
        rsStartDist = Math.hypot(client.clientX - rsCx, client.clientY - rsCy) || 1;
        wrapper.classList.add("lge-dragging");
        shield.classList.add("lge-shield-dragging");
        window.addEventListener("mousemove", onResizeMove);
        window.addEventListener("mouseup",   onResizeUp);
        window.addEventListener("touchmove", onResizeMove, { passive: false });
        window.addEventListener("touchend",  onResizeUp);
      }

      shieldMap.set(id, { shield, label, native, wrapper });

      shield.addEventListener("mouseenter", () => label.classList.add("lge-label-visible"));
      shield.addEventListener("mouseleave", () => {
        if (!shield.classList.contains("lge-shield-dragging"))
          label.classList.remove("lge-label-visible");
      });
      shield.addEventListener("mousedown",  onDown);
      shield.addEventListener("touchstart", onDown, { passive: false });
      handle.addEventListener("mousedown",  onResizeDown);
      handle.addEventListener("touchstart", onResizeDown, { passive: false });

      cleanups.push(() => {
        shield.removeEventListener("mousedown",  onDown);
        shield.removeEventListener("touchstart", onDown);
        handle.removeEventListener("mousedown",  onResizeDown);
        handle.removeEventListener("touchstart", onResizeDown);
        wrapper.querySelectorAll("input, button, a, select, textarea").forEach(el => {
          if (!("lgeTabIndex" in el.dataset)) return;
          el.tabIndex = Number(el.dataset.lgeTabIndex);
          delete el.dataset.lgeTabIndex;
        });
        wrapper.classList.remove("lge-draggable", "lge-dragging");
        shield.remove();
        label.remove();
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
        const xPct = parseFloat(wrapper.style.left);
        const yPct = parseFloat(wrapper.style.top);
        const scale = parseFloat(wrapper.dataset.scale) || 1;
        if (isNaN(xPct) || isNaN(yPct)) return;
        const W = window.innerWidth, H = window.innerHeight;
        const cx = (xPct / 100) * W;
        const cy = (yPct / 100) * H;
        const anchor = nearestAnchor(cx, cy, W, H);
        const [ax, ay] = ANCHORS[anchor](W, H);
        const dx = cx - ax, dy = cy - ay;
        wrapper.dataset.anchor = anchor;
        wrapper.dataset.dx     = dx;
        wrapper.dataset.dy     = dy;
        localStorage.setItem(meta.key, JSON.stringify({ anchor, dx, dy, scale }));
      });
    } else {
      Object.entries(snapshot).forEach(([id, pos]) =>
        applyPosition(id, pos.anchor, pos.dx, pos.dy, pos.scale));
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
      const W = window.innerWidth, H = window.innerHeight;
      Object.keys(buildRegistry()).forEach(id => {
        const d = DEFAULTS[id] || { x: 50, y: 50 };
        const cx = (d.x / 100) * W, cy = (d.y / 100) * H;
        const anchor = nearestAnchor(cx, cy, W, H);
        const [ax, ay] = ANCHORS[anchor](W, H);
        applyPosition(id, anchor, cx - ax, cy - ay, 1);
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
