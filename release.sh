#!/bin/zsh
# Run on this Mac after changing the extension. Bumps the patch version,
# commits and pushes. The other Mac pulls within 10 minutes and the
# extension reloads itself when it sees the new version on disk.
set -e

cd "$(dirname "$0")"

V=$(/usr/bin/python3 -c "
import json
p='manifest.json'
m=json.load(open(p))
a,b,c=m['version'].split('.')
m['version']='%s.%s.%d'%(a,b,int(c)+1)
json.dump(m,open(p,'w'),indent=2)
open(p,'a').write('\n')
print(m['version'])
")

git add -A
git commit -qm "${1:-Update} (v$V)

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>"
git push -q origin main

echo "Pushed v$V. The other Mac picks it up within 10 minutes."
