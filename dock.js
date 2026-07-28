const HOST_ID = 'claude-dock-host';

if (document.documentElement.dataset.claudeDock === 'ready') {
  throw new Error('claude dock already loaded in this page');
}
const MIN_W = 300;
const MAX_W = 900;

let host = null;
let shadow = null;
let width = 420;
let lastUrl = '';

function build() {
  host = document.createElement('div');
  host.id = HOST_ID;
  host.style.cssText = 'all:initial;position:fixed;top:0;right:0;height:100%;z-index:2147483647;';
  shadow = host.attachShadow({ mode: 'open' });

  const style = document.createElement('style');
  style.textContent = `
    :host { display: block; }
    .dock {
      position: fixed; top: 0; right: 0; height: 100vh;
      display: flex; background: #faf9f7;
      box-shadow: -1px 0 0 rgba(0,0,0,.12);
    }
    @media (prefers-color-scheme: dark) {
      .dock { background: #262624; box-shadow: -1px 0 0 rgba(255,255,255,.12); }
    }
    .grip {
      width: 6px; height: 100%; cursor: col-resize; flex: 0 0 6px;
      background: transparent;
    }
    .grip:hover { background: rgba(217,119,87,.5); }
    iframe { border: 0; height: 100%; flex: 1 1 auto; display: block; }
  `;

  const dock = document.createElement('div');
  dock.className = 'dock';

  const grip = document.createElement('div');
  grip.className = 'grip';

  const frame = document.createElement('iframe');
  frame.src = chrome.runtime.getURL('panel.html')
    + (lastUrl ? '#' + encodeURIComponent(lastUrl) : '');
  frame.setAttribute('allow', 'clipboard-read; clipboard-write; microphone; camera; fullscreen');

  dock.append(grip, frame);
  shadow.append(style, dock);
  document.documentElement.append(host);

  grip.addEventListener('mousedown', startResize);
  return { dock, frame };
}

function startResize(e) {
  e.preventDefault();
  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;inset:0;z-index:2147483647;cursor:col-resize;';
  shadow.append(overlay);

  const move = ev => {
    width = Math.min(MAX_W, Math.max(MIN_W, window.innerWidth - ev.clientX));
    apply();
  };
  const up = () => {
    overlay.remove();
    window.removeEventListener('mousemove', move);
    window.removeEventListener('mouseup', up);
    chrome.storage.local.set({ width });
  };
  window.addEventListener('mousemove', move);
  window.addEventListener('mouseup', up);
}

function apply() {
  if (!shadow) return;
  shadow.querySelector('.dock').style.width = width + 'px';
  document.documentElement.style.setProperty('margin-right', width + 'px', 'important');
  document.documentElement.style.setProperty('width', 'auto', 'important');
}

function open() {
  if (!host) build();
  host.style.display = 'block';
  apply();
  chrome.storage.local.set({ open: true });
}

function close() {
  if (host) host.style.display = 'none';
  document.documentElement.style.removeProperty('margin-right');
  document.documentElement.style.removeProperty('width');
  chrome.storage.local.set({ open: false });
}

function toggle() {
  const shown = host && host.style.display !== 'none';
  shown ? close() : open();
}

document.documentElement.dataset.claudeDock = 'ready';

chrome.runtime.onMessage.addListener(msg => {
  if (msg.type === 'toggle') toggle();
  if (msg.type === 'close') close();
});

for (const host of ['https://claude.ai', 'https://assets-proxy.anthropic.com', 'https://a.claude.ai']) {
  const link = document.createElement('link');
  link.rel = 'preconnect';
  link.href = host;
  link.crossOrigin = '';
  document.documentElement.append(link);
}

chrome.storage.local.get(['open', 'width', 'lastUrl']).then(s => {
  if (typeof s.width === 'number') width = s.width;
  lastUrl = typeof s.lastUrl === 'string' ? s.lastUrl : '';
  if (s.open) open();
});
