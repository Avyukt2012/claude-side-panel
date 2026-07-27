#!/bin/zsh
# Mirror ~/ClaudeSidePanel to origin/main. Hard reset, because the folder is a
# mirror and the browser writes _metadata/ into it, which would block a merge.
D="$HOME/ClaudeSidePanel"
[ -d "$D/.git" ] || exit 0
/usr/bin/git -C "$D" fetch -q origin main || exit 1
/usr/bin/git -C "$D" reset -q --hard origin/main
