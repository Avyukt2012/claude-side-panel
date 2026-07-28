chrome.runtime.onInstalled.addListener(init);
chrome.runtime.onStartup.addListener(init);

function init() {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
  fetch('https://claude.ai/new', { mode: 'no-cors', credentials: 'include' }).catch(() => {});
}
