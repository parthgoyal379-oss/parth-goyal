(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const nav = document.getElementById('nav');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = [...document.querySelectorAll('#nav .n-link[href^="#"]')];
  const marginFill = document.getElementById('marginFill');
  const markSection = document.getElementById('markSection');
  const markPage = document.getElementById('markPage');
  const labels = { hero: 'Hero', about: 'About', work: 'Work', method: 'Method', contact: 'Contact' };
  const parallax = [...document.querySelectorAll('.reg-mark, .h-ref')];
  let lastY = scrollY, pending = false, positions = [], scrollRange = 1, current = '';
  function measure() {
    positions = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top + scrollY }));
    scrollRange = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    schedule();
  }
  function updateScroll() {
    const y = scrollY;
    if (nav) {
      nav.classList.toggle('sc', y > 12);
      nav.classList.toggle('hide', !reduced.matches && !nav.contains(document.activeElement) && y > lastY + 3 && y > 140);
    }
    if (marginFill) marginFill.style.transform = `scaleY(${Math.min(1, Math.max(0, y / scrollRange))})`;
    const active = positions.filter(section => section.top <= y + innerHeight * .3).at(-1) || positions[0];
    if (active && active.id !== current) {
      current = active.id;
      navLinks.forEach(link => {
        if (link.hash === '#' + current) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
      if (markSection) markSection.textContent = labels[current];
      if (markPage) markPage.textContent = `${String(positions.findIndex(section => section.id === current) + 1).padStart(2, '0')} / ${String(positions.length).padStart(2, '0')}`;
    }
    if (!reduced.matches) parallax.forEach((el, i) => { el.style.transform = `translateY(${Math.min(14, y * (.05 + i * .02)).toFixed(1)}px)`; });
    lastY = y;
    pending = false;
  }
  function schedule() { if (!pending) { pending = true; requestAnimationFrame(updateScroll); } }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', measure, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(measure).observe(document.querySelector('main'));
  document.fonts.ready.then(measure);
  measure();
  function count(el) {
    const original = el.textContent.trim();
    const match = original.match(/^([₹]?)(\d+)(\+| days)?$/);
    if (!match) return;
    const start = performance.now();
    function tick(now) {
      if (reduced.matches) { el.textContent = original; return; }
      const progress = Math.min(1, (now - start) / 600);
      el.textContent = match[1] + Math.round(Number(match[2]) * (1 - (1 - progress) ** 3)) + (match[3] || '');
      if (progress < 1) requestAnimationFrame(tick); else el.textContent = original;
    }
    requestAnimationFrame(tick);
  }
  if ('IntersectionObserver' in window && !reduced.matches) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add(el.classList.contains('stamp') ? 'stamped' : 'in');
      if (el.classList.contains('pj-stat-n')) count(el);
      observer.unobserve(el);
    }), { threshold: 0, rootMargin: '0px 0px 40px 0px' });
    // Finish all geometry reads before changing classes to avoid a layout flush
    // for each individual animated element during startup.
    const targets = [...document.querySelectorAll('.reveal, .stamp, .pj-stat-n')]
      .map(el => ({ el, aboveFold: el.getBoundingClientRect().top < innerHeight }));
    targets.forEach(({ el, aboveFold }) => {
      if (aboveFold) el.classList.add(el.classList.contains('stamp') ? 'stamped' : 'in');
      else observer.observe(el);
    });
    document.documentElement.classList.add('motion-ready');
  } else {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
    document.querySelectorAll('.stamp').forEach(el => el.classList.add('stamped'));
  }
  reduced.addEventListener('change', () => {
    document.documentElement.classList.remove('motion-ready');
    document.querySelectorAll('.stamp').forEach(el => el.classList.add('stamped'));
    document.querySelectorAll('.pj-card-inner, .reg-mark, .h-ref').forEach(el => el.style.transform = '');
    schedule();
  });
  if (matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)').matches) {
    document.querySelectorAll('.pj-card-inner').forEach(card => {
      let frame = 0, point;
      card.addEventListener('pointermove', event => {
        if (reduced.matches) return;
        point = { x: event.clientX, y: event.clientY };
        if (frame) return;
        frame = requestAnimationFrame(() => {
          const box = card.getBoundingClientRect();
          card.style.transform = `rotateX(${(-((point.y - box.top) / box.height - .5) * 1.4).toFixed(2)}deg) rotateY(${(((point.x - box.left) / box.width - .5) * 1.4).toFixed(2)}deg)`;
          frame = 0;
        });
      });
      card.addEventListener('pointerleave', () => { cancelAnimationFrame(frame); frame = 0; card.style.transform = ''; });
    });
  }
  const copy = document.querySelector('[data-copy-email]');
  if (copy && navigator.clipboard && window.isSecureContext) {
    copy.hidden = false;
    copy.addEventListener('click', async () => {
      const status = document.querySelector('.copy-status');
      try { await navigator.clipboard.writeText(copy.dataset.copyEmail); status.textContent = 'Email address copied.'; }
      catch { status.textContent = 'Select the email address above to copy it.'; }
    });
  }
})();
