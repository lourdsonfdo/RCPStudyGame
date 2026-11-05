#!/bin/sh
# Pre-push guard for RCPStudyGame.
#  1. Lists every commit about to be published, so a commit made by another
#     session (e.g. the b3653cc storybook incident) is visible before the push.
#  2. Blocks the push if shipped content changed but sw.js CACHE did not,
#     because the service worker is cache-first and phones would never update.
# Install: sh tools/install_hooks.sh    Bypass once: git push --no-verify
set -e
cd "$(git rev-parse --show-toplevel)"
BASE=origin/main
git rev-parse --verify -q "$BASE" >/dev/null || exit 0

echo "== Commits that will be published ($BASE..HEAD):"
git log "$BASE..HEAD" --format='   %h %an  %s'
[ -z "$(git log "$BASE..HEAD" --format=%h)" ] && exit 0

# Shipped paths: everything the app serves. Docs, mockups and tools do not count.
CHANGED=$(git diff --name-only "$BASE..HEAD" -- index.html manifest.json js css content img audio icons)
[ -z "$CHANGED" ] && exit 0

old=$(git show "$BASE:sw.js" 2>/dev/null | grep -m1 "^const CACHE" || true)
new=$(grep -m1 "^const CACHE" sw.js || true)
if [ "$old" = "$new" ]; then
  echo ""
  echo "BLOCKED: shipped files changed but sw.js CACHE was not bumped:"
  echo "$CHANGED" | sed 's/^/   /' | head -15
  echo "   current: $new"
  echo "Bump CACHE in sw.js, commit, push again (or git push --no-verify to skip)."
  exit 1
fi
exit 0
