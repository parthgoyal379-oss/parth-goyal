(() => {
  'use strict';
  const systems = {
    classpredictor: { category: 'EDUCATION / PREREQUISITE GRAPHS', title: 'Make the invisible visible.', copy: 'A weak foundation echoes through every topic built on it. ClassPredictor maps those connections into a preparation plan.', name: 'ClassPredictor', nodes: ['Foundations', 'Target exam', 'Dependencies', 'Risk map', 'Study roadmap'], color: '#64734c', background: '#e9ece2' },
    synapse: { category: 'BEHAVIOR / AI HABIT SUPPORT', title: 'A setback is a data point.', copy: 'Reflection becomes context. Context becomes an AI plan. Daily check-ins connect that plan to the next small action.', name: 'SYNAPSE', nodes: ['Reflection', 'Patterns', 'Check-ins', 'AI plan', 'Next action'], color: '#8b654d', background: '#efe5db' },
    verdikt: { category: 'INTELLIGENCE / NEWS PIPELINES', title: 'Less noise. More signal.', copy: 'Multiple news feeds converge into one pipeline: collect, deduplicate, evaluate impact, and make the story easier to understand.', name: 'Verdikt', nodes: ['RSS feeds', 'News stories', 'Duplicates', 'Impact scores', 'Market feed'], color: '#526b7a', background: '#e2e9ec' }
  };
  const lab = document.querySelector('.systems-lab');
  if (lab) {
    lab.querySelectorAll('[data-system]').forEach(button => { button.disabled = false; });
    lab.querySelectorAll('[data-system]').forEach(button => button.addEventListener('click', () => {
      const key = button.dataset.system, system = systems[key];
      lab.querySelectorAll('[data-system]').forEach(tab => tab.setAttribute('aria-pressed', String(tab === button)));
      document.getElementById('lab-category').textContent = system.category;
      document.getElementById('lab-title').textContent = system.title;
      document.getElementById('lab-copy').textContent = system.copy;
      const link = document.getElementById('lab-link');
      link.href = `/projects/${key}/`;
      link.replaceChildren(document.createTextNode(`Explore ${system.name} `));
      const arrow = document.createElement('span');
      arrow.setAttribute('aria-hidden', 'true'); arrow.textContent = '↗'; link.append(arrow);
      lab.querySelectorAll('[data-node]').forEach(node => { node.textContent = system.nodes[Number(node.dataset.node)]; });
      lab.querySelector('.lab-visual').style.color = system.color;
      lab.querySelector('.diagram-core').style.color = system.color;
      lab.querySelector('.lab-visual').style.backgroundColor = system.background;
      lab.querySelector('.lab-heading>span:last-child').textContent = `0${Object.keys(systems).indexOf(key) + 1} — 03`;
    }));
  }
  const dialog = document.querySelector('.command-dialog');
  const opener = document.querySelector('[data-open-command]');
  if (!dialog || !opener || typeof dialog.showModal !== 'function') return;
  opener.hidden = false;
  opener.addEventListener('click', () => dialog.showModal());
  document.querySelector('[data-close-command]').addEventListener('click', () => dialog.close());
  dialog.querySelectorAll('a').forEach(link => link.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    const box = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
  });
  document.addEventListener('keydown', event => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close(); else dialog.showModal();
    }
  });
})();
