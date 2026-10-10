/* ==========================================================================
   orbgl.js — round 4: real WebGL 3D data-core for the hero (additive)
   Raw WebGL, no libraries, works from file://. A limb-lit dotted Earth with
   continents, three tilted orbital rings and drifting data motes — all in true
   3D with perspective, depth fade, cursor repulsion and a click shock-wave.
   Driven by the existing draggable orb state (window.__motion.orbState).
   Falls back silently (original orb stays) if WebGL is unavailable.
   ========================================================================== */
(() => {
  'use strict';
  const scene = document.querySelector('.orb-scene');
  const slot = document.querySelector('.orb-position');
  if (!scene || !slot) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small = window.matchMedia('(max-width: 800px)').matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'u-gl';
  canvas.setAttribute('aria-hidden', 'true');
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'low-power' });
  if (!gl) return;

  const LAND = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAfAP8HAAAAAAAAAAAAAAAAAAAAAADo//z//wcAAAAAAAACAAAAAAAAAAAAhvvw//8PAPABAAAAwAMAAAAAAAAAwADkw////wEABAAAAABgAAAAAAAAAADAUT8A/v8PAAAAAAwA/j8AuAEAAAAAcBHtDcD/fwAAAAAwAPz/fwMAABCAAQD5w/wD8P8FAAAcAIL7//9//xOAAP/ff0668QD/HwAA+A8At///////v3/w/////x8++B8AAOD/1//7////////jP////+/+AE/gAcAn9f//////////w/w/////wEs4AEAAHz+////////////gL////8HeAAcAADg5///////////9ADgAf7/f4AnAAAAAH78////////H0QAAAiA//8f8AcAAIBB4////////38ADwAQAOD//5//AQAAHAT/////////A3AAAAAA/v//+T8AAGDz//////////8DAQAAAMD/////AwAAsP//////////LwAAAAAA6P///2IAAAD+//////////8CAAAAAAD///8/CAAA4P//////////JwAAAAAA8P///wYAAAD+/unz/////z8AAAAAAAD///8HAAAA/pgPPP//////MQAAAAAA8P//PwAAAMBD9v7n/////wcBAAAAAAD///8AAAAAPkD7f/7///8hEAAAAAAA4P//DwAAAIDhAv/n////f8YAAAAAAAD8//8AAAAA+AdE//////8jDwAAAAAAgP//AwAAAMD/APD/////PxgAAAAAAADw/x8AAAAA/n/v//////8HAAAAAAAAAPwDAgAAAOD////7////fwAAAAAAAACgHyAAAACA//9/f/7///8DAAAAAAAAAPQBAAAAAPj//+cv+P//PwAAAAAAAAAAHjAAAADA/////g/+//8EAAAAAAAAAOBhCAAAAP7//99/4D//AAAAAAAAAAAAPAMEAADA////+Qf84BcAAAAAAAAAAAA/AAAAAPz//58fgAf+QAAAAAAAAAAAAA8AAADg////ewA4gA8EAAAAAAAAAADAAAAAAPz//38BgAP4QQAAAAAAAAAAAAgPAADA////zwAwgAwQAAAAAAAAAAAA9Q8AAPj///8HAAVIAAAAAAAAAAAAAID/AQAA////fwBAAAAQAAAAAAAAAAAA+P8AAGDh//8DAAA0GAAAAAAAAAAAAID/HwAAAPj/HwAAgMIBAAAAAAAAAAAA/P8BAACA//8AAAAYXgAAAAAAAAAAAMD/fwAAAPz/BwAAAOOBAQAAAAAAAAAA/P8/AACA/z8AAABgbtQBAAAAAAAAAOD//w8AAPD/AwAAAAQIeAAAAAAAAAAA/P//AQAA/z8AAACAA4APAQAAAAAAAID//w8AAPD/AwAAAAARsEAAAAAAAAAA+P9/AAAA/j8AAAAAAAAAAAAAAAAAAAD//wcAAPD/QwAAAACAIwAAAAAAAAAA8P9/AAAA/z8EAAAAAD8GIAAAAAAAAAD8/wMAAPD/cQAAAAD4ZwAAAAAAAAAAgP8/AAAA/w8HAAAAgP8HAAAAAAAAAAD4/wMAAOD/MAAAAAD//wEBAAAAAAAAgP8PAAAA/g8DAAAA+P8fAAAAAAAAAAD4PwAAAOB/EAAAAID//wMAAAAAAAAAgP8DAAAA/AMAAAAA+P9/AAAAAAAAAAD8HwAAAMA/AAAAAID//wcAAAAAAAAAwP8BAAAA+AEAAAAA8P9/AAAAAAAAAAD8DwAAAIAPAAAAAAAP/gMAAAAAAAAAwB8AAAAAAAAAAAAAEIAfAAEAAAAAAAD+AwAAAAAAAAAAAAAA8AEgAAAAAAAA4AcAAAAAAAAAAAAAAAAAAAYAAAAAAABeAAAAAAAAAAAAAAAAwAAwAAAAAAAAwAMAAAAAAAAAAAAAAAAIgAEAAAAAAAAeAAAAAAAAAAAAAAAAAAAMAAAAAAAA4AEAAAAAAAAAAAAAAAAAAAAAAAAAAAAPAAAAAAAAAAABAAAAAAAAAAAAAAAAcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMAAAAAAAB4AEDwn/8HAAAAAAAAAAAwAAAAAACA/P/h/////w8AAAAAAAAAwAcAAAD4////z///////PwAAAAAAHALwAACA//////////////8HAADw/y///wMAAP7/////////////HwAA+P///38AAID///////////////8AAPL/////BwAO////////////////DwAA8P////8HEPD//////////////z8AAOD/////////////////////////H/AfwP//////////////////////////////////////////////////////////////////////////////////////';

  /* ---------- geometry ---------- */
  const data = [];                       /* x,y,z, kind, land, seed, speed, size */
  const push = (x, y, z, kind, land, seed, spd, size) => data.push(x, y, z, kind, land, seed, spd, size);
  const rnd = (() => { let s = 7; return () => (s = (s * 16807) % 2147483647) / 2147483647; })();

  const bin = atob(LAND);
  const COLS = 180, ROWS = 90, STEP = 2, stride = small ? 2 : 1;
  const isLand = (r, c) => { const i = r * COLS + c; return (bin.charCodeAt(i >> 3) >> (i & 7)) & 1; };
  for (let r = 0; r < ROWS; r += stride) {
    const lat = (90 - STEP * (r + 0.5)) * Math.PI / 180;
    for (let c = 0; c < COLS; c += stride) {
      if (!isLand(r, c)) continue;
      const lon = (-180 + STEP * (c + 0.5)) * Math.PI / 180;
      push(Math.cos(lat) * Math.sin(lon), Math.sin(lat), Math.cos(lat) * Math.cos(lon), 0, 1, rnd(), 0, 1.0 + rnd() * .5);
    }
  }
  const oceanN = small ? 420 : 900, GA = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < oceanN; i++) {            /* sparse ocean grid so the sphere reads as a sphere */
    const y = 1 - (i + .5) / oceanN * 2, rr = Math.sqrt(1 - y * y), th = GA * i;
    const x = Math.cos(th) * rr, z = Math.sin(th) * rr;
    const lat = Math.asin(y), lon = Math.atan2(x, z);
    const row = Math.min(ROWS - 1, Math.floor((90 - lat * 180 / Math.PI) / STEP));
    const col = Math.min(COLS - 1, Math.floor((lon * 180 / Math.PI + 180) / STEP));
    if (!isLand(row, col)) push(x, y, z, 0, 0, rnd(), 0, .7);
  }
  const ringCfg = [{ r: 1.34, n: small ? 150 : 260, spd: .22 }, { r: 1.62, n: small ? 120 : 220, spd: -.16 }, { r: 1.12, n: small ? 90 : 160, spd: .34 }];
  ringCfg.forEach((cfg, k) => {
    for (let i = 0; i < cfg.n; i++) {
      const th = (i / cfg.n) * Math.PI * 2 + rnd() * .04;
      push(th, cfg.r + (rnd() - .5) * .035, 0, 1 + k, 0, rnd(), cfg.spd, (i % 13 === 0) ? 2.4 : .9 + rnd() * .5);
    }
  });
  const moteN = small ? 50 : 120;
  for (let i = 0; i < moteN; i++) {
    const rr = 1.25 + rnd() * .95, th = rnd() * Math.PI * 2, y = (rnd() - .5) * 1.7;
    push(th, rr, y, 4, 0, rnd(), (.05 + rnd() * .16) * (rnd() < .5 ? -1 : 1), .8 + rnd() * 1.3);
  }
  const COUNT = data.length / 8;

  /* ---------- subject silhouette (portrait image coordinates) ---------- */
  const SIL = '667,85 760,95 830,150 845,250 835,330 880,415 1010,500 1060,580 1068,680 1040,860 1005,1000 995,1210 500,1210 530,1050 440,960 384,925 385,820 400,740 470,610 515,560 590,495 655,460 630,420 590,330 585,260 540,200 560,130';
  let mOrgX = 0, mOrgY = 0, mW = 1, mH = 1;
  const mc = document.createElement('canvas'); mc.width = 328; mc.height = 300;
  const mx = mc.getContext('2d');
  mx.fillStyle = '#000'; mx.fillRect(0, 0, 328, 300);
  mx.shadowColor = '#fff'; mx.shadowBlur = 7; mx.fillStyle = '#fff';
  mx.beginPath();
  SIL.split(' ').forEach((pt, i) => { const q = pt.split(','); const X = q[0] / 4, Y = q[1] / 4; if (i) mx.lineTo(X, Y); else mx.moveTo(X, Y); });
  mx.closePath(); mx.fill(); mx.fill();

  /* ---------- shaders ---------- */
  const VS = `
  attribute vec3 a_p; attribute vec4 a_m; attribute float a_s;
  uniform mat3 u_rot; uniform mat3 u_view; uniform mat3 u_t0; uniform mat3 u_t1; uniform mat3 u_t2;
  uniform float u_time; uniform float u_pulse; uniform vec2 u_res; uniform vec2 u_org; uniform float u_unit; uniform vec2 u_mouse;
  uniform float u_dpr;
  varying vec4 v_c;
  void main(){
    float kind = a_m.x, land = a_m.y, seed = a_m.z, spd = a_m.w;
    vec3 p;
    float fres = 1.0;
    if (kind < .5) {
      p = u_rot * a_p;
      float lat = p.y;
      float w = sin(lat * 7.0 - u_pulse * 16.0) * exp(-u_pulse * 2.4) * .11 * step(u_pulse, 3.2);
      float tw = 1.0 + .012 * sin(u_time * 1.3 + seed * 40.0);
      p *= (1.0 + w) * tw;
    } else if (kind < 4.5) {
      float th = a_p.x + u_time * spd;
      vec3 q = vec3(cos(th) * a_p.y, 0.0, sin(th) * a_p.y);
      q.y += sin(th * 3.0 + seed * 6.28) * .015;
      p = (kind < 1.5) ? u_t0 * q : (kind < 2.5) ? u_t1 * q : (kind < 3.5) ? u_t2 * q : vec3(0.);
      if (kind > 3.5) {
        float tt = a_p.x + u_time * spd;
        p = vec3(cos(tt) * a_p.y, a_p.z + sin(u_time * .6 + seed * 9.0) * .06, sin(tt) * a_p.y);
      }
    } else { p = vec3(0.); }
    p = u_view * p;
    float persp = 3.4 / (3.4 - p.z);
    vec2 sp = vec2(p.x, -p.y) * persp * u_unit;
    /* cursor repulsion (screen space) */
    vec2 sc = sp + u_org;
    vec2 dm = sc - u_mouse; float dd = length(dm);
    float push = smoothstep(120.0, 0.0, dd);
    sp += normalize(dm + .0001) * push * 26.0;
    vec2 ndc = (sp + u_org) / (u_res * .5) - vec2(1.0, 1.0);
    gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
    /* shading */
    float depth = clamp((p.z + 1.7) / 3.4, 0.0, 1.0);
    float a;
    if (kind < .5) {
      float limb = pow(1.0 - clamp(abs(p.z) / 1.0, 0.0, 1.0), 2.1);
      a = (land > .5 ? .06 + .95 * limb : .03 + .55 * limb);
      a *= (p.z < 0.0 ? .55 : 1.0);
    } else if (kind < 4.5) {
      a = .35 + .65 * depth;
      if (a_s > 2.0) a = 1.0;
    } else a = 0.;
    a += push * .6;
    vec3 col = land > .5 ? vec3(.82, .76, 1.0) : vec3(.50, .45, .90);
    if (kind > .5) col = mix(vec3(.46, .74, .96), vec3(.78, .70, 1.0), depth);
    if (kind > 3.5) col = vec3(.93, .90, 1.0);
    v_c = vec4(col, clamp(a, 0.0, 1.0));
    gl_PointSize = (a_s * (kind < .5 ? 1.55 : 1.9) * persp + push * 2.2) * u_dpr;
  }`;
  const FS = `
  precision mediump float; varying vec4 v_c;
  uniform sampler2D u_mask; uniform vec4 u_mrect; uniform float u_dpr2; uniform float u_H;
  void main(){
    vec2 css = vec2(gl_FragCoord.x, u_H * u_dpr2 - gl_FragCoord.y) / u_dpr2;
    vec2 uv = (css - u_mrect.xy) / u_mrect.zw;
    float inside = texture2D(u_mask, uv).r;
    float d = length(gl_PointCoord - .5) * 2.0;
    float core = smoothstep(1.0, 0.15, d);
    float a = core * core * v_c.a * (1.0 - inside);
    gl_FragColor = vec4(v_c.rgb * a, a);
  }`;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s)); return s; };
  let prog;
  try {
    prog = gl.createProgram();
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
  } catch (e) { console.warn('[orbgl]', e); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  const B = 8 * 4;
  const loc = n => gl.getAttribLocation(prog, n);
  gl.enableVertexAttribArray(loc('a_p')); gl.vertexAttribPointer(loc('a_p'), 3, gl.FLOAT, false, B, 0);
  gl.enableVertexAttribArray(loc('a_m')); gl.vertexAttribPointer(loc('a_m'), 4, gl.FLOAT, false, B, 12);
  gl.enableVertexAttribArray(loc('a_s')); gl.vertexAttribPointer(loc('a_s'), 1, gl.FLOAT, false, B, 28);
  const U = {}; ['u_rot', 'u_view', 'u_t0', 'u_t1', 'u_t2', 'u_time', 'u_pulse', 'u_res', 'u_org', 'u_unit', 'u_mouse', 'u_dpr'].forEach(n => U[n] = gl.getUniformLocation(prog, n));
  const tex = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mc);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.uniform1i(gl.getUniformLocation(prog, 'u_mask'), 0);
  const UM = gl.getUniformLocation(prog, 'u_mrect'), UD2 = gl.getUniformLocation(prog, 'u_dpr2'), UH = gl.getUniformLocation(prog, 'u_H');
  gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); /* premultiplied */
  gl.clearColor(0, 0, 0, 0);

  /* ---------- matrices (column-major mat3) ---------- */
  const rx = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, c, s, 0, -s, c]; };
  const ry = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c]; };
  const rz = a => { const c = Math.cos(a), s = Math.sin(a); return [c, s, 0, -s, c, 0, 0, 0, 1]; };
  const mul = (A, B) => { const o = new Array(9); for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = A[r] * B[c * 3] + A[3 + r] * B[c * 3 + 1] + A[6 + r] * B[c * 3 + 2]; return o; };
  const T0 = mul(rx(1.18), rz(.28)), T1 = mul(rx(.62), rz(-.52)), T2 = mul(rx(1.52), rz(.95));
  const D2R = Math.PI / 180;

  /* ---------- layout ---------- */
  let W = 1, H = 1, dpr = 1, orgX = 0, orgY = 0, unit = 150;
  const mouse = { x: -9999, y: -9999 };
  const fit = () => {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const sr = scene.getBoundingClientRect();
    const padX = sr.width * .03, padY = sr.height * .16;
    W = Math.round(sr.width + padX * 2); H = Math.round(sr.height + padY * 2);
    canvas.style.left = (-padX) + 'px'; canvas.style.top = (-padY) + 'px';
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    /* lock onto the globe that is baked into the portrait (same cover maths as plus.js) */
    const IW = 1312, IH = 1199, GC = [465, 501], GR = 327;
    const w = scene.offsetWidth, h = scene.offsetHeight, sc = Math.max(w / IW, h / IH);
    const ox = (w - IW * sc) * .56, oy = (h - IH * sc) * .42;
    orgX = padX + ox + GC[0] * sc; orgY = padY + oy + GC[1] * sc;
    unit = GR * sc * .97;
    mOrgX = padX + ox; mOrgY = padY + oy; mW = IW * sc; mH = IH * sc;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  scene.insertBefore(canvas, scene.querySelector('.orb-note') || null);
  document.documentElement.classList.add('u-gl-on');
  fit();
  new ResizeObserver(fit).observe(scene);

  /* ---------- interaction ---------- */
  let pulse = 99;
  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left); mouse.y = (e.clientY - r.top);
  }, { passive: true });
  scene.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  scene.addEventListener('pointerdown', () => { pulse = 0; });

  /* ---------- loop ---------- */
  let vis = true, last = performance.now(), t = 0, vx = 0, vy = 0;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => { vis = es[0].isIntersecting; }, { threshold: 0 }).observe(scene);
  document.addEventListener('visibilitychange', () => { last = performance.now(); });

  const draw = (now) => {
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!reduce) t += dt;
    if (pulse < 99) pulse += dt;
    const ms = window.__motion && window.__motion.orbState;
    const yaw = (ms ? ms.yaw : t * 5.5) * D2R, pitch = (ms ? ms.pitch : 0) * D2R;
    const mo = window.__motion && window.__motion.mouse;
    const tvx = mo && mo.active ? mo.nx : 0, tvy = mo && mo.active ? mo.ny : 0;
    vx += (tvx - vx) * Math.min(1, dt * 2.2); vy += (tvy - vy) * Math.min(1, dt * 2.2);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniformMatrix3fv(U.u_rot, false, mul(rx(pitch + .26), ry(yaw)));
    gl.uniformMatrix3fv(U.u_view, false, mul(rx(-vy * .09), ry(vx * .13)));
    gl.uniformMatrix3fv(U.u_t0, false, T0); gl.uniformMatrix3fv(U.u_t1, false, T1); gl.uniformMatrix3fv(U.u_t2, false, T2);
    gl.uniform1f(U.u_time, t); gl.uniform1f(U.u_pulse, pulse);
    gl.uniform2f(U.u_res, W, H); gl.uniform2f(U.u_org, orgX, orgY - H / 2 * 0); gl.uniform1f(U.u_unit, unit);
    gl.uniform4f(UM, mOrgX, mOrgY, mW, mH); gl.uniform1f(UD2, dpr); gl.uniform1f(UH, H);
    gl.uniform2f(U.u_mouse, mouse.x, mouse.y); gl.uniform1f(U.u_dpr, dpr);
    gl.drawArrays(gl.POINTS, 0, COUNT);
  };
  const loop = (now) => { requestAnimationFrame(loop); if (vis && !document.hidden) draw(now); };
  draw(performance.now());
  if (!reduce) requestAnimationFrame(loop);
})();
