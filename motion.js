/* ==========================================================================
   motion.js — additive interaction + 3D motion layer
   Companion to script.js (which is left untouched). If anything here fails,
   the site simply behaves exactly as before. Disabled for reduced-motion.
   ========================================================================== */
(() => {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const hasIO = 'IntersectionObserver' in window;

  document.documentElement.classList.add('m-on');

  /* shared state read by the frame loop */
  const mouse = { x: -9999, y: -9999, nx: 0, ny: 0, active: false };
  let scrollY = window.scrollY;
  let scrollVel = 0;

  /* ------------------------------------------------------------------ *
   * 1. Scroll progress bar + cursor glow
   * ------------------------------------------------------------------ */
  const bar = document.createElement('div');
  bar.className = 'm-progress';
  bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);

  let glow = null;
  const glowPos = { x: -9999, y: -9999 };
  if (fine) {
    glow = document.createElement('div');
    glow.className = 'm-cursor';
    glow.setAttribute('aria-hidden', 'true');
    document.body.appendChild(glow);
  }

  window.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    mouse.x = event.clientX;
    mouse.y = event.clientY;
    mouse.nx = (event.clientX / window.innerWidth - 0.5) * 2;
    mouse.ny = (event.clientY / window.innerHeight - 0.5) * 2;
    if (!mouse.active) {
      mouse.active = true;
      glowPos.x = mouse.x;
      glowPos.y = mouse.y;
      if (glow) glow.classList.add('on');
    }
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => {
    mouse.active = false;
    mouse.x = mouse.y = -9999;
    if (glow) glow.classList.remove('on');
  });

  /* ------------------------------------------------------------------ *
   * 2. Particle constellation (fixed canvas behind the page)
   * ------------------------------------------------------------------ */
  const field = (() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;
    canvas.className = 'm-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);

    const colours = ['178,161,244', '162,201,219', '199,184,255'];
    let w = 0, h = 0, dpr = 1, particles = [];

    function build() {
      const target = clamp(Math.round((w * h) / (fine ? 21000 : 30000)), 22, fine ? 72 : 34);
      if (particles.length === target) return;
      particles = Array.from({ length: target }, () => ({
        x: rand(0, w), y: rand(0, h),
        vx: rand(-9, 9), vy: rand(-7, 7),
        ox: 0, oy: 0,
        r: rand(0.8, 1.9),
        d: rand(0.03, 0.14),
        c: colours[(Math.random() * colours.length) | 0],
        px: 0, py: 0
      }));
    }

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    }, { passive: true });
    resize();

    function burst(x, y) {
      particles.forEach(p => {
        const dx = p.px - x, dy = p.py - y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < 280) {
          const push = (1 - dist / 280) * 110;
          p.ox += (dx / dist) * push;
          p.oy += (dy / dist) * push;
        }
      });
    }

    function step(dt) {
      ctx.clearRect(0, 0, w, h);
      const decay = Math.exp(-2.4 * dt);
      const linkDist = fine ? 125 : 95;

      for (const p of particles) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;

        let yy = (p.y - scrollY * p.d) % h;
        if (yy < 0) yy += h;
        p.px = p.x + p.ox;
        p.py = yy + p.oy;

        if (mouse.active) {
          const dx = p.px - mouse.x, dy = p.py - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 150 && dist > 0.5) {
            const force = (1 - dist / 150) * 60 * dt * 6;
            p.ox += (dx / dist) * force;
            p.oy += (dy / dist) * force;
          }
        }
        p.ox *= decay;
        p.oy *= decay;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.px - b.px, dy = a.py - b.py;
          const dist2 = dx * dx + dy * dy;
          if (dist2 < linkDist * linkDist) {
            const alpha = (1 - Math.sqrt(dist2) / linkDist) * 0.2;
            ctx.strokeStyle = `rgba(178,161,244,${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(b.px, b.py);
            ctx.stroke();
          }
        }
        if (mouse.active) {
          const dx = a.px - mouse.x, dy = a.py - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160) {
            ctx.strokeStyle = `rgba(162,201,219,${((1 - dist / 160) * 0.32).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(a.px, a.py);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      for (const p of particles) {
        ctx.fillStyle = `rgba(${p.c},0.55)`;
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, 6.2832);
        ctx.fill();
      }
    }
    return { step, burst };
  })();

  /* ------------------------------------------------------------------ *
   * 3. Hero: draggable 3D orb, click shock-wave, depth parallax
   * ------------------------------------------------------------------ */
  const hero = $('.hero');
  const heroArt = $('.hero-art');
  const orb = $('#data-orb');
  const scene = $('.orb-scene');
  const heroCopy = $('.hero-copy');
  let heroVisible = true;

  const orbState = { yaw: 0, pitch: 0, vel: 170, dragging: false };
  const sensor = { x: 0, y: 0, on: false }; /* phone tilt, fed by plus.js */
  window.__motion = { orbState, sensor, mouse };
  const AUTO_SPEED = 360 / 65; /* matches the original 65s rotation */

  if (heroArt && orb && scene) {
    orb.style.animation = 'none'; /* JS now owns the rotation (same speed) */

    let lastX = 0, lastY = 0, lastT = 0, startX = 0, startY = 0, startT = 0, moved = 0;
    let pulseTimer = 0;

    function pulse() {
      orb.classList.add('m-pulse');
      clearTimeout(pulseTimer);
      pulseTimer = setTimeout(() => orb.classList.remove('m-pulse'), 900);
    }

    function shock(clientX, clientY) {
      const box = scene.getBoundingClientRect();
      const ring = document.createElement('span');
      ring.className = 'm-shock';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = `${clientX - box.left}px`;
      ring.style.top = `${clientY - box.top}px`;
      scene.appendChild(ring);
      const size = Math.min(1, box.width / 520);
      ring.style.width = ring.style.height = `${380 * size}px`;
      ring.animate(
        [
          { transform: 'translate(-50%,-50%) scale(.08)', opacity: 0.95 },
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
        ],
        { duration: 1300, easing: 'cubic-bezier(.16,1,.3,1)' }
      ).onfinish = () => ring.remove();
      orbState.vel += (clientX < box.left + box.width / 2 ? -1 : 1) * 320;
      pulse();
    }

    heroArt.addEventListener('pointerdown', event => {
      if (event.button !== 0) return;
      orbState.dragging = true;
      moved = 0;
      lastX = startX = event.clientX;
      lastY = startY = event.clientY;
      lastT = startT = performance.now();
      heroArt.classList.add('is-dragging');
      try { heroArt.setPointerCapture(event.pointerId); } catch (e) { /* ignore */ }
    });

    heroArt.addEventListener('pointermove', event => {
      if (!orbState.dragging) return;
      const now = performance.now();
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;
      const dt = Math.max(1, now - lastT) / 1000;
      moved += Math.abs(dx) + Math.abs(dy);
      orbState.yaw += dx * 0.45;
      orbState.pitch = clamp(orbState.pitch - dy * 0.3, -42, 42);
      orbState.vel = clamp(lerp(orbState.vel, (dx * 0.45) / dt, 0.45), -1100, 1100);
      lastX = event.clientX;
      lastY = event.clientY;
      lastT = now;
      if (moved > 6) pulse();
    });

    const endDrag = event => {
      if (!orbState.dragging) return;
      orbState.dragging = false;
      heroArt.classList.remove('is-dragging');
      try { heroArt.releasePointerCapture(event.pointerId); } catch (e) { /* ignore */ }
      if (moved < 6 && performance.now() - startT < 400) shock(startX, startY);
    };
    heroArt.addEventListener('pointerup', endDrag);
    heroArt.addEventListener('pointercancel', endDrag);

    if (hasIO) {
      new IntersectionObserver(entries => {
        heroVisible = entries[0].isIntersecting;
        if (hero) hero.classList.toggle('m-paused', !heroVisible);
      }).observe(hero || heroArt);
    }
  }

  /* depth layers: shift at different rates with the pointer */
  const layers = [
    ['.hero-portrait', -6],
    ['.orb-halo', 16],
    ['.orbit-one', 10],
    ['.orbit-two', -11],
    ['.scene-point', 20],
    ['.scene-cross', 28],
    ['.orb-note', 9]
  ].flatMap(([selector, depth]) => $$(selector).map(el => ({ el, depth })));
  const parallax = { x: 0, y: 0 };

  function heroStep(dt) {
    if (!heroVisible) return;
    if (orb) {
      if (!orbState.dragging) {
        orbState.yaw += orbState.vel * dt;
        orbState.vel = lerp(orbState.vel, AUTO_SPEED + scrollVel * 0.02, Math.min(1, dt * 1.1));
        orbState.pitch = lerp(orbState.pitch, sensor.on ? sensor.y * 14 : 0, Math.min(1, dt * 1.4));
      }
      orb.style.transform = `rotateX(${orbState.pitch.toFixed(2)}deg) rotateY(${orbState.yaw.toFixed(2)}deg)`;
    }
    if (fine || sensor.on) {
      const tx = sensor.on ? sensor.x : (mouse.active ? mouse.nx : 0);
      const ty = sensor.on ? sensor.y : (mouse.active ? mouse.ny : 0);
      parallax.x = lerp(parallax.x, tx, Math.min(1, dt * 4));
      parallax.y = lerp(parallax.y, ty, Math.min(1, dt * 4));
      layers.forEach(({ el, depth }) => {
        el.style.translate = `${(parallax.x * depth).toFixed(2)}px ${(parallax.y * depth).toFixed(2)}px`;
      });
    }
    if (scrollY < 1100) {
      if (heroArt) heroArt.style.translate = `0 ${(scrollY * 0.07).toFixed(1)}px`;
      if (heroCopy) heroCopy.style.translate = `0 ${(scrollY * -0.035).toFixed(1)}px`;
    }
  }

  /* ------------------------------------------------------------------ *
   * 4. Tilt + spotlight (mouse only)
   * ------------------------------------------------------------------ */
  if (fine) {
    const tiltTargets = [
      ['.featured-project', 3.2],
      ['.impact-grid > div', 8]
    ];
    tiltTargets.forEach(([selector, max]) => {
      $$(selector).forEach(el => {
        el.classList.add('m-tilt');
        let off = 0;
        el.addEventListener('pointerenter', event => {
          if (event.pointerType !== 'mouse') return;
          clearTimeout(off);
          el.classList.add('m-tilting');
        });
        el.addEventListener('pointermove', event => {
          if (event.pointerType !== 'mouse') return;
          const r = el.getBoundingClientRect();
          const x = (event.clientX - r.left) / r.width;
          const y = (event.clientY - r.top) / r.height;
          el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
          el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
          el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
          el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        });
        el.addEventListener('pointerleave', () => {
          el.style.setProperty('--rx', '0deg');
          el.style.setProperty('--ry', '0deg');
          off = setTimeout(() => el.classList.remove('m-tilting'), 450);
        });
      });
    });

    $$('.project-row, .credential-list li, .impact-grid > div, .skill-row').forEach(el => {
      el.classList.add('m-spot');
      el.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        el.style.setProperty('--mx', `${event.clientX - r.left}px`);
        el.style.setProperty('--my', `${event.clientY - r.top}px`);
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * 5. Magnetic buttons / links
   * ------------------------------------------------------------------ */
  if (fine) {
    $$('.button, .nav-cta, .contact-email, .project-link').forEach(el => {
      el.classList.add('m-mag');
      el.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const r = el.getBoundingClientRect();
        const dx = event.clientX - (r.left + r.width / 2);
        const dy = event.clientY - (r.top + r.height / 2);
        el.style.translate = `${clamp(dx * 0.22, -10, 10).toFixed(1)}px ${clamp(dy * 0.32, -7, 7).toFixed(1)}px`;
      });
      el.addEventListener('pointerleave', () => { el.style.translate = ''; });
    });
  }

  /* ------------------------------------------------------------------ *
   * 6. Seismic card: pointer parallax + ripples
   * ------------------------------------------------------------------ */
  const seismic = $('.seismic-art');
  if (seismic) {
    function ripple(clientX, clientY) {
      const r = seismic.getBoundingClientRect();
      const ring = document.createElement('span');
      ring.className = 'm-ripple';
      ring.setAttribute('aria-hidden', 'true');
      ring.style.left = `${clientX - r.left}px`;
      ring.style.top = `${clientY - r.top}px`;
      const size = Math.max(r.width, r.height) * 0.9;
      ring.style.width = ring.style.height = `${size}px`;
      seismic.appendChild(ring);
      ring.animate(
        [
          { transform: 'translate(-50%,-50%) scale(.02)', opacity: 0.8 },
          { transform: 'translate(-50%,-50%) scale(1)', opacity: 0 }
        ],
        { duration: 1700, easing: 'cubic-bezier(.12,.8,.3,1)' }
      ).onfinish = () => ring.remove();
    }
    seismic.addEventListener('pointerenter', event => ripple(event.clientX, event.clientY));
    seismic.addEventListener('pointerdown', event => ripple(event.clientX, event.clientY));
    if (fine) {
      seismic.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const r = seismic.getBoundingClientRect();
        seismic.style.setProperty('--px', ((event.clientX - r.left) / r.width - 0.5) * 2);
        seismic.style.setProperty('--py', ((event.clientY - r.top) / r.height - 0.5) * 2);
      });
      seismic.addEventListener('pointerleave', () => {
        seismic.style.setProperty('--px', 0);
        seismic.style.setProperty('--py', 0);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * 7. Creative studio: depth tilt
   * ------------------------------------------------------------------ */
  const studio = $('.creative-studio');
  if (studio && fine) {
    studio.addEventListener('pointermove', event => {
      if (event.pointerType !== 'mouse') return;
      const r = studio.getBoundingClientRect();
      studio.style.setProperty('--sx', ((event.clientX - r.left) / r.width - 0.5) * 2);
      studio.style.setProperty('--sy', ((event.clientY - r.top) / r.height - 0.5) * 2);
    });
    studio.addEventListener('pointerleave', () => {
      studio.style.setProperty('--sx', 0);
      studio.style.setProperty('--sy', 0);
    });
  }

  /* ------------------------------------------------------------------ *
   * 8. Staggered reveal for cards / rows / pills
   * ------------------------------------------------------------------ */
  const staggerSelector = [
    '.timeline-item', '.project-row', '.impact-grid > div', '.credential-list li',
    '.skill-row', '.about-facts > div', '.featured-project'
  ].join(',');
  const staggerEls = $$(staggerSelector);

  function rise(el, delay) {
    el.classList.remove('m-pre', 'm-in');
    void el.offsetWidth; /* restart animation */
    el.style.setProperty('--d', `${delay}ms`);
    el.classList.add('m-in');
    el.addEventListener('animationend', function done(event) {
      if (event.target !== el || event.animationName !== 'm-rise') return;
      el.classList.remove('m-in');
      el.style.removeProperty('--d');
      el.removeEventListener('animationend', done);
    });
  }

  if (hasIO) {
    const revealIO = new IntersectionObserver(entries => {
      entries.filter(e => e.isIntersecting).forEach((entry, i) => {
        revealIO.unobserve(entry.target);
        rise(entry.target, Math.min(i, 6) * 90);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

    staggerEls.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.95) {
        el.classList.add('m-pre');
        revealIO.observe(el);
      }
    });
    window.addEventListener('beforeprint', () => staggerEls.forEach(el => el.classList.remove('m-pre')));
  }

  /* skill filter: re-animate the rows that remain */
  $$('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      requestAnimationFrame(() => {
        let i = 0;
        $$('.skill-row').forEach(row => {
          row.classList.remove('m-pre');
          if (!row.hidden) rise(row, i++ * 70);
        });
        $$('.skill-row:not([hidden]) .pills li').forEach((pill, n) => {
          pill.animate(
            [{ opacity: 0, transform: 'translateY(10px) scale(.94)' }, { opacity: 1, transform: 'none' }],
            { duration: 450, delay: n * 22, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
          );
        });
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * 9. Number count-up (final text is restored exactly)
   * ------------------------------------------------------------------ */
  if (hasIO) {
    const counters = [];
    $$('.impact-grid dd, .project-stat strong, .about-facts strong, .education-score strong').forEach(host => {
      const node = [...host.childNodes].find(n => n.nodeType === 3 && /\d/.test(n.nodeValue));
      if (!node) return;
      const m = node.nodeValue.match(/^(\D*)(\d+(?:\.\d+)?)([\s\S]*)$/);
      if (!m) return;
      counters.push({
        host, node, original: node.nodeValue,
        pre: m[1], suf: m[3], digits: m[2],
        value: parseFloat(m[2]),
        decimals: (m[2].split('.')[1] || '').length,
        padded: /^0\d/.test(m[2])
      });
    });

    function count(item) {
      const start = performance.now();
      const duration = 1500;
      (function tick(now) {
        const t = clamp((now - start) / duration, 0, 1);
        const eased = 1 - Math.pow(1 - t, 4);
        let text = (item.value * eased).toFixed(item.decimals);
        if (item.padded) text = text.padStart(item.digits.length, '0');
        item.node.nodeValue = t < 1 ? item.pre + text + item.suf : item.original;
        if (t < 1) requestAnimationFrame(tick);
      })(start);
    }

    const countIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        countIO.unobserve(entry.target);
        const item = counters.find(c => c.host === entry.target);
        if (item) count(item);
      });
    }, { threshold: 0.6 });
    counters.forEach(c => countIO.observe(c.host));
  }

  /* ------------------------------------------------------------------ *
   * 10. Click / tap spark burst
   * ------------------------------------------------------------------ */
  let lastSpark = 0;
  window.addEventListener('pointerdown', event => {
    if (event.button > 0) return;
    if (field) field.burst(event.clientX, event.clientY);
    const now = performance.now();
    if (now - lastSpark < 120) return;
    lastSpark = now;
    for (let i = 0; i < 9; i++) {
      const spark = document.createElement('span');
      spark.className = 'm-spark';
      spark.setAttribute('aria-hidden', 'true');
      document.body.appendChild(spark);
      const angle = (i / 9) * Math.PI * 2 + rand(-0.3, 0.3);
      const dist = rand(26, 66);
      spark.animate(
        [
          { transform: `translate(${event.clientX}px,${event.clientY}px) scale(1)`, opacity: 1 },
          { transform: `translate(${event.clientX + Math.cos(angle) * dist}px,${event.clientY + Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
        ],
        { duration: rand(450, 750), easing: 'cubic-bezier(.12,.8,.3,1)' }
      ).onfinish = () => spark.remove();
    }
  }, { passive: true });

  /* ------------------------------------------------------------------ *
   * 11. Frame loop (paused when the tab is hidden)
   * ------------------------------------------------------------------ */
  let last = performance.now();
  let prevScroll = scrollY;
  let raf = 0;

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;

    scrollY = window.scrollY;
    scrollVel = lerp(scrollVel, (scrollY - prevScroll) / Math.max(dt, 0.001), 0.2);
    prevScroll = scrollY;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? clamp(scrollY / max, 0, 1).toFixed(4) : 0})`;

    if (glow && mouse.active) {
      glowPos.x = lerp(glowPos.x, mouse.x, Math.min(1, dt * 9));
      glowPos.y = lerp(glowPos.y, mouse.y, Math.min(1, dt * 9));
      glow.style.transform = `translate3d(${glowPos.x.toFixed(1)}px,${glowPos.y.toFixed(1)}px,0)`;
    }

    heroStep(dt);
    if (field) field.step(dt);

    if (reduce.matches) { stop(); return; }
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  document.addEventListener('visibilitychange', () => {
    document.documentElement.classList.toggle('m-hidden', document.hidden);
    if (document.hidden) stop(); else start();
  });
  reduce.addEventListener('change', () => {
    if (reduce.matches) {
      stop();
      document.documentElement.classList.remove('m-on');
      $$('.m-pre').forEach(el => el.classList.remove('m-pre'));
    } else {
      location.reload();
    }
  });

  start();
})();
