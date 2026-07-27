const CHIP_LABELS = [
  'write', 'learn', 'code', 'life stuff', 'connect apps',
  "claude's choice", 'claude’s choice'
];

function isChip(el) {
  const t = (el.innerText || '').trim().toLowerCase();
  if (!t || t.length > 20) return false;
  if (!CHIP_LABELS.includes(t)) return false;
  return el.getBoundingClientRect().height < 80;
}

function hideChips() {
  const hits = [];
  document.querySelectorAll('button, a[role="button"]').forEach(el => {
    if (isChip(el)) hits.push(el);
  });
  if (!hits.length) return;

  const parents = new Set(hits.map(el => el.parentElement).filter(Boolean));
  for (const p of parents) {
    const kids = Array.from(p.children);
    if (kids.length && kids.every(k => hits.includes(k))) {
      p.setAttribute('data-dock-hide', '');
      continue;
    }
    kids.filter(k => hits.includes(k)).forEach(k => k.setAttribute('data-dock-hide', ''));
  }
}

function pinComposer() {
  const editor = document.querySelector('div[contenteditable="true"]');
  if (!editor) return;

  let node = editor;
  let wrap = null;
  for (let i = 0; i < 8 && node.parentElement; i++) {
    node = node.parentElement;
    const r = node.getBoundingClientRect();
    if (r.width >= window.innerWidth * 0.7 && r.height < window.innerHeight * 0.6) wrap = node;
  }
  if (!wrap || wrap.dataset.dockPinned) return;

  wrap.dataset.dockPinned = '1';
  wrap.style.setProperty('position', 'fixed', 'important');
  wrap.style.setProperty('left', '0', 'important');
  wrap.style.setProperty('right', '0', 'important');
  wrap.style.setProperty('bottom', '0', 'important');
  wrap.style.setProperty('top', 'auto', 'important');
  wrap.style.setProperty('margin', '0', 'important');
  wrap.style.setProperty('padding', '0 12px 12px', 'important');
  wrap.style.setProperty('z-index', '40', 'important');
}

let lastSeen = '';
function remember() {
  if (location.href === lastSeen) return;
  lastSeen = location.href;
  chrome.storage.local.set({ lastUrl: location.href });
}

function tidy() {
  document.documentElement.setAttribute('data-dock-bottom', '');
  hideChips();
  pinComposer();
  remember();
}

tidy();
new MutationObserver(() => tidy()).observe(document.documentElement, {
  childList: true,
  subtree: true
});
