const frame = document.getElementById('f');

chrome.storage.local.get('lastUrl').then(({ lastUrl }) => {
  frame.src = typeof lastUrl === 'string' && lastUrl.startsWith('https://claude.ai/')
    ? lastUrl
    : 'https://claude.ai/new';
});
