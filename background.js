// Two ways in, because browsers differ on which one they honour.
// If openPanelOnActionClick is respected, the browser opens the panel itself and
// onClicked never fires. If it isn't, onClicked fires and we open explicitly.
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(e => console.error('[claude] setPanelBehavior failed:', e));

chrome.action.onClicked.addListener(async tab => {
  try {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  } catch (e) {
    console.error('[claude] sidePanel.open failed:', e);
  }
});

chrome.runtime.onInstalled.addListener(warm);
chrome.runtime.onStartup.addListener(warm);

function warm() {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch(() => {});
  fetch('https://claude.ai/new', { mode: 'no-cors', credentials: 'include' }).catch(() => {});
}
