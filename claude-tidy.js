fetch(chrome.runtime.getURL('claude-ui.css'))
  .then(r => r.text())
  .then(css => {
    const style = document.createElement('style');
    style.id = 'claude-dock-style';
    style.textContent = css;
    (document.head || document.documentElement).append(style);
  });

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

// The panel is a third-party context, so Edge partitions claude.ai's cookies and
// nothing persists between opens. Ask for unpartitioned access - it needs a user
// gesture the first time, so retry on the first interaction too.
async function ensureStorageAccess() {
  if (window.top === window.self) return;
  if (!document.requestStorageAccess) return;
  try {
    if (await document.hasStorageAccess()) return;
    await document.requestStorageAccess();
  } catch (e) {
    // needs a gesture, or the user declined; the listener below tries again
  }
}

ensureStorageAccess();
for (const evt of ['pointerdown', 'keydown']) {
  document.addEventListener(evt, ensureStorageAccess, { once: true, capture: true });
}

let lastSeen = '';
function remember() {
  if (location.href === lastSeen) return;
  lastSeen = location.href;
  chrome.storage.local.set({ lastUrl: location.href });
}


function isLeafText(el) {
  const t = (el.textContent || '').trim();
  if (!t) return false;
  for (const c of el.children) if ((c.textContent || '').trim()) return false;
  return true;
}

function safeContainer(el, maxHeight) {
  let node = el;
  for (let i = 0; i < 4; i++) {
    const parent = node.parentElement;
    if (!parent || parent === document.body || parent === document.documentElement) break;
    if (parent.querySelector('#root, main, div[contenteditable="true"]')) break;
    if (parent.getBoundingClientRect().height > maxHeight) break;
    node = parent;
  }
  return node;
}

function onNewChat() {
  const p = location.pathname;
  return p === '/' || p === '/new' || p.startsWith('/new');
}

function hideGreeting() {
  if (!onNewChat()) return;
  for (const el of document.querySelectorAll('h1, h2, h3, p, div, span')) {
    if (!isLeafText(el)) continue;
    if (el.closest('form, nav, header, [contenteditable="true"], [data-dock-hide]')) continue;
    const size = parseFloat(getComputedStyle(el).fontSize) || 0;
    const r = el.getBoundingClientRect();
    if (size >= 22 && r.height > 0 && r.height < 220) el.setAttribute('data-dock-hide', '');
  }
}

const PLAN_LABELS = [
  'upgrade', 'upgrade plan', 'upgrade to pro', 'try pro', 'free plan',
  'your plan', 'get more usage', 'usage limit'
];

function hidePlanNag() {
  for (const el of document.querySelectorAll('button, a, div, span, p')) {
    if (!isLeafText(el)) continue;
    if (el.closest('[data-dock-hide]')) continue;
    const t = (el.textContent || '').trim().toLowerCase();
    if (!t || t.length > 28) continue;
    if (!PLAN_LABELS.some(l => t === l || t.startsWith(l))) continue;
    safeContainer(el, 140).setAttribute('data-dock-hide', '');
  }
}

function hideCookieBanner() {
  for (const el of document.querySelectorAll('h1, h2, h3, strong, p, span')) {
    const t = (el.textContent || '').trim().toLowerCase();
    if (!t.startsWith('cookie settings') && !t.startsWith('we use cookies')) continue;

    let node = el;
    for (let i = 0; i < 7; i++) {
      const parent = node.parentElement;
      if (!parent || parent === document.body || parent === document.documentElement) break;
      // never hide something that contains the app itself
      if (parent.querySelector('#root, main, div[contenteditable="true"]')) break;
      const r = parent.getBoundingClientRect();
      if (r.height > window.innerHeight * 0.5) break;
      node = parent;
      if (r.height > 110) break;
    }
    node.setAttribute('data-dock-hide', '');
    return;
  }
}

function tidy() {
  document.documentElement.setAttribute('data-dock-bottom', '');
  hideChips();
  hideGreeting();
  hidePlanNag();
  hideCookieBanner();
  pinComposer();
  remember();
}

tidy();
new MutationObserver(() => tidy()).observe(document.documentElement, {
  childList: true,
  subtree: true
});
