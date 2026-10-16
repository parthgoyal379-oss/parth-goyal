/* Choreography is progressive: the document stays readable without animation. */
(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const running = new Set();
  function enter(element, delay = 0, distance = 24) {
    if (!element || reduced.matches || !element.animate) return;
    const animation = element.animate([
      { opacity: .15, transform: `translateY(${distance}px)`, clipPath: 'inset(0 0 12% 0)' },
      { opacity: 1, transform: 'translateY(0)', clipPath: 'inset(0 0 0% 0)' }
    ], { duration: 950, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' });
    running.add(animation);
    animation.finished.catch(() => {}).finally(() => running.delete(animation));
  }
  document.querySelectorAll('.h-eyebrow, .h-namewrap, .h-lead, .h-tagline, .h-actions, .h-stats, .systems-lab').forEach((el, i) => enter(el, i * 75, i === 1 ? 48 : 24));
  const lab = document.querySelector('.systems-lab');
  if (lab) {
    // Duplicate the real connection geometry: luminous packets follow each curve.
    const svg = lab.querySelector('svg');
    const ns = 'http://www.w3.org/2000/svg';
    const packets = document.createElementNS(ns, 'g');
    packets.setAttribute('class', 'signal-packets');
    packets.setAttribute('aria-hidden', 'true');
    lab.querySelectorAll('.diagram-paths path').forEach((path, i) => {
      const packet = path.cloneNode();
      packet.setAttribute('pathLength', '100');
      packet.style.setProperty('--packet-delay', `${i * -.72}s`);
      packets.append(packet);
    });
    svg.insertBefore(packets, lab.querySelector('.diagram-nodes'));
    lab.querySelectorAll('[data-system]').forEach(button => button.addEventListener('click', () => {
      running.forEach(animation => animation.cancel());
      lab.querySelectorAll('.lab-description > *, .diagram-labels, .diagram-nodes').forEach((el, i) => enter(el, i * 40, 12));
    }));
    const visibility = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
      lab.classList.toggle('motion-visible', entries[0].isIntersecting);
    }) : null;
    visibility?.observe(lab);
    function setPlayback() { lab.classList.toggle('motion-paused', document.hidden || reduced.matches); }
    document.addEventListener('visibilitychange', setPlayback);
    reduced.addEventListener('change', setPlayback);
    setPlayback();
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.querySelectorAll('.hero-project, .pj-node, .mt-step, .case-flow li').forEach((el, i) => enter(el, i * 85, 18));
      observer.unobserve(entry.target);
    }), { threshold: .12 });
    document.querySelectorAll('.hero-index, .pj-right, .mt-grid, .case-flow').forEach(el => observer.observe(el));
  }
  document.querySelectorAll('.btn-p, .nav-command').forEach(button => {
    let frame = 0;
    function reset() { cancelAnimationFrame(frame); frame = 0; button.style.removeProperty('translate'); }
    button.addEventListener('pointermove', event => {
      if (reduced.matches || !fine.matches) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const rect = button.getBoundingClientRect();
        button.style.translate = `${((event.clientX - rect.left - rect.width / 2) * .08).toFixed(1)}px ${((event.clientY - rect.top - rect.height / 2) * .12).toFixed(1)}px`;
      });
    });
    button.addEventListener('pointerleave', reset);
    button.addEventListener('blur', reset);
    reduced.addEventListener('change', reset);
  });
  reduced.addEventListener('change', () => {
    if (reduced.matches) running.forEach(animation => animation.cancel());
  });
})();
