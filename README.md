# claude-side-panel

Claude docked into the right-hand side of the browser, replacing Edge's Copilot sidebar.
Chromium-based browsers on macOS. Works with a free claude.ai account.

The dock is injected into the page rather than using the `sidePanel` API, so there is
no browser-drawn header bar and no open animation. `declarativeNetRequest` strips
claude.ai's frame-blocking headers and normalises `Sec-Fetch-*` so it renders in an
iframe without tripping Cloudflare's bot check.

## Install on a machine

```bash
curl -fsSL https://raw.githubusercontent.com/Avyukt2012/claude-side-panel/main/sync/install-sync.sh | zsh
```

Downloads to `~/ClaudeSidePanel` and installs a launchd agent that re-syncs every 10
minutes. Uses only `curl`, `tar` and `rsync` - all base macOS - so it needs no git
and no Xcode Command Line Tools.
Then load it once: `edge://extensions` → Developer mode → Load unpacked → `~/ClaudeSidePanel`.

Toggle with the toolbar icon or Alt+C. Drag the left edge to resize.

## Shipping a change

```bash
./release.sh "what changed"
```

Bumps the patch version, commits, pushes. The other machine pulls within 10 minutes.

## What updates automatically, and what doesn't

`dock.js`, `claude-tidy.js`, `claude-ui.css`, `panel.html` and `panel.js` are loaded
from disk on demand — `content.js` and `claude-ui.js` are permanent one-line loaders
that dynamically import the real code. Edits to those files take effect on the next
page load with no extension reload.

`manifest.json` is only parsed when the extension is loaded. Permission, content-script
or DNR-rule changes need a click on Reload in `edge://extensions`, or an Edge restart.
`chrome.runtime.reload()` does not help — it re-runs the extension without re-reading
the manifest or content scripts.
