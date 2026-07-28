chrome.action.onClicked.addListener(async tab => {
  if (!tab.id) return;

  try {
    await chrome.tabs.sendMessage(tab.id, { type: 'toggle' });
    return;
  } catch (e) {
    // No content script in this tab - it was open before the extension loaded,
    // or the extension was just reloaded. Inject it now and let it open itself.
  }

  try {
    await chrome.storage.local.set({ open: true });
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (e) {
    // Restricted page (edge://, the Add-ons store, a PDF viewer). Nothing to do.
  }
});
