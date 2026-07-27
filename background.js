chrome.action.onClicked.addListener(tab => {
  if (!tab.id) return;
  chrome.tabs.sendMessage(tab.id, { type: 'toggle' }).catch(() => {});
});

chrome.runtime.onInstalled.addListener(scheduleUpdateCheck);
chrome.runtime.onStartup.addListener(scheduleUpdateCheck);

function scheduleUpdateCheck() {
  chrome.alarms.create('update-check', { periodInMinutes: 5 });
}

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name === 'update-check') checkForUpdate();
});

async function checkForUpdate() {
  try {
    const res = await fetch(chrome.runtime.getURL('manifest.json'), { cache: 'no-store' });
    const onDisk = (await res.json()).version;
    if (onDisk && onDisk !== chrome.runtime.getManifest().version) chrome.runtime.reload();
  } catch (e) {
    // folder mid-pull or unreadable; try again on the next alarm
  }
}
