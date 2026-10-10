/* ==========================================================================
   fx.js — round 3: cinematic scroll + signature interactions (additive)
   - pinned "Learn → Create" morphing journey
   - horizontal film-strip for the project rows (desktop)
   - interactive risk-model playground (illustrative)
   - curtain page transitions for in-page navigation
   - scroll-speed reactive headings, CV-download confetti
   No libraries, works from file://. Each feature is isolated; reduced-motion
   visitors get the original site untouched.
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
  const smooth = t => t * t * (3 - 2 * t);
  const hasIO = 'IntersectionObserver' in window;
  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[fx:' + name + ']', e); } };
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  function mulberry(seed) {
    return () => {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  root.classList.add('fx-on');

  /* shared frame loop */
  const tickers = [];
  let raf = 0, last = performance.now();
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    for (const t of tickers) { try { t(dt, now); } catch (e) { /* keep alive */ } }
    raf = requestAnimationFrame(loop);
  }
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  /* ====================================================================
   * 1. SCROLL-SPEED REACTIVE HEADINGS
   * ==================================================================== */
  let prevY = window.scrollY;
  safe('velocity', () => {
    let vel = 0, shown = 0, lastSet = 0, active = false;
    tickers.push(dt => {
      const y = window.scrollY;
      const v = (y - prevY) / Math.max(dt, 0.001);
      prevY = y;
      vel = lerp(vel, v, 0.25);
      shown = lerp(shown, clamp(vel / 1500, -1, 1), Math.min(1, dt * 9));
      if (Math.abs(shown) > 0.012) {
        if (!active) { root.classList.add('fx-skew'); active = true; }
        if (Math.abs(shown - lastSet) > 0.004) { root.style.setProperty('--fx-v', shown.toFixed(3)); lastSet = shown; }
      } else if (active) {
        root.classList.remove('fx-skew'); root.style.removeProperty('--fx-v'); active = false; lastSet = 0;
      }
    });
  });

  /* ====================================================================
   * 2. CURTAIN PAGE TRANSITIONS for in-page navigation
   * ==================================================================== */
  const FX = (window.__fx = {});
  safe('curtain', () => {
    const cols = 6;
    const curtain = el('div', 'fx-curtain', '<i></i>'.repeat(cols) + '<b>anirudh<span>.</span></b>');
    curtain.setAttribute('aria-hidden', 'true');
    document.body.appendChild(curtain);
    const strips = $$('i', curtain);
    const mark = $('b', curtain);
    let busy = false;

    const run = (frames, i, opts) => strips[i].animate(frames, Object.assign({ fill: 'forwards' }, opts)).finished;

    async function wipe(topY) {
      busy = true;
      curtain.classList.add('on');
      strips.forEach(s => { s.style.transformOrigin = '50% 100%'; });
      await Promise.all(strips.map((_, i) => run(
        [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }],
        i, { duration: 380, delay: i * 38, easing: 'cubic-bezier(.7,0,.2,1)' })));
      mark.animate([{ opacity: 0, transform: 'scale(.94)' }, { opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(1.04)' }], { duration: 520, easing: 'ease' });
      window.scrollTo({ top: topY, behavior: 'instant' });
      prevY = window.scrollY;
      await new Promise(r => setTimeout(r, 300));
      strips.forEach(s => { s.style.transformOrigin = '50% 0%'; });
      await Promise.all(strips.map((_, i) => run(
        [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }],
        i, { duration: 380, delay: i * 38, easing: 'cubic-bezier(.7,0,.2,1)' })));
      strips.forEach(s => s.getAnimations().forEach(a => a.cancel()));
      curtain.classList.remove('on');
      busy = false;
    }

    FX.go = async hash => {
      if (busy) return;
      let target = null;
      if (hash && hash !== '#' && hash !== '#home') { try { target = document.querySelector(hash); } catch (e) { /* bad selector */ } }
      if (hash !== '#home' && hash !== '#' && !target) { location.hash = hash; return; }
      const pad = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0;
      const topY = !target ? 0 : Math.max(0, target.getBoundingClientRect().top + window.scrollY - pad);
      try { history.pushState(null, '', hash === '#home' || hash === '#' ? location.pathname + location.search : hash); } catch (e) { /* ignore */ }
      const far = Math.abs(topY - window.scrollY) > window.innerHeight * 0.9;
      if (far) await wipe(topY); else window.scrollTo({ top: topY, behavior: 'smooth' });
      const focusEl = target || $('#home');
      if (focusEl) { focusEl.setAttribute('tabindex', '-1'); focusEl.focus({ preventScroll: true }); }
    };

    document.addEventListener('click', e => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a || a.classList.contains('skip-link')) return;
      const hash = a.getAttribute('href');
      if (!hash || hash === '#') return;
      e.preventDefault();
      FX.go(hash);
    }, true);
  });

  /* ====================================================================
   * 3. PINNED JOURNEY — one swarm of points morphs Learn → Analyze → Build
   *    → Visualize → Create (all wording is reused from the page itself)
   * ==================================================================== */
  safe('journey', () => {
    const strip = $('.tool-strip');
    if (!strip) return;
    const stages = [
      ['Learn', 'Always learning'],
      ['Analyze', 'Every number has a story.'],
      ['Build', 'Python, Power BI, and machine learning'],
      ['Visualize', 'Turning data into insight.'],
      ['Create', 'And ideas into visuals.']
    ];
    const sec = el('section', 'fx-journey');
    sec.setAttribute('aria-hidden', 'true');
    sec.innerHTML = `<div class="fx-j-pin container">
      <div class="fx-j-copy">
        <p class="fx-j-eyebrow">THE INTERSECTION OF LOGIC &amp; IMAGINATION</p>
        <p class="fx-j-count"><b>01</b> / 0${stages.length}</p>
        ${stages.map(([w, l]) => `<div class="fx-j-stage"><div class="fx-j-word">${w}<span>.</span></div><p class="fx-j-line">${l}</p></div>`).join('')}
        <div class="fx-j-dots">${stages.map(() => '<i></i>').join('')}</div>
      </div>
      <canvas class="fx-j-canvas"></canvas></div>`;
    strip.insertAdjacentElement('afterend', sec);

    const canvas = $('canvas', sec), ctx = canvas.getContext('2d');
    if (!ctx) return;
    const stageEls = $$('.fx-j-stage', sec), dots = $$('.fx-j-dots i', sec), countEl = $('.fx-j-count b', sec);

    /* ---- layouts in unit space (-1..1) ---- */
    const N = 300, rng = mulberry(11);
    const gauss = () => Math.sqrt(-2 * Math.log(rng() + 1e-9)) * Math.cos(6.2832 * rng());
    const disc = r => { const a = rng() * 6.2832, d = Math.sqrt(rng()) * r; return [Math.cos(a) * d, Math.sin(a) * d]; };
    const mk = (x, y, a, s) => ({ x, y, a, s });

    const L = [[], [], [], [], []];
    for (let i = 0; i < N; i++) { const [x, y] = disc(0.95); L[0].push(mk(x, y, 0.75, 1.2 + rng() * 1.2)); }   /* raw data */
    const centres = [[-0.5, -0.4], [0.5, -0.45], [-0.45, 0.45], [0.52, 0.42]];
    for (let i = 0; i < N; i++) { const c = centres[i % 4]; L[1].push(mk(c[0] + gauss() * 0.12, c[1] + gauss() * 0.12, 0.9, 1.5 + rng())); }
    const cols = [[-0.82, 5], [-0.28, 8], [0.28, 8], [0.82, 4]];
    const netNodes = [];
    cols.forEach(([x, n], c) => {
      for (let k = 0; k < n; k++) {
        const y = n === 1 ? 0 : -0.72 + (1.44 * k) / (n - 1);
        netNodes.push({ c, i: L[2].length });
        L[2].push(mk(x, y, 1, 3.2));
      }
    });
    while (L[2].length < N) { const [x, y] = disc(1.0); L[2].push(mk(x, y, 0.16, 1)); }
    const hs = [0.2, 0.32, 0.28, 0.46, 0.52, 0.44, 0.62, 0.72, 0.68, 0.84, 0.94, 0.8];
    hs.forEach((h, b) => {
      const n = Math.round(h * 15);
      for (let side = 0; side < 2; side++) {
        for (let k = 0; k < n; k++) {
          if (L[3].length >= N) return;
          L[3].push(mk(-0.9 + b * 0.164 + side * 0.058, 0.8 - k * 0.062, 1, 2.4));
        }
      }
    });
    while (L[3].length < N) { const [x, y] = disc(1.0); L[3].push(mk(x, y, 0.14, 1)); }
    for (let i = 0; i < N; i++) {
      const r = 0.96 * Math.sqrt((i + 0.5) / N), th = i * 2.399963;
      L[4].push(mk(Math.cos(th) * r, Math.sin(th) * r, 0.55 + 0.45 * (1 - r), 1 + 2.1 * (1 - r)));
    }
    const pts = Array.from({ length: N }, (_, i) => ({ d: rng() * 0.42, g: i % 3, ph: rng() * 6.28, sw: i % 2 ? 1 : -1 }));
    const rgb = ['178,161,244', '162,201,219', '215,196,250'];

    /* net connections */
    const links = [];
    for (let c = 0; c < 3; c++) {
      netNodes.filter(n => n.c === c).forEach(a => netNodes.filter(n => n.c === c + 1).forEach(b => links.push([a.i, b.i])));
    }

    let w = 0, h = 0, dpr = 1, R = 0, visible = false;
    function size() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      R = Math.min(w, h) / 2 * 0.9;
    }
    size();
    if ('ResizeObserver' in window) new ResizeObserver(size).observe(canvas);
    if (hasIO) new IntersectionObserver(e => { visible = e[0].isIntersecting; }, { rootMargin: '10% 0px' }).observe(sec);
    else visible = true;

    const pos = Array.from({ length: N }, () => ({ x: 0, y: 0, a: 0, s: 1 }));
    let lastStage = -1;

    tickers.push((dt, now) => {
      if (!visible || !w) return;
      const r = sec.getBoundingClientRect();
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      const raw = p * (stages.length - 1);
      const seg = Math.min(stages.length - 2, Math.floor(raw));
      const f = smooth(clamp((raw - seg - 0.2) / 0.6, 0, 1));    /* hold at each stage */
      const sEff = seg + f;
      const t = now / 1000;

      /* --- copy --- */
      stageEls.forEach((st, k) => {
        const dist = Math.abs(sEff - k);
        const o = clamp(1 - dist * 1.7, 0, 1);
        st.style.opacity = o.toFixed(3);
        st.style.transform = `translate3d(0, ${((k - sEff) * 46).toFixed(1)}px, 0)`;
        st.style.filter = o < 0.98 ? `blur(${((1 - o) * 7).toFixed(1)}px)` : 'none';
        st.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      });
      const stageNow = Math.round(sEff);
      if (stageNow !== lastStage) {
        lastStage = stageNow;
        dots.forEach((d, k) => d.classList.toggle('on', k <= stageNow));
        countEl.textContent = '0' + (stageNow + 1);
      }

      /* --- morph --- */
      const A = L[seg], B = L[seg + 1];
      const mouse = window.__motion && window.__motion.mouse;
      let mx = -1e5, my = -1e5;
      if (mouse && mouse.active) { const cr = canvas.getBoundingClientRect(); mx = mouse.x - cr.left; my = mouse.y - cr.top; }
      const cx = w / 2, cy = h / 2;
      const w5 = clamp(sEff - 3, 0, 1);
      const rot = t * 0.18 * w5, cs = Math.cos(rot), sn = Math.sin(rot);

      for (let i = 0; i < N; i++) {
        const pt = pts[i], a = A[i], b = B[i];
        const fp = smooth(clamp(f * 1.42 - pt.d, 0, 1));
        let x = lerp(a.x, b.x, fp), y = lerp(a.y, b.y, fp);
        const swirl = Math.sin(Math.PI * fp) * 0.09 * pt.sw;
        x += -(b.y - a.y) * swirl; y += (b.x - a.x) * swirl;
        x += Math.sin(t * 0.9 + pt.ph) * 0.007; y += Math.cos(t * 0.8 + pt.ph) * 0.007;
        if (w5 > 0) { const rx = x * cs - y * sn, ry = x * sn + y * cs; x = lerp(x, rx, w5); y = lerp(y, ry, w5); }
        let px = cx + x * R, py = cy + y * R;
        const dx = px - mx, dy = py - my, dd = dx * dx + dy * dy;
        if (dd < 5600) { const k = (1 - Math.sqrt(dd) / 75) * 20; const m = Math.sqrt(dd) || 1; px += (dx / m) * k; py += (dy / m) * k; }
        const o = pos[i]; o.x = px; o.y = py; o.a = lerp(a.a, b.a, fp); o.s = lerp(a.s, b.s, fp);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      /* stage decorations */
      const w2 = clamp(1 - Math.abs(sEff - 1) * 1.5, 0, 1);
      if (w2 > 0.02) {
        ctx.lineWidth = 1; ctx.strokeStyle = `rgba(178,161,244,${(0.16 * w2).toFixed(3)})`;
        centres.forEach(c => { ctx.beginPath(); ctx.arc(cx + c[0] * R, cy + c[1] * R, 0.2 * R, 0, 6.2832); ctx.stroke(); });
      }
      const w3 = clamp(1 - Math.abs(sEff - 2) * 1.4, 0, 1);
      if (w3 > 0.02) {
        ctx.lineWidth = 0.8;
        ctx.strokeStyle = `rgba(178,161,244,${(0.2 * w3).toFixed(3)})`;
        ctx.beginPath();
        links.forEach(([i, j]) => { ctx.moveTo(pos[i].x, pos[i].y); ctx.lineTo(pos[j].x, pos[j].y); });
        ctx.stroke();
        for (let k = 0; k < 9; k++) {                                   /* signals flowing through the model */
          const lk = links[(k * 37 + 5) % links.length], u = (t * 0.55 + k * 0.37) % 1;
          const a = pos[lk[0]], b = pos[lk[1]];
          ctx.fillStyle = `rgba(235,228,255,${(0.9 * w3).toFixed(3)})`;
          ctx.beginPath(); ctx.arc(lerp(a.x, b.x, u), lerp(a.y, b.y, u), 1.8, 0, 6.2832); ctx.fill();
        }
      }
      const w4 = clamp(1 - Math.abs(sEff - 3) * 1.5, 0, 1);
      if (w4 > 0.02) {
        ctx.strokeStyle = `rgba(178,161,244,${(0.3 * w4).toFixed(3)})`; ctx.lineWidth = 1;
        const yb = cy + 0.84 * R;
        ctx.beginPath(); ctx.moveTo(cx - 0.94 * R, yb); ctx.lineTo(cx + 0.94 * R, yb); ctx.stroke();
      }

      /* points */
      for (let i = 0; i < N; i++) {
        const o = pos[i];
        ctx.fillStyle = `rgba(${rgb[pts[i].g]},${clamp(o.a, 0, 1).toFixed(3)})`;
        const s = o.s;
        ctx.beginPath(); ctx.arc(o.x, o.y, s * 0.55 + 0.4, 0, 6.2832); ctx.fill();
      }
    });
  });

  /* ====================================================================
   * 4. HORIZONTAL FILM-STRIP for the project rows (desktop, mouse devices)
   * ==================================================================== */
  safe('hscroll', () => {
    if (!fine) return;
    const list = $('.project-list');
    if (!list) return;
    const rows = $$('.project-row', list);
    if (rows.length < 2) return;
    const mq = window.matchMedia('(min-width: 1100px)');
    let wrap, pin, meta, fill, countB, on = false, travel = 0, shown = 0, left = 0, lefts = [], widths = [];

    function measure() {
      if (!on) return;
      const vw = root.clientWidth;
      list.style.transform = 'none';
      rows.forEach(r => { r.style.transform = ''; });
      left = wrap.getBoundingClientRect().left;
      pin.style.width = vw + 'px';
      pin.style.marginLeft = -left + 'px';
      list.style.paddingLeft = left + 'px';
      list.style.paddingRight = left + 'px';
      meta.style.left = left + 'px'; meta.style.right = left + 'px';
      const lr = list.getBoundingClientRect();
      lefts = rows.map(r => r.getBoundingClientRect().left - lr.left);
      widths = rows.map(r => r.getBoundingClientRect().width);
      travel = Math.max(0, list.scrollWidth - vw);
      wrap.style.height = Math.round(travel + window.innerHeight) + 'px';
    }
    function build() {
      if (on) return;
      wrap = el('div', 'fx-hs'); pin = el('div', 'fx-hs-pin');
      meta = el('div', 'fx-hs-meta', `<span class="fx-hs-count"><b>01</b> / 0${rows.length}</span><span class="fx-hs-bar"><i></i></span>`);
      list.parentNode.insertBefore(wrap, list);
      wrap.appendChild(pin); pin.appendChild(list); pin.appendChild(meta);
      fill = $('i', meta); countB = $('b', meta);
      list.classList.add('fx-hs-on');
      rows.forEach(r => r.classList.remove('m-pre', 'm-in'));
      on = true; shown = 0;
      measure();
    }
    function destroy() {
      if (!on) return;
      wrap.parentNode.insertBefore(list, wrap);
      wrap.remove();
      list.classList.remove('fx-hs-on');
      list.style.cssText = '';
      rows.forEach(r => { r.style.transform = ''; });
      on = false;
    }
    const sync = () => (mq.matches ? build() : destroy());
    mq.addEventListener('change', sync);
    sync();
    window.addEventListener('resize', () => { clearTimeout(sync.t); sync.t = setTimeout(measure, 120); }, { passive: true });
    window.addEventListener('load', () => setTimeout(measure, 60));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => measure());

    tickers.push(dt => {
      if (!on) return;
      const r = wrap.getBoundingClientRect();
      if (r.bottom < -80 || r.top > window.innerHeight + 80) return;
      const p = clamp(-r.top / Math.max(1, r.height - window.innerHeight), 0, 1);
      shown = lerp(shown, p, Math.min(1, dt * 9));
      const x = -shown * travel, vw = root.clientWidth;
      list.style.transform = `translate3d(${x.toFixed(1)}px,0,0)`;
      rows.forEach((row, i) => {
        const c = lefts[i] + widths[i] / 2 + x;
        const d = (c - vw / 2) / vw;
        const ang = clamp(-d * 24, -17, 17);
        const sc = 1 - Math.min(0.09, Math.abs(d) * 0.11);
        row.style.transform = `perspective(1300px) rotateY(${ang.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
      });
      fill.style.transform = `scaleX(${shown.toFixed(4)})`;
      const idx = Math.round(shown * (rows.length - 1));
      if (countB.textContent !== '0' + (idx + 1)) countB.textContent = '0' + (idx + 1);
    });

    /* keyboard: bring a focused card into view */
    list.addEventListener('focusin', e => {
      if (!on) return;
      const row = e.target.closest('.project-row');
      const i = rows.indexOf(row);
      if (i < 0 || !travel) return;
      const p = clamp((lefts[i] - left) / travel, 0, 1);
      const top = wrap.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: top + p * (wrap.offsetHeight - window.innerHeight), behavior: 'smooth' });
    });
  });

  /* ====================================================================
   * 6. CV-download confetti
   * ==================================================================== */
  safe('confetti', () => {
    const colours = ['#b2a1f4', '#c7b8ff', '#a2c9db', '#d7b0f7', '#eee9ff'];
    $$('a[download]').forEach(a => a.addEventListener('click', e => {
      const x = e.clientX || a.getBoundingClientRect().left + 40, y = e.clientY || a.getBoundingClientRect().top;
      for (let i = 0; i < 38; i++) {
        const s = el('span', 'fx-confetti');
        s.style.background = colours[i % colours.length];
        s.style.width = (4 + Math.random() * 5) + 'px'; s.style.height = (3 + Math.random() * 6) + 'px';
        if (i % 3 === 0) s.style.borderRadius = '50%';
        document.body.appendChild(s);
        const dx = (Math.random() - 0.5) * 340, up = 90 + Math.random() * 170, fall = 80 + Math.random() * 220, rot = (Math.random() - 0.5) * 900;
        s.animate([
          { transform: `translate(${x}px,${y}px) rotate(0)`, opacity: 1 },
          { transform: `translate(${x + dx * 0.6}px,${y - up}px) rotate(${rot * 0.5}deg)`, opacity: 1, offset: 0.35 },
          { transform: `translate(${x + dx}px,${y + fall}px) rotate(${rot}deg)`, opacity: 0 }
        ], { duration: 1100 + Math.random() * 700, easing: 'cubic-bezier(.2,.7,.4,1)' }).onfinish = () => s.remove();
      }
    }));
  });

  start();
})();
