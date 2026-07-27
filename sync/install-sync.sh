#!/bin/zsh
# Run once on the machine that should receive updates.
set -e

REPO=https://github.com/Avyukt2012/claude-side-panel.git
DEST="$HOME/ClaudeSidePanel"
LABEL=com.avyukt.claudedock.sync
PLIST="$HOME/Library/LaunchAgents/$LABEL.plist"

if [ -d "$DEST/.git" ]; then
  /usr/bin/git -C "$DEST" fetch -q origin main
  /usr/bin/git -C "$DEST" reset -q --hard origin/main
else
  rm -rf "$DEST"
  /usr/bin/git clone -q "$REPO" "$DEST"
fi

mkdir -p "$HOME/Library/LaunchAgents"
cat > "$PLIST" <<PLISTEOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>$LABEL</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>-c</string>
    <string>/usr/bin/git -C "\$HOME/ClaudeSidePanel" fetch -q origin main \&amp;\&amp; /usr/bin/git -C "\$HOME/ClaudeSidePanel" reset -q --hard origin/main</string>
  </array>
  <key>StartInterval</key><integer>600</integer>
  <key>RunAtLoad</key><true/>
  <key>StandardErrorPath</key><string>/tmp/claudedock-sync.err</string>
</dict>
</plist>
PLISTEOF

launchctl bootout "gui/$UID/$LABEL" 2>/dev/null || true
launchctl bootstrap "gui/$UID" "$PLIST"

echo "Syncing $DEST from $REPO every 10 minutes."
echo "Load it once in edge://extensions -> Load unpacked -> $DEST"
