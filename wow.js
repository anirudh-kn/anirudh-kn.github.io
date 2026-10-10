/* ==========================================================================
   wow.js — round 5 (additive): living violet background, scroll-reactive tool
   marquee, liquid portrait, drifting ghost words, secret "data" rain.
   No libraries, works from file://. Skipped entirely for reduced-motion.
   ========================================================================== */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const safe = (n, f) => { try { f(); } catch (e) { console.warn('[wow:' + n + ']', e); } };

  /* shared scroll velocity (px/frame-ish, signed) */
  let lastY = window.scrollY, scrollV = 0;
  const trackScroll = () => { const y = window.scrollY; scrollV = lerp(scrollV, y - lastY, .2); lastY = y; };

  /* ====================================================================
   * 1. LIVING BACKGROUND — low-res domain-warped noise, cursor lens
   * ==================================================================== */
  safe('field', () => {
    const c = document.createElement('canvas');
    c.className = 'wow-field'; c.setAttribute('aria-hidden', 'true');
    const gl = c.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
    if (!gl) return;
    const vs = 'attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }';
    const fs = `precision mediump float;
      uniform vec2 u_res; uniform float u_t; uniform vec3 u_m;
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
        return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
      float fbm(vec2 p){ float a = .5, s = 0.; for (int i = 0; i < 4; i++){ s += a * n(p); p *= 2.02; a *= .5; } return s; }
      void main(){
        vec2 uv = gl_FragCoord.xy / u_res; float asp = u_res.x / u_res.y;
        vec2 p = uv * vec2(asp, 1.) * 2.4, m = u_m.xy * vec2(asp, 1.) * 2.4;
        float d = length(p - m);
        p += (p - m) * exp(-d * 1.8) * u_m.z * .55;
        float t = u_t * .045;
        vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
        float f = fbm(p + 3. * q + t * 2.);
        float body = smoothstep(.38, .86, f);
        float glow = exp(-d * d * 2.2) * u_m.z;
        vec3 col = mix(vec3(.30, .22, .62), vec3(.62, .52, .96), body) + glow * vec3(.2, .15, .3);
        float a = .012 + .06 * body + glow * .075;
        gl_FragColor = vec4(col * a, a);
      }`;
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(pr); if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) throw new Error('link');
    gl.useProgram(pr);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(pr, 'u_res'), uT = gl.getUniformLocation(pr, 'u_t'), uM = gl.getUniformLocation(pr, 'u_m');
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    const SCALE = fine ? 5 : 7;
    const size = () => { c.width = Math.max(2, Math.ceil(window.innerWidth / SCALE)); c.height = Math.max(2, Math.ceil(window.innerHeight / SCALE)); gl.viewport(0, 0, c.width, c.height); };
    size(); window.addEventListener('resize', size);
    document.body.insertBefore(c, document.body.firstChild);
    root.classList.add('wow-field-on');
    const m = { x: .72, y: .35, s: 0, tx: .72, ty: .35, ts: 0 };
    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      m.tx = e.clientX / window.innerWidth; m.ty = 1 - e.clientY / window.innerHeight; m.ts = 1;
    }, { passive: true });
    document.addEventListener('pointerleave', () => { m.ts = 0; });
    let t = 0, last = performance.now(), acc = 0;
    const frame = now => {
      requestAnimationFrame(frame);
      const dt = Math.min(.1, (now - last) / 1000); last = now;
      if (document.hidden) return;
      acc += dt; if (acc < 1 / 30) return; const step = acc; acc = 0;
      trackScroll();
      t += step * (1 + Math.min(6, Math.abs(scrollV) * .12));
      m.x = lerp(m.x, m.tx, .12); m.y = lerp(m.y, m.ty, .12); m.s = lerp(m.s, m.ts, .06);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(uRes, c.width, c.height); gl.uniform1f(uT, t); gl.uniform3f(uM, m.x, m.y, m.s);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    requestAnimationFrame(frame);
  });

  /* ====================================================================
   * 2. SCROLL-REACTIVE TOOL MARQUEE (same words, same order)
   * ==================================================================== */
  safe('marquee', () => {
    const strip = $('.tool-strip'); const box = strip && $('.container', strip);
    if (!box) return;
    const set = box.cloneNode(true);
    const track = document.createElement('div'); track.className = 'wow-track';
    const mkSet = clone => {
      const s = document.createElement('div'); s.className = 'wow-set';
      [...set.childNodes].forEach(n => s.appendChild(n.cloneNode(true)));
      const tail = document.createElement('i'); tail.setAttribute('aria-hidden', 'true'); tail.textContent = '+'; s.appendChild(tail);
      if (clone) s.setAttribute('aria-hidden', 'true');
      return s;
    };
    track.appendChild(mkSet(false));
    for (let i = 0; i < 3; i++) track.appendChild(mkSet(true));
    box.textContent = ''; box.appendChild(track);
    strip.classList.add('wow-mq');
    let x = 0, dir = -1, vel = -46, vis = true, last = performance.now();
    if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; }).observe(strip);
    const frame = now => {
      requestAnimationFrame(frame);
      const dt = Math.min(.05, (now - last) / 1000); last = now;
      if (!vis || document.hidden) return;
      if (Math.abs(scrollV) > 1.5) dir = scrollV > 0 ? -1 : 1;
      const target = dir * (46 + Math.min(900, Math.abs(scrollV) * 38));
      vel = lerp(vel, target, Math.min(1, dt * 4));
      const w = track.firstChild.getBoundingClientRect().width || 1;
      x += vel * dt;
      if (x <= -w) x += w; else if (x > 0) x -= w;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    };
    requestAnimationFrame(frame);
    window.addEventListener('scroll', trackScroll, { passive: true });
  });

  /* ====================================================================
   * 3. LIQUID PORTRAIT — flowing displacement that follows cursor energy
   * ==================================================================== */
  safe('liquid', () => {
    if (!fine) return;
    const art = $('.hero-art'), img = $('.hero-portrait img');
    if (!art || !img) return;
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0'); svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
    svg.innerHTML = '<filter id="wow-liquid" x="-4%" y="-4%" width="108%" height="108%" color-interpolation-filters="sRGB">' +
      '<feTurbulence id="wow-turb" type="fractalNoise" baseFrequency="0.010 0.014" numOctaves="2" seed="4" result="n"/>' +
      '<feDisplacementMap id="wow-disp" in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="G"/></filter>';
    document.body.appendChild(svg);
    const turb = svg.querySelector('#wow-turb'), disp = svg.querySelector('#wow-disp');
    let energy = 0, px = 0, py = 0, on = false, running = false, t = 0;
    const loop = () => {
      t += .016; energy *= .93;
      if (energy < .25) { img.style.filter = ''; on = false; running = false; disp.setAttribute('scale', '0'); return; }
      disp.setAttribute('scale', Math.min(7, energy).toFixed(2));
      turb.setAttribute('baseFrequency', (0.010 + Math.sin(t * 1.3) * .0025).toFixed(5) + ' ' + (0.014 + Math.cos(t * 1.1) * .003).toFixed(5));
      requestAnimationFrame(loop);
    };
    art.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      const sp = Math.hypot(e.clientX - px, e.clientY - py); px = e.clientX; py = e.clientY;
      energy = Math.min(7, energy + sp * .12);
      if (!on && energy > 1) { img.style.filter = 'url(#wow-liquid)'; on = true; }
      if (!running && on) { running = true; requestAnimationFrame(loop); }
    }, { passive: true });
  });

  /* ====================================================================
   * 4. GHOST WORDS — outlined, drifting at a slower scroll speed
   * ==================================================================== */
  safe('ghosts', () => {
    const defs = [['#about', 'DATA', 'l'], ['#skills', 'AI', 'r'], ['#creative', 'ART', 'r']];
    const items = [];
    defs.forEach(([sel, word, side]) => {
      const host = $(sel); if (!host) return;
      host.classList.add('wow-gh-host');
      const wrap = document.createElement('div'); wrap.className = 'wow-gh-wrap'; wrap.setAttribute('aria-hidden', 'true');
      const w = document.createElement('span'); w.className = 'wow-gh wow-gh-' + side; w.textContent = word;
      wrap.appendChild(w); host.insertBefore(wrap, host.firstChild);
      items.push({ host, w });
    });
    if (!items.length) return;
    let ticking = false;
    const upd = () => {
      ticking = false;
      const vh = window.innerHeight;
      items.forEach(({ host, w }) => {
        const r = host.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        const p = (r.top + r.height / 2 - vh / 2);
        w.style.translate = '0 ' + (-p * .22).toFixed(1) + 'px';
      });
    };
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  });

  /* ====================================================================
   * 5. SECRET: type "data" anywhere
   * ==================================================================== */
  safe('rain', () => {
    let buf = '', running = false;
    window.addEventListener('keydown', e => {
      const tg = e.target && e.target.tagName;
      if (tg === 'INPUT' || tg === 'TEXTAREA' || e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1) return;
      buf = (buf + e.key.toLowerCase()).slice(-4);
      if (buf === 'data' && !running) { running = true; buf = ''; rain(); }
    });
    const rain = () => {
      const c = document.createElement('canvas'); c.className = 'wow-rain'; c.setAttribute('aria-hidden', 'true');
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth, H = window.innerHeight;
      c.width = W * dpr; c.height = H * dpr; c.style.width = W + 'px'; c.style.height = H + 'px';
      document.body.appendChild(c);
      const x = c.getContext('2d'); x.scale(dpr, dpr);
      const SZ = 16, cols = Math.ceil(W / SZ), drops = Array.from({ length: cols }, () => -Math.random() * 40);
      const G = '01{}[]<>/+=×∗#%$ANALYTICS'.split('');
      const t0 = performance.now(), DUR = 4800;
      x.font = '500 ' + SZ + 'px ui-monospace, Menlo, Consolas, monospace';
      const f = now => {
        const e = now - t0;
        x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,.09)'; x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = 'source-over';
        if (e < DUR - 900) {
          for (let i = 0; i < cols; i++) {
            const y = drops[i] * SZ;
            x.fillStyle = 'rgba(238,233,255,.95)'; x.fillText(G[(Math.random() * G.length) | 0], i * SZ, y);
            x.fillStyle = 'rgba(178,161,244,.55)'; x.fillText(G[(Math.random() * G.length) | 0], i * SZ, y - SZ);
            if (y > H && Math.random() > .975) drops[i] = 0; else drops[i] += .55 + (i % 5) * .08;
          }
        }
        c.style.opacity = e > DUR - 900 ? String(Math.max(0, (DUR - e) / 900)) : '1';
        if (e < DUR) requestAnimationFrame(f); else { c.remove(); running = false; }
      };
      requestAnimationFrame(f);
    };
  });
})();
