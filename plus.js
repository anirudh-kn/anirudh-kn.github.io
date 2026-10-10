/* ==========================================================================
   plus.js — round 2: signature interactions (additive, no content changes)
   Needs nothing but the page itself (no libraries, works from file://).
   Each feature is isolated: if one fails, the others and the site still work.
   Disabled entirely for visitors who prefer reduced motion.
   ========================================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const hasIO = 'IntersectionObserver' in window;
  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[plus:' + name + ']', e); } };
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };

  root.classList.add('m2-on');

  /* one shared frame loop; features register tickers */
  const tickers = [];
  let lastNow = performance.now();
  let raf = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - lastNow) / 1000 || 0.016);
    lastNow = now;
    for (const t of tickers) { try { t(dt, now); } catch (e) { /* keep loop alive */ } }
    raf = requestAnimationFrame(loop);
  }
  function startLoop() { if (!raf) { lastNow = performance.now(); raf = requestAnimationFrame(loop); } }
  function stopLoop() { cancelAnimationFrame(raf); raf = 0; }
  document.addEventListener('visibilitychange', () => (document.hidden ? stopLoop() : startLoop()));

  /* tiny toast */
  let toastEl = null, toastTimer = 0;
  function toast(message) {
    if (!toastEl) {
      toastEl = el('div', 'm2-toast');
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('aria-live', 'polite');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('on'), 1900);
  }

  /* ====================================================================
   * 1. DATA GLOBE — land dots + flight arcs drawn on the existing orb
   * ==================================================================== */
  safe('globe', () => {
    const host = $('.contact-section');
    if (!host) return;
    const LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAfAP8HAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw////wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAcAIL7//9//xOAAP/ff0668QD/HwAA+A8At///////v3/w/////x8++B8AAOD/1//7////////jP////+/+AE/gAcAn9f//////////w/w/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QAAAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYAAAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAAAAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAAPAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAAAPz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAYXgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAAAAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAAAAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8AAAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P///38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////////////////////H/AfwP//////////////////////////////////////////////////////////////////////////////////////';

    const canvas = el('canvas', 'm2-globe');
    host.insertBefore(canvas, host.firstChild);
    canvas.setAttribute('aria-hidden', 'true');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    /* decode the 2° land bitmap into unit vectors */
    const bin = atob(LAND);
    const COLS = 180, ROWS = 90, STEP = 2;
    const dots = [];
    for (let r = 0; r < ROWS; r++) {
      const lat = (90 - STEP * (r + 0.5)) * Math.PI / 180;
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        if ((bin.charCodeAt(i >> 3) >> (i & 7)) & 1) {
          const lonDeg = -180 + STEP * (c + 0.5);
          const lon = lonDeg * Math.PI / 180;
          const latDeg = lat * 180 / Math.PI;
          dots.push({
            x: Math.cos(lat) * Math.sin(lon), y: Math.sin(lat), z: Math.cos(lat) * Math.cos(lon),
            india: latDeg > 6 && latDeg < 36 && lonDeg > 68 && lonDeg < 98
          });
        }
      }
    }

    const vec = (latDeg, lonDeg) => {
      const la = latDeg * Math.PI / 180, lo = lonDeg * Math.PI / 180;
      return { x: Math.cos(la) * Math.sin(lo), y: Math.sin(la), z: Math.cos(la) * Math.cos(lo) };
    };
    const hub = vec(10.0, 76.3); /* Kerala */
    const targets = [
      [51.5, -0.1], [40.7, -74], [37.8, -122.4], [1.35, 103.8], [25.2, 55.3], [35.7, 139.7], [-33.9, 151.2]
    ].map(([la, lo], i) => {
      const b = vec(la, lo);
      const dot = hub.x * b.x + hub.y * b.y + hub.z * b.z;
      const omega = Math.acos(clamp(dot, -1, 1));
      return { b, omega, sinO: Math.sin(omega), lift: 0.1 + 0.2 * (omega / Math.PI), phase: i * 1.15, cycle: 6.4 + (i % 3) * 0.6 };
    });
    const slerp = (a, b, t, arc) => {
      const k1 = Math.sin((1 - t) * arc.omega) / arc.sinO, k2 = Math.sin(t * arc.omega) / arc.sinO;
      return { x: a.x * k1 + b.x * k2, y: a.y * k1 + b.y * k2, z: a.z * k1 + b.z * k2 };
    };

    let w = 0, h = 0, dpr = 1, R = 0, visible = true;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      R = (w / 1.28) / 2 * 0.985 * dpr;
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(canvas);
    else window.addEventListener('resize', size, { passive: true });
    if (hasIO) new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(host);

    const roll = -17 * Math.PI / 180, cr = Math.cos(roll), sr = Math.sin(roll);
    let drewOnce = false;

    tickers.push((dt, now) => {
      if (!visible || !w) return;
      const mo = window.__motion;
      const yaw = now * 0.0045 - (mo && mo.mouse.active ? mo.mouse.nx * 22 : 0);
      const pitch = mo && mo.mouse.active ? -mo.mouse.ny * 10 : 0;
      const lon0 = (78 - yaw) * Math.PI / 180;
      const lat0 = clamp(16 + pitch * 0.8, -60, 70) * Math.PI / 180;
      const cl = Math.cos(lon0), sl = Math.sin(lon0), cp = Math.cos(lat0), sp = Math.sin(lat0);
      const cx = canvas.width / 2, cy = canvas.height / 2;

      /* pointer position in canvas pixels, for the "light up under cursor" effect */
      let mx = -1e5, my = -1e5;
      if (mo && mo.mouse.active) {
        const rect = canvas.getBoundingClientRect();
        mx = (mo.mouse.x - rect.left) * dpr; my = (mo.mouse.y - rect.top) * dpr;
      }
      const reach = 48 * dpr;

      const out = { x: 0, y: 0, z: 0 };
      const rot = v => {
        const xz = v.x * sl + v.z * cl;
        const x1 = v.x * cl - v.z * sl;
        const y2 = v.y * cp - xz * sp;
        out.z = v.y * sp + xz * cp;
        out.x = x1 * cr - y2 * sr;
        out.y = x1 * sr + y2 * cr;
      };

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* land dots */
      const s = 1.15 * dpr;
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        rot(d);
        if (out.z < 0.03) continue;
        const px = cx + R * out.x, py = cy - R * out.y;
        let a = 0.14 + 0.5 * Math.pow(out.z, 0.9);
        let size = s;
        if (d.india) { a = Math.min(1, a + 0.3); size = s * 1.35; }
        const dx = px - mx, dy = py - my;
        if (dx * dx + dy * dy < reach * reach) {
          const k = 1 - Math.sqrt(dx * dx + dy * dy) / reach;
          a = Math.min(1, a + k * 0.7); size += k * 1.6 * dpr;
        }
        ctx.fillStyle = d.india ? `rgba(214,200,255,${a.toFixed(3)})` : `rgba(168,150,232,${a.toFixed(3)})`;
        ctx.fillRect(px - size / 2, py - size / 2, size, size);
      }

      /* flight arcs from Kerala */
      const time = now / 1000;
      ctx.lineCap = 'round';
      targets.forEach(arc => {
        const local = (time + arc.phase) % arc.cycle;
        const travel = 3.1;
        const head = clamp(local / travel, 0, 1);
        const trail = 0.42;
        const steps = 34;
        const pt = t => {
          const v = slerp(hub, arc.b, t, arc);
          const l = 1 + arc.lift * Math.sin(Math.PI * t);
          rot({ x: v.x * l, y: v.y * l, z: v.z * l });
          return { px: cx + R * out.x, py: cy - R * out.y, ok: out.z > 0.02 || Math.hypot(out.x, out.y) > 1.0 };
        };

        /* faint full route */
        ctx.lineWidth = 1 * dpr;
        ctx.strokeStyle = 'rgba(178,161,244,0.10)';
        ctx.beginPath();
        let pen = false;
        for (let i = 0; i <= steps; i++) {
          const p = pt(i / steps);
          if (!p.ok) { pen = false; continue; }
          if (!pen) { ctx.moveTo(p.px, p.py); pen = true; } else ctx.lineTo(p.px, p.py);
        }
        ctx.stroke();

        /* travelling comet */
        if (local < travel + 0.05) {
          const t0 = Math.max(0, head - trail);
          const n = 16;
          let prev = null;
          for (let i = 0; i <= n; i++) {
            const t = lerp(t0, head, i / n);
            const p = pt(t);
            if (prev && p.ok && prev.ok) {
              ctx.strokeStyle = `rgba(214,200,255,${(Math.pow(i / n, 1.6) * 0.95).toFixed(3)})`;
              ctx.lineWidth = (0.8 + 1.4 * (i / n)) * dpr;
              ctx.beginPath(); ctx.moveTo(prev.px, prev.py); ctx.lineTo(p.px, p.py); ctx.stroke();
            }
            prev = p;
          }
          if (prev && prev.ok && head < 1) {
            ctx.fillStyle = 'rgba(235,228,255,0.95)';
            ctx.beginPath(); ctx.arc(prev.px, prev.py, 1.9 * dpr, 0, 6.2832); ctx.fill();
          }
        }

        /* arrival ping */
        const since = local - travel;
        if (since > 0 && since < 1.3) {
          const p = pt(1);
          if (p.ok) {
            const k = since / 1.3;
            ctx.strokeStyle = `rgba(162,201,219,${((1 - k) * 0.8).toFixed(3)})`;
            ctx.lineWidth = 1 * dpr;
            ctx.beginPath(); ctx.arc(p.px, p.py, (2 + k * 12) * dpr, 0, 6.2832); ctx.stroke();
            ctx.fillStyle = 'rgba(214,230,240,0.9)';
            ctx.beginPath(); ctx.arc(p.px, p.py, 1.7 * dpr, 0, 6.2832); ctx.fill();
          }
        }
      });

      /* Kerala hub */
      rot(hub);
      if (out.z > 0.02) {
        const px = cx + R * out.x, py = cy - R * out.y;
        const k = (time % 2.2) / 2.2;
        ctx.strokeStyle = `rgba(199,184,255,${((1 - k) * 0.85).toFixed(3)})`;
        ctx.lineWidth = 1.2 * dpr;
        ctx.beginPath(); ctx.arc(px, py, (3 + k * 16) * dpr, 0, 6.2832); ctx.stroke();
        ctx.fillStyle = '#efe9ff';
        ctx.shadowColor = '#b2a1f4'; ctx.shadowBlur = 10 * dpr;
        ctx.beginPath(); ctx.arc(px, py, 2.4 * dpr, 0, 6.2832); ctx.fill();
        ctx.shadowBlur = 0;
      }

      if (!drewOnce) { drewOnce = true; canvas.classList.add('on'); root.classList.add('m2-globe-on'); }
    });
  });


  /* ====================================================================
   * 1b. HERO DATA ARCS — launch from the India lights baked into the portrait,
   *     registered to the image so they stay locked at every screen size
   * ==================================================================== */
  safe('heroarcs', () => {
    const scene = $('.orb-scene');
    const img = $('.hero-portrait img');
    if (!scene || !img) return;
    const canvas = el('canvas', 'm2-heroarcs');
    canvas.setAttribute('aria-hidden', 'true');
    scene.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const IW = 1312, IH = 1199;                 /* portrait.webp size (portrait-sm has the same ratio) */
    const K = [293, 488];                        /* Kerala coast in the image */
    const T = [                                  /* [x, y, bend] in image px */
      [208, 450, -0.22], [392, 467, 0.2], [432, 572, 0.28], [265, 388, -0.3],
      [110, 362, -0.34], [133, 752, 0.34], [385, 118, -0.3]
    ];
    let w = 0, h = 0, dpr = 1, visible = true, sc = 1, ox = 0, oy = 0;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = scene.clientWidth; h = scene.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      sc = Math.max(w / IW, h / IH);             /* object-fit: cover */
      ox = (w - IW * sc) * 0.56;                  /* object-position: 56% 42% */
      oy = (h - IH * sc) * 0.42;
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(scene);
    if (hasIO) new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(scene);
    const P = (x, y) => [(ox + x * sc) * dpr, (oy + y * sc) * dpr];

    const arcs = T.map(([x, y, bend], i) => {
      const a = P(K[0], K[1]), b = P(x, y);
      const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
      const dx = b[0] - a[0], dy = b[1] - a[1];
      return { a, b, c: [mx - dy * bend, my + dx * bend], phase: i * 0.9, cycle: 5.2 + (i % 3) * 0.7 };
    });
    const bez = (a, c, b, t) => {
      const u = 1 - t;
      return [u * u * a[0] + 2 * u * t * c[0] + t * t * b[0], u * u * a[1] + 2 * u * t * c[1] + t * t * b[1]];
    };

    tickers.push((dt, now) => {
      if (!visible || !w) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = now / 1000;
      ctx.lineCap = 'round';
      arcs.forEach(arc => {
        const local = (time + arc.phase) % arc.cycle;
        const travel = 2.6;
        const head = clamp(local / travel, 0, 1);
        /* faint route */
        ctx.strokeStyle = 'rgba(178,161,244,0.13)';
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath(); ctx.moveTo(arc.a[0], arc.a[1]);
        ctx.quadraticCurveTo(arc.c[0], arc.c[1], arc.b[0], arc.b[1]); ctx.stroke();
        /* comet */
        if (local < travel + 0.05) {
          const t0 = Math.max(0, head - 0.4), n = 18;
          let prev = null;
          for (let i = 0; i <= n; i++) {
            const p = bez(arc.a, arc.c, arc.b, lerp(t0, head, i / n));
            if (prev) {
              ctx.strokeStyle = `rgba(226,216,255,${(Math.pow(i / n, 1.5) * 0.95).toFixed(3)})`;
              ctx.lineWidth = (0.7 + 1.6 * (i / n)) * dpr;
              ctx.beginPath(); ctx.moveTo(prev[0], prev[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
            }
            prev = p;
          }
          if (prev && head < 1) {
            ctx.fillStyle = '#f1ecff';
            ctx.shadowColor = '#b2a1f4'; ctx.shadowBlur = 8 * dpr;
            ctx.beginPath(); ctx.arc(prev[0], prev[1], 1.8 * dpr, 0, 6.2832); ctx.fill();
            ctx.shadowBlur = 0;
          }
        }
        /* arrival ping */
        const since = local - travel;
        if (since > 0 && since < 1.2) {
          const k = since / 1.2;
          ctx.strokeStyle = `rgba(162,201,219,${((1 - k) * 0.85).toFixed(3)})`;
          ctx.lineWidth = 1 * dpr;
          ctx.beginPath(); ctx.arc(arc.b[0], arc.b[1], (2 + k * 13) * dpr, 0, 6.2832); ctx.stroke();
        }
      });
      /* Kerala hub pulse */
      const hub = P(K[0], K[1]);
      const k = (time % 2.2) / 2.2;
      ctx.strokeStyle = `rgba(214,200,255,${((1 - k) * 0.9).toFixed(3)})`;
      ctx.lineWidth = 1.2 * dpr;
      ctx.beginPath(); ctx.arc(hub[0], hub[1], (3 + k * 17) * dpr, 0, 6.2832); ctx.stroke();
      ctx.fillStyle = '#f4efff';
      ctx.shadowColor = '#b2a1f4'; ctx.shadowBlur = 12 * dpr;
      ctx.beginPath(); ctx.arc(hub[0], hub[1], 2.4 * dpr, 0, 6.2832); ctx.fill();
      ctx.shadowBlur = 0;
    });
  });

  /* ====================================================================
   * 2. HEADLINE DECODE — letters resolve from data noise
   * ==================================================================== */
  safe('decode', () => {
    const h1 = $('#hero-title');
    if (!h1) return;
    const walker = document.createTreeWalker(h1, NodeFilter.SHOW_TEXT);
    const parts = [];
    let total = 0;
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.nodeValue;
      const idx = [];
      for (let i = 0; i < text.length; i++) if (/\S/.test(text[i])) idx.push(total++);
      parts.push({ node: n, text, idx });
    }
    if (!total) return;
    const glyphs = '01<>/{}=+#*';
    const reveal = Array.from({ length: total }, (_, i) => 380 + (i / total) * 820 + rand(0, 260));
    const label = h1.textContent.replace(/\s+/g, ' ').trim();
    h1.setAttribute('aria-label', label);
    const start = performance.now();
    (function tick(now) {
      const t = now - start;
      let done = true;
      parts.forEach(p => {
        let out = '', k = 0;
        for (let i = 0; i < p.text.length; i++) {
          const ch = p.text[i];
          if (!/\S/.test(ch)) { out += ch; continue; }
          const rt = reveal[p.idx[k++]];
          if (t >= rt) out += ch; else { out += glyphs[(Math.random() * glyphs.length) | 0]; done = false; }
        }
        p.node.nodeValue = out;
      });
      if (!done) requestAnimationFrame(tick);
      else { parts.forEach(p => { p.node.nodeValue = p.text; }); h1.removeAttribute('aria-label'); }
    })(start);
  });

  /* ====================================================================
   * 3. PROJECT ROWS → tiny live charts (only figures already on the page)
   * ==================================================================== */
  safe('viz', () => {
    $$('.project-row').forEach(row => {
      const stat = $('.project-stat', row);
      const strong = stat && $('strong', stat);
      const desc = $('.project-information > p:not(.eyebrow)', row);
      if (!strong || !desc) return;
      const shown = strong.textContent.trim();
      const text = desc.textContent;
      let svg = '', tip = '';

      if (shown.includes('$')) {
        const total = parseFloat(shown.replace(/[^\d.]/g, ''));
        const all = [...text.matchAll(/\$([\d.]+)M/g)];
        const part = all.length > 1 && parseFloat(all[all.length - 1][1]);
        if (!total || !part) return;
        const wPx = 112 * clamp(part / total, 0, 1);
        svg = `<svg viewBox="0 0 112 14" style="width:112px;height:14px" aria-hidden="true"><rect class="m2-trk" x="0" y="4" width="112" height="6" rx="3"/><rect class="m2-fill" x="0" y="4" width="${wPx.toFixed(1)}" height="6" rx="3"/></svg>`;
        tip = `Technology ≈ $${part.toFixed(2)}M of $${total.toFixed(2)}M`;
      } else if (shown.includes('%')) {
        const p = parseFloat(shown);
        if (!p) return;
        svg = `<svg viewBox="0 0 32 32" style="width:30px;height:30px" aria-hidden="true"><circle class="m2-trk" cx="16" cy="16" r="12" fill="none" stroke-width="3.2"/><circle class="m2-arc" cx="16" cy="16" r="12" fill="none" stroke-width="3.2" stroke-linecap="round" pathLength="100" transform="rotate(-90 16 16)" style="--o:${(100 - p).toFixed(2)}"/></svg>`;
        tip = `${shown} churn rate`;
      } else if (/K/i.test(shown)) {
        const m = text.match(/([\d.]+)%/);
        const conv = m && parseFloat(m[1]);
        if (!conv) return;
        const half = Math.max(0.5, (20 * conv) / 100 / 2);
        svg = `<svg class="m2-funnel" viewBox="0 0 112 20" style="width:112px;height:20px" aria-hidden="true"><polygon points="0,0 112,${(10 - half).toFixed(2)} 112,${(10 + half).toFixed(2)} 0,20"/></svg>`;
        tip = `${shown} visitors → ${conv}% convert`;
      } else return;

      const viz = el('span', 'm2-viz', svg);
      viz.dataset.m2Tip = tip;
      stat.appendChild(viz);
      if (hasIO) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { viz.classList.add('m2-vis'); io.disconnect(); } });
        }, { threshold: 0.6 });
        io.observe(viz);
      } else viz.classList.add('m2-vis');
    });

    /* shared tooltip */
    const tip = el('div', 'm2-tip');
    tip.setAttribute('aria-hidden', 'true');
    document.body.appendChild(tip);
    let hideT = 0;
    const place = (x, y) => { tip.style.transform = `translate(${x + 14}px, ${y - 34}px)`; };
    document.addEventListener('pointerover', e => {
      const t = e.target.closest && e.target.closest('[data-m2-tip]');
      if (!t) return;
      tip.textContent = t.dataset.m2Tip;
      tip.classList.add('on');
      place(e.clientX, e.clientY);
      if (e.pointerType !== 'mouse') { clearTimeout(hideT); hideT = setTimeout(() => tip.classList.remove('on'), 2200); }
    });
    document.addEventListener('pointermove', e => { if (tip.classList.contains('on') && e.pointerType === 'mouse') place(e.clientX, e.clientY); }, { passive: true });
    document.addEventListener('pointerout', e => {
      const t = e.target.closest && e.target.closest('[data-m2-tip]');
      if (t && e.pointerType === 'mouse') tip.classList.remove('on');
    });
  });

  /* seismic card: random epicentre blips */
  safe('blips', () => {
    const art = $('.seismic-art');
    if (!art) return;
    let on = true;
    if (hasIO) new IntersectionObserver(e => { on = e[0].isIntersecting; }).observe(art);
    (function spawn() {
      if (on && !document.hidden) {
        const r = art.getBoundingClientRect();
        const x = rand(0.12, 0.88) * r.width, y = rand(0.2, 0.62) * r.height;
        const dot = el('span', 'm2-blip');
        dot.style.left = x + 'px'; dot.style.top = y + 'px';
        art.appendChild(dot);
        const big = rand(34, 80);
        dot.animate([{ opacity: 0.95, transform: 'translate(-50%,-50%) scale(.2)' }, { opacity: 0, transform: `translate(-50%,-50%) scale(${big / 8})` }], { duration: rand(1300, 2100), easing: 'cubic-bezier(.12,.8,.3,1)' }).onfinish = () => dot.remove();
      }
      setTimeout(spawn, rand(700, 1700));
    })();
  });

  /* ====================================================================
   * 4. SCROLL-DRAWN TIMELINE
   * ==================================================================== */
  safe('timeline', () => {
    const items = $$('.timeline-item');
    if (!items.length) return;
    const lines = items.map(item => {
      const line = el('span', 'm2-line');
      line.setAttribute('aria-hidden', 'true');
      $('.timeline-body', item).appendChild(line);
      return line;
    });
    tickers.push(() => {
      const vh = window.innerHeight;
      items.forEach((item, i) => {
        const r = item.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        const p = clamp((vh * 0.64 - r.top) / (r.height + 20), 0, 1);
        lines[i].style.transform = `scaleY(${p.toFixed(3)})`;
        item.classList.toggle('m2-lit', p > 0.03);
      });
    });
  });

  /* ====================================================================
   * 5. HEADING WIPE-UP REVEAL
   * ==================================================================== */
  safe('headings', () => {
    if (!hasIO) return;
    const heads = $$('main h2');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const h = e.target;
        h.classList.remove('m2-pre');
        h.classList.add('m2-in');
        h.addEventListener('animationend', () => h.classList.remove('m2-in'), { once: true });
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
    heads.forEach(h => {
      if (h.getBoundingClientRect().top > window.innerHeight * 0.92) { h.classList.add('m2-pre'); io.observe(h); }
    });
    window.addEventListener('beforeprint', () => heads.forEach(h => h.classList.remove('m2-pre')));
  });

  /* ====================================================================
   * 6. SIDE SECTION HUD
   * ==================================================================== */
  safe('hud', () => {
    const ids = $$('main > section[id]').map(s => s.id);
    if (ids.length < 3) return;
    const nav = el('nav', 'm2-hud');
    nav.setAttribute('aria-label', 'Page sections');
    const ticks = ids.map(id => {
      const sec = document.getElementById(id);
      const lab = $('.section-label span', sec);
      const name = lab ? lab.textContent.replace(/\s+/g, ' ').trim() : 'HOME';
      const a = el('a', 'm2-tick');
      a.href = '#' + id;
      a.dataset.label = name;
      a.setAttribute('aria-label', name.replace(/^\d+\s*\/\s*/, ''));
      nav.appendChild(a);
      return { a, sec };
    });
    document.body.appendChild(nav);
    let prev = -1, prevY = -1;
    tickers.push(() => {
      const y = window.scrollY;
      if (y === prevY) return;
      prevY = y;
      nav.classList.toggle('on', y > 240);
      let cur = 0;
      ticks.forEach((t, i) => { if (t.sec.getBoundingClientRect().top < window.innerHeight * 0.42) cur = i; });
      if (cur !== prev) {
        ticks.forEach((t, i) => t.a.classList.toggle('on', i === cur));
        prev = cur;
      }
    });
  });

  /* ====================================================================
   * 7. COMMAND PALETTE (Ctrl/⌘ + K, or "/")
   * ==================================================================== */
  const copyEmail = () => {
    const mail = $('a[href^="mailto:"]');
    const address = mail ? mail.getAttribute('href').replace('mailto:', '') : '';
    if (!address) return;
    const done = () => toast('Email copied ✓');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(address).then(done, () => fallback());
    else fallback();
    function fallback() {
      const ta = el('textarea');
      ta.value = address; ta.style.cssText = 'position:fixed;opacity:0;left:-999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done(); } catch (e) { toast(address); }
      ta.remove();
    }
  };

  let toggleBlueprint = () => {};

  safe('palette', () => {
    const items = [];
    $$('.main-navigation a').forEach(a => items.push({ label: a.textContent.trim(), kind: 'Section', run: () => { const hh = a.getAttribute('href'); if (window.__fx && window.__fx.go) window.__fx.go(hh); else location.hash = hh; } }));
    const cv = $('a[download]');
    if (cv) items.push({ label: 'Download CV', kind: 'Action', run: () => cv.click() });
    const mail = $('a[href^="mailto:"]');
    if (mail) {
      items.push({ label: 'Send an email', kind: 'Action', run: () => { location.href = mail.getAttribute('href'); } });
      items.push({ label: 'Copy email address', kind: 'Action', run: copyEmail });
    }
    $$('.contact-links a').forEach(a => {
      const name = a.textContent.trim().replace(/\s*[+\d][\d\s+]*$/, '').trim() || a.textContent.trim();
      if (/tel:/.test(a.href)) return;
      items.push({ label: 'Open ' + name, kind: 'Link', run: () => window.open(a.href, '_blank', 'noopener') });
    });
    items.push({ label: 'Toggle blueprint grid', kind: 'Fun', hint: 'G', run: () => toggleBlueprint() });

    const overlay = el('div', 'm2-pal');
    overlay.hidden = true;
    overlay.innerHTML = `<div class="m2-pal-box" role="dialog" aria-modal="true" aria-label="Quick navigation">
      <div class="m2-pal-input"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>
      <input type="text" placeholder="Jump to a section or action…" aria-label="Search sections and actions" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="m2-pal-list"><kbd>esc</kbd></div>
      <ul id="m2-pal-list" role="listbox" aria-label="Results"></ul>
      <div class="m2-pal-foot"><span>↑↓ navigate</span><span>↵ select</span><span>esc close</span></div></div>`;
    document.body.appendChild(overlay);
    const input = $('input', overlay), list = $('ul', overlay);
    let shown = [], active = 0, opener = null;

    function render() {
      const q = input.value.trim().toLowerCase();
      shown = items.filter(i => !q || q.split(/\s+/).every(w => (i.label + ' ' + i.kind).toLowerCase().includes(w)));
      active = clamp(active, 0, Math.max(0, shown.length - 1));
      list.innerHTML = '';
      if (!shown.length) { list.innerHTML = '<li class="m2-empty">No matches</li>'; return; }
      shown.forEach((it, i) => {
        const li = el('li', i === active ? 'on' : '');
        li.id = 'm2-opt-' + i;
        li.setAttribute('role', 'option');
        li.setAttribute('aria-selected', i === active ? 'true' : 'false');
        li.innerHTML = `<span>${it.label}</span><small>${it.hint ? '<kbd>' + it.hint + '</kbd>' : it.kind}</small>`;
        li.addEventListener('pointermove', () => { if (active !== i) { active = i; paint(); } });
        li.addEventListener('click', () => choose(i));
        list.appendChild(li);
      });
      input.setAttribute('aria-activedescendant', 'm2-opt-' + active);
    }
    function paint() {
      [...list.children].forEach((li, i) => { li.classList.toggle('on', i === active); li.setAttribute('aria-selected', i === active ? 'true' : 'false'); });
      input.setAttribute('aria-activedescendant', 'm2-opt-' + active);
      const li = list.children[active]; if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    }
    function open() {
      opener = document.activeElement;
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('on'));
      input.value = ''; active = 0; render(); input.focus();
      root.classList.add('m2-pal-open');
    }
    function close() {
      overlay.classList.remove('on');
      root.classList.remove('m2-pal-open');
      setTimeout(() => { overlay.hidden = true; }, 180);
      if (opener && opener.focus) opener.focus();
    }
    function choose(i) { const it = shown[i]; if (!it) return; close(); setTimeout(() => it.run(), 60); }

    input.addEventListener('input', () => { active = 0; render(); });
    overlay.addEventListener('pointerdown', e => { if (e.target === overlay) close(); });
    overlay.addEventListener('keydown', e => {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); active = (active + 1) % Math.max(1, shown.length); paint(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = (active - 1 + shown.length) % Math.max(1, shown.length); paint(); }
      else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
      else if (e.key === 'Tab') { e.preventDefault(); }
    });
    document.addEventListener('keydown', e => {
      const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); overlay.hidden ? open() : close(); }
      else if (e.key === '/' && !typing && overlay.hidden) { e.preventDefault(); open(); }
    });

    /* discoverability hint (desktop) */
    if (fine) {
      const mac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
      const hint = el('button', 'm2-hint', `<kbd>${mac ? '⌘' : 'Ctrl'}</kbd><kbd>K</kbd>`);
      hint.type = 'button';
      hint.setAttribute('aria-label', 'Open quick navigation');
      hint.addEventListener('click', open);
      document.body.appendChild(hint);
      setTimeout(() => hint.classList.add('on'), 2400);
    }
  });

  /* ====================================================================
   * 8. CURSOR RING with context labels (mouse only)
   * ==================================================================== */
  if (fine) safe('cursor', () => {
    const ring = el('div', 'm2-ring', '<span></span>');
    ring.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ring);
    const label = $('span', ring);
    const pos = { x: -100, y: -100, tx: -100, ty: -100 };
    let seen = false;

    $('.hero-art') && ($('.hero-art').dataset.m2Cursor = 'DRAG');
    $$('.project-link, .credential-link, .contact-links a, .text-link[target]').forEach(a => { a.dataset.m2Cursor = 'OPEN'; });
    $$('a[download]').forEach(a => { a.dataset.m2Cursor = 'SAVE'; });
    $$('a[href^="mailto:"]').forEach(a => { a.dataset.m2Cursor = 'MAIL'; });
    const stage = $('.creative-studio'); if (stage) stage.dataset.m2Cursor = 'PLAY';

    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      pos.tx = e.clientX; pos.ty = e.clientY;
      if (!seen) { seen = true; pos.x = pos.tx; pos.y = pos.ty; ring.classList.add('on'); }
      const t = e.target.closest ? e.target.closest('[data-m2-cursor], a, button, [role="option"], input') : null;
      const word = t && t.dataset ? t.dataset.m2Cursor : '';
      ring.classList.toggle('word', !!word);
      ring.classList.toggle('link', !!t);
      if (label.textContent !== (word || '')) label.textContent = word || '';
    }, { passive: true });
    window.addEventListener('pointerdown', () => ring.classList.add('down'), { passive: true });
    window.addEventListener('pointerup', () => ring.classList.remove('down'), { passive: true });
    root.addEventListener('pointerleave', () => ring.classList.remove('on'));
    root.addEventListener('pointerenter', () => { if (seen) ring.classList.add('on'); });

    tickers.push(dt => {
      pos.x = lerp(pos.x, pos.tx, Math.min(1, dt * 16));
      pos.y = lerp(pos.y, pos.ty, Math.min(1, dt * 16));
      ring.style.transform = `translate3d(${pos.x.toFixed(1)}px,${pos.y.toFixed(1)}px,0)`;
    });
  });

  /* ====================================================================
   * 9. COPY-EMAIL button + IST clock
   * ==================================================================== */
  safe('copy', () => {
    const link = $('.contact-email');
    if (!link) return;
    const btn = el('button', 'm2-copy', '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/></svg>');
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Copy email address');
    btn.addEventListener('click', copyEmail);
    link.insertAdjacentElement('afterend', btn);
  });

  safe('clock', () => {
    const where = $('.hero-footer .location');
    if (!where) return;
    const span = el('span', 'm2-clock');
    where.appendChild(span);
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', hour12: false });
    const upd = () => { span.textContent = '· ' + fmt.format(new Date()) + ' IST'; };
    upd();
    setInterval(upd, 20000);
  });

  /* ====================================================================
   * 10. ART PLAYGROUND — paint flowing light in the creative studio
   * ==================================================================== */
  safe('playground', () => {
    const studio = $('.creative-studio');
    if (!studio) return;
    const canvas = el('canvas', 'm2-paint');
    canvas.setAttribute('aria-hidden', 'true');
    studio.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let w = 0, h = 0, dpr = 1;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = studio.clientWidth; h = studio.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(studio);

    const palette = ['178,161,244', '198,172,228', '162,201,219', '215,176,247'];
    const parts = [];
    let visible = false, idle = 0, lx = 0, ly = 0, lt = 0;
    if (hasIO) new IntersectionObserver(e => { visible = e[0].isIntersecting; }).observe(studio);

    function emit(x, y, vx, vy, n) {
      for (let i = 0; i < n && parts.length < 420; i++) {
        parts.push({ x, y, px: x, py: y, vx: vx * 0.12 + rand(-40, 40), vy: vy * 0.12 + rand(-40, 40), age: 0, max: rand(0.9, 2.1), c: palette[(Math.random() * palette.length) | 0], w: rand(0.9, 2.3) });
      }
      idle = 0;
    }
    studio.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const r = studio.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top, now = performance.now();
      const dt = Math.max(1, now - lt) / 1000;
      const vx = (x - lx) / dt, vy = (y - ly) / dt;
      if (now - lt < 80) emit(x, y, vx, vy, clamp(Math.hypot(vx, vy) / 500, 1, 4) | 0 || 1);
      lx = x; ly = y; lt = now;
    });
    studio.addEventListener('pointerdown', e => {
      const r = studio.getBoundingClientRect();
      const x = e.clientX - r.left, y = e.clientY - r.top;
      for (let i = 0; i < 46; i++) {
        const a = (i / 46) * Math.PI * 2, s = rand(60, 220);
        emit(x, y, Math.cos(a) * s / 0.12, Math.sin(a) * s / 0.12, 1);
      }
    });

    let t = 0;
    tickers.push(dt => {
      if (!visible || (!parts.length && idle > 2)) return;
      t += dt; idle += dt;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.fillStyle = 'rgba(0,0,0,0.09)';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        if (p.age > p.max) { parts.splice(i, 1); continue; }
        const ang = (Math.sin(p.x * 0.012 + t * 0.9) + Math.cos(p.y * 0.014 - t * 0.7)) * 1.6;
        p.vx += Math.cos(ang) * 150 * dt; p.vy += Math.sin(ang) * 150 * dt;
        p.vx *= 0.97; p.vy *= 0.97;
        p.px = p.x; p.py = p.y;
        p.x += p.vx * dt; p.y += p.vy * dt;
        const a = (1 - p.age / p.max) * 0.8;
        ctx.strokeStyle = `rgba(${p.c},${a.toFixed(3)})`;
        ctx.lineWidth = p.w;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x, p.y); ctx.stroke();
      }
    });
  });

  /* ====================================================================
   * 11. BLUEPRINT GRID (press G, or via the palette)
   * ==================================================================== */
  safe('blueprint', () => {
    let overlay = null, readout = null, on = false;
    const move = e => { if (readout) readout.textContent = `x ${Math.round(e.clientX)} · y ${Math.round(e.clientY + window.scrollY)}`; };
    toggleBlueprint = () => {
      on = !on;
      if (on && !overlay) {
        overlay = el('div', 'm2-grid');
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = '<div class="m2-cols">' + '<i></i>'.repeat(12) + '</div>';
        readout = el('div', 'm2-readout', 'x 0 · y 0');
        overlay.appendChild(readout);
        document.body.appendChild(overlay);
      }
      root.classList.toggle('m2-blueprint', on);
      if (overlay) overlay.hidden = !on;
      if (on) window.addEventListener('pointermove', move, { passive: true });
      else window.removeEventListener('pointermove', move);
      toast(on ? 'Blueprint grid on · press G to exit' : 'Blueprint grid off');
    };
    document.addEventListener('keydown', e => {
      if (e.key.toLowerCase() !== 'g' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable) return;
      toggleBlueprint();
    });
  });

  /* ====================================================================
   * 12. PHONE TILT drives the hero depth (Android directly, iOS after a tap)
   * ==================================================================== */
  if (!fine) safe('tilt', () => {
    const mo = () => window.__motion;
    const heroArt = $('.hero-art');
    let enabled = false;
    function on() {
      if (enabled || !mo()) return;
      enabled = true;
      mo().sensor.on = true;
      window.addEventListener('deviceorientation', e => {
        if (e.gamma == null) return;
        const s = mo().sensor;
        s.x = lerp(s.x, clamp(e.gamma / 28, -1, 1), 0.12);
        s.y = lerp(s.y, clamp((e.beta - 50) / 28, -1, 1), 0.12);
      }, { passive: true });
    }
    const DOE = window.DeviceOrientationEvent;
    if (!DOE) return;
    if (typeof DOE.requestPermission === 'function') {
      if (heroArt) heroArt.addEventListener('pointerup', () => {
        if (enabled) return;
        DOE.requestPermission().then(r => { if (r === 'granted') on(); }).catch(() => {});
      }, { once: false });
    } else on();
  });

  startLoop();
})();
