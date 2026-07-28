#!/bin/zsh
# Run once on the machine that should receive updates.
# Base macOS tools only - no git, no Xcode Command Line Tools.
set -e

DEST="$HOME/ClaudeSidePanel"
URL="https://codeload.github.com/Avyukt2012/claude-side-panel/tar.gz/refs/heads/main"
LABEL=com.avyukt.claudedock.sync
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

TMP=$(/usr/bin/mktemp -d)
trap 'rm -rf "$TMP"' EXIT

/usr/bin/curl -fsSL --retry 2 --max-time 60 "$URL" | /usr/bin/tar xz -C "$TMP"
SRC="$TMP/claude-side-panel-main"
[ -d "$SRC" ] || { echo "download failed"; exit 1; }

/bin/mkdir -p "$DEST"
/usr/bin/rsync -a --delete --exclude '_metadata' "$SRC/" "$DEST/"
/bin/chmod +x "$DEST/sync/pull.sh"

/bin/mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>$DEST/sync/pull.sh</string>
  </array>
  <key>StartInterval</key><integer>600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>/tmp/claudedock-sync.err</string>
</dict>
</plist>
PLISTEOF

launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID" "$PLIST"

echo ""
echo "Installed to $DEST, syncing every 10 minutes."
echo "Now: edge://extensions -> Developer mode -> Load unpacked -> $DEST"
