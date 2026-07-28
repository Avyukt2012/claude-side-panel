#!/bin/zsh
# Mirror ~/ClaudeSidePanel to the tip of main.
# Uses only base macOS tools - no git, so no Xcode Command Line Tools needed.
# _metadata/ is excluded from --delete because the browser writes it into the
# extension folder and owns it.

DEST="$HOME/ClaudeSidePanel"
URL="https://codeload.github.com/Avyukt2012/claude-side-panel/tar.gz/refs/heads/main"

TMP=$(/usr/bin/mktemp -d) || exit 1
trap 'rm -rf "$TMP"' EXIT

/usr/bin/curl -fsSL --retry 2 --max-time 60 "$URL" | /usr/bin/tar xz -C "$TMP" || exit 1

SRC="$TMP/claude-side-panel-main"
[ -d "$SRC" ] || exit 1

/bin/mkdir -p "$DEST"
/usr/bin/rsync -a --delete --exclude '_metadata' "$SRC/" "$DEST/"
