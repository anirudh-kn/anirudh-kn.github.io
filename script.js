(() => {
  'use strict';

  document.documentElement.classList.add('js');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mobileLayout = window.matchMedia('(max-width: 800px)');
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('.main-navigation');
  const navigationLinks = [...navigation.querySelectorAll('a')];

  function closeMenu(returnFocus = false) {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
    if (returnFocus) menuButton.focus();
  }

  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
    navigation.classList.toggle('is-open', !isOpen);
  });

  navigationLinks.forEach(link => link.addEventListener('click', () => closeMenu()));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeMenu();
  });
  document.querySelector('.site-header').addEventListener('focusout', event => {
    if (!event.currentTarget.contains(event.relatedTarget)) closeMenu();
  });
  mobileLayout.addEventListener('change', () => closeMenu());

  const filters = [...document.querySelectorAll('[data-filter]')];
  const skillRows = [...document.querySelectorAll('[data-category]')];
  filters.forEach(button => {
    button.addEventListener('click', () => {
      filters.forEach(filter => {
        const selected = filter === button;
        filter.classList.toggle('selected', selected);
        filter.setAttribute('aria-pressed', String(selected));
      });
      skillRows.forEach(row => {
        row.hidden = button.dataset.filter !== 'all' && row.dataset.category !== button.dataset.filter;
      });
    });
  });

  const sectionsToReveal = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.remove('is-pending');
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.04, rootMargin: '0px 0px -24px 0px' });

    sectionsToReveal.forEach(section => {
      if (!reducedMotion.matches && section.getBoundingClientRect().top > window.innerHeight) {
        section.classList.add('is-pending');
      }
      revealObserver.observe(section);
    });

    const navSections = [...document.querySelectorAll('main > section[id]')];
    const sectionToNav = { impact: 'projects', learning: 'projects', education: 'creative' };
    const visibleSections = new Set();
    const navigationObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) visibleSections.add(entry.target);
        else visibleSections.delete(entry.target);
      });
      const current = [...visibleSections].sort((a, b) =>
        Math.abs(a.getBoundingClientRect().top - 110) - Math.abs(b.getBoundingClientRect().top - 110)
      )[0];
      if (!current) return;
      const id = sectionToNav[current.id] || current.id;
      navigationLinks.forEach(link => {
        const active = link.getAttribute('href') === `#${id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
    navSections.forEach(section => navigationObserver.observe(section));
  }

  const orb = document.getElementById('data-orb');
  const fragment = document.createDocumentFragment();
  for (let index = 0; index < 20; index++) {
    const ring = document.createElement('span');
    ring.className = 'orb-ring';
    ring.style.transform = `rotateY(${index * 9}deg)`;
    fragment.appendChild(ring);
  }
  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const radians = latitude * Math.PI / 180;
    const ring = document.createElement('span');
    const diameter = Math.cos(radians) * 100;
    ring.className = 'orb-latitude';
    ring.style.width = `${diameter}%`;
    ring.style.height = `${diameter}%`;
    ring.style.top = `${50 + Math.sin(radians) * 50}%`;
    ring.style.transform = 'translate(-50%, -50%) rotateX(90deg)';
    fragment.appendChild(ring);
  }
  const orbNodes = [];
  for (let index = 0; index < 30; index++) {
    const node = document.createElement('span');
    node.className = 'orb-node';
    const y = 1 - (index / 29) * 2;
    const radiusAtY = Math.sqrt(1 - y * y);
    const angle = index * Math.PI * (3 - Math.sqrt(5));
    orbNodes.push({ node, x: Math.cos(angle) * radiusAtY, y, z: Math.sin(angle) * radiusAtY });
    fragment.appendChild(node);
  }
  orb.appendChild(fragment);

  function sizeNodes() {
    const radius = orb.clientWidth / 2;
    orbNodes.forEach(({ node, x, y, z }) => {
      node.style.transform = `translate3d(${x * radius}px, ${y * radius}px, ${z * radius}px)`;
    });
  }
  sizeNodes();
  if ('ResizeObserver' in window) new ResizeObserver(sizeNodes).observe(orb);
  else window.addEventListener('resize', sizeNodes, { passive: true });

  const heroArt = document.querySelector('.hero-art');
  const orbTilt = document.querySelector('.orb-tilt');
  let pointerFrame = 0;
  heroArt.addEventListener('pointermove', event => {
    if (reducedMotion.matches || event.pointerType !== 'mouse') return;
    if (pointerFrame) cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      orbTilt.style.setProperty('--tilt-x', `${-12 - y * 9}deg`);
      orbTilt.style.setProperty('--tilt-z', `${-17 + x * 9}deg`);
      pointerFrame = 0;
    });
  }, { passive: true });
  heroArt.addEventListener('pointerleave', () => {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    orbTilt.style.removeProperty('--tilt-x');
    orbTilt.style.removeProperty('--tilt-z');
  });

  let heroVisible = true;
  function updateOrbMotion() {
    orb.style.animationPlayState = document.hidden || !heroVisible || reducedMotion.matches ? 'paused' : 'running';
  }
  if ('IntersectionObserver' in window) {
    const orbObserver = new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateOrbMotion();
    });
    orbObserver.observe(heroArt);
  }
  document.addEventListener('visibilitychange', updateOrbMotion);
  reducedMotion.addEventListener('change', () => {
    updateOrbMotion();
    if (reducedMotion.matches) {
      sectionsToReveal.forEach(section => section.classList.remove('is-pending'));
      orbTilt.style.removeProperty('--tilt-x');
      orbTilt.style.removeProperty('--tilt-z');
    }
  });
  updateOrbMotion();
  document.getElementById('year').textContent = String(new Date().getFullYear());
})();
