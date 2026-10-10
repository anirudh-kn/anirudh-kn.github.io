/* ==========================================================================
   ultra.js — round 4 (additive): intro preloader, inertial smooth scroll,
   text-decode on labels, masked line-by-line heading reveals.
   No libraries, works from file://. Reduced-motion visitors get the plain site.
   ========================================================================== */
(() => {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const root = document.documentElement;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const hasIO = 'IntersectionObserver' in window;
  const safe = (name, fn) => { try { fn(); } catch (e) { console.warn('[ultra:' + name + ']', e); } };

  /* ---- ready gate: things that should wait for the intro to finish ---- */
  let ready = false; const waiting = [];
  const onReady = fn => (ready ? fn() : waiting.push(fn));
  const release = () => {
    if (ready) return; ready = true;
    root.classList.remove('u-lock', 'u-hold'); root.classList.add('u-ready');
    waiting.splice(0).forEach(f => safe('ready', f));
  };

  /* ====================================================================
   * 1. INTRO PRELOADER (first visit per tab; skipped for deep links)
   * ==================================================================== */
  safe('intro', () => {
    let seen = false; try { seen = sessionStorage.getItem('u-intro') === '1'; } catch (e) { /* ignore */ }
    if (seen || location.hash) { release(); return; }
    try { sessionStorage.setItem('u-intro', '1'); } catch (e) { /* ignore */ }
    root.classList.add('u-lock', 'u-hold');
    const o = document.createElement('div');
    o.className = 'u-intro'; o.setAttribute('aria-hidden', 'true');
    o.innerHTML = '<i class="u-top"></i><i class="u-bot"></i><div class="u-mid"><div class="u-word">anirudh<span>.</span></div>' +
      '<div class="u-count"><b>000</b><span>/ 100 · LOADING DATA CORE</span></div><div class="u-bar"><i></i></div></div>';
    document.body.appendChild(o);
    const num = o.querySelector('b'), bar = o.querySelector('.u-bar i');
    const DUR = 1250; let t0 = 0, done = false;
    const finish = () => {
      if (done) return; done = true;
      const mid = o.querySelector('.u-mid'), top = o.querySelector('.u-top'), bot = o.querySelector('.u-bot');
      const ease = 'cubic-bezier(.76,0,.24,1)';
      mid.animate([{ opacity: 1, translate: '0 0' }, { opacity: 0, translate: '0 -14px' }], { duration: 320, easing: 'ease-in', fill: 'forwards' });
      top.animate([{ translate: '0 0' }, { translate: '0 -101%' }], { duration: 820, delay: 220, easing: ease, fill: 'forwards' });
      const last = bot.animate([{ translate: '0 0' }, { translate: '0 101%' }], { duration: 820, delay: 220, easing: ease, fill: 'forwards' });
      setTimeout(release, 520);                       /* hero choreography starts as the panels part */
      last.onfinish = () => o.remove();
      setTimeout(() => o.remove(), 2200);
    };
    const step = now => {
      if (!t0) t0 = now;
      const p = clamp((now - t0) / DUR, 0, 1), e = 1 - Math.pow(1 - p, 2.4);
      num.textContent = String(Math.round(e * 100)).padStart(3, '0');
      bar.style.transform = 'scaleX(' + e.toFixed(3) + ')';
      if (p < 1 && !done) requestAnimationFrame(step); else finish();
    };
    requestAnimationFrame(step);
    ['pointerdown', 'keydown'].forEach(ev => window.addEventListener(ev, finish, { once: true, passive: true }));
    setTimeout(() => { finish(); release(); }, 4000);   /* failsafe */
  });

  /* ====================================================================
   * 2. INERTIAL SMOOTH SCROLL (mouse wheel only; native everywhere else)
   * ==================================================================== */
  safe('smooth', () => {
    if (!fine) return;
    let target = window.scrollY, cur = target, raf = 0, last = 0;
    const maxY = () => Math.max(0, root.scrollHeight - window.innerHeight);
    const scrollable = n => {
      for (; n && n !== document.body && n !== root; n = n.parentNode) {
        if (n.nodeType !== 1) continue;
        const cs = getComputedStyle(n);
        if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 1) return true;
      }
      return false;
    };
    const tick = now => {
      const dt = Math.min(.05, (now - last) / 1000 || .016); last = now;
      cur += (target - cur) * (1 - Math.exp(-dt * 8.5));
      if (Math.abs(target - cur) < .4) { cur = target; raf = 0; } else raf = requestAnimationFrame(tick);
      window.scrollTo({ top: cur, behavior: 'instant' });
    };
    window.addEventListener('wheel', e => {
      if (e.ctrlKey || e.shiftKey || e.defaultPrevented || root.classList.contains('u-lock')) return;
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (scrollable(e.target)) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 34 : e.deltaMode === 2 ? e.deltaY * window.innerHeight : e.deltaY;
      e.preventDefault();
      if (!raf) { cur = window.scrollY; target = cur; last = performance.now(); }
      target = clamp(target + dy, 0, maxY());
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: false });
    /* anything else that moves the page (anchors, keys, scrollbar, curtain) wins */
    window.addEventListener('scroll', () => {
      if (Math.abs(window.scrollY - cur) > 3) { cur = target = window.scrollY; }
    }, { passive: true });
    window.addEventListener('resize', () => { target = clamp(target, 0, maxY()); });
  });

  /* ====================================================================
   * 3. TEXT DECODE on small labels (the exact original text always lands)
   * ==================================================================== */
  safe('decode', () => {
    if (!hasIO) return;
    const GL = '01<>/\\_+*#=—·:;';
    const run = (node, delay) => {
      const txt = node.nodeValue; if (!txt.trim()) return;
      const n = txt.length, dur = 520 + n * 14, start = performance.now() + delay;
      const at = [...txt].map((_, i) => (i / n) * dur * .78 + Math.random() * dur * .22);
      const frame = now => {
        const t = now - start;
        if (t < 0) { requestAnimationFrame(frame); return; }
        let out = '', pending = false;
        for (let i = 0; i < n; i++) {
          const ch = txt[i];
          if (ch === ' ' || t >= at[i]) out += ch; else { out += GL[(Math.random() * GL.length) | 0]; pending = true; }
        }
        node.nodeValue = out;
        if (pending) requestAnimationFrame(frame); else node.nodeValue = txt;
      };
      node.nodeValue = txt.replace(/[^ ]/g, '·');
      requestAnimationFrame(frame);
    };
    const els = $$('.eyebrow, .section-label span, .art-label');
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const nodes = [...e.target.childNodes].filter(c => c.nodeType === 3 && c.nodeValue.trim());
        nodes.forEach(nd => run(nd, 160));
      });
    }, { threshold: .6 });
    onReady(() => setTimeout(() => els.forEach(x => io.observe(x)), 250));
  });

  /* ====================================================================
   * 4. MASKED LINE-BY-LINE HEADING REVEAL
   * ==================================================================== */
  safe('lines', () => {
    const heads = $$('main h2').filter(h => !h.closest('.fx-journey'));
    heads.forEach(h => {
      const parts = h.innerHTML.split(/<br\s*\/?>/i);
      h.innerHTML = parts.map((p, i) => '<span class="u-line" style="--i:' + i + '"><span class="u-line-in">' + p + '</span></span>').join('');
      h.classList.add('u-split');
    });
    const show = h => h.classList.add('u-in');
    if (!hasIO) { heads.forEach(show); return; }
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { io.unobserve(e.target); show(e.target); } });
    }, { threshold: .2, rootMargin: '0px 0px -6% 0px' });
    onReady(() => heads.forEach(h => io.observe(h)));
    setTimeout(() => heads.forEach(show), 6500);                       /* failsafe */
    window.addEventListener('beforeprint', () => heads.forEach(show));
  });
})();
