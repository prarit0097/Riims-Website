#!/usr/bin/env bash
# ============================================================================
# RIIMS — update the live site on the VPS (git pull only; safe & isolated).
# Usage:  ./deploy/update.sh  [REPO_DIR]
#   REPO_DIR defaults to /var/www/riimshospitals
# The web root is REPO_DIR/site (configured in nginx/Apache).
# This NEVER touches other apps on the VPS.
# ============================================================================
set -euo pipefail

REPO_DIR="${1:-/var/www/riimshospitals}"

if [ ! -d "$REPO_DIR/.git" ]; then
  echo "ERROR: $REPO_DIR is not a git repo. Clone it first (see deploy/DEPLOY.md)." >&2
  exit 1
fi

cd "$REPO_DIR"
echo "Updating RIIMS site in $REPO_DIR ..."
git fetch origin main
git reset --hard origin/main          # output is generated & committed, so this is the source of truth
echo "Done. Live web root: $REPO_DIR/site"
echo "Tip: no web-server reload needed for content changes (static files)."
