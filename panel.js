const frame = document.getElementById('f');
const menu = document.getElementById('menu');
const recentBtn = document.getElementById('recent');

chrome.storage.local.get('lastUrl').then(({ lastUrl }) => {
  frame.src = typeof lastUrl === 'string' && lastUrl.startsWith('https://claude.ai/')
    ? lastUrl
    : 'https://claude.ai/new';
});

function closeMenu() {
  menu.classList.remove('open');
}

function go(url) {
  frame.src = url;
  closeMenu();
}

document.getElementById('new').addEventListener('click', () => go('https://claude.ai/new'));
document.getElementById('all').addEventListener('click', () => go('https://claude.ai/recents'));

recentBtn.addEventListener('click', async e => {
  e.stopPropagation();
  if (menu.classList.contains('open')) return closeMenu();
  await render();
  menu.classList.add('open');
});

document.addEventListener('click', closeMenu);
menu.addEventListener('click', e => e.stopPropagation());

async function render() {
  const { chats } = await chrome.storage.local.get('chats');
  menu.replaceChildren();

  if (!Array.isArray(chats) || !chats.length) {
    const note = document.createElement('div');
    note.className = 'empty';
    note.textContent = 'No chats yet. Ones you open here get listed.';
    menu.append(note);
    return;
  }

  for (const chat of chats) {
    const item = document.createElement('button');
    item.textContent = chat.title || 'Untitled';
    item.title = chat.title || '';
    item.addEventListener('click', () => go(chat.url));
    menu.append(item);
  }
}

chrome.storage.onChanged.addListener(changes => {
  if (changes.chats && menu.classList.contains('open')) render();
});
