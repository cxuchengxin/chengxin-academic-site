#!/usr/bin/env bash
set -euo pipefail

# ============================
# Quarto + GitHub Pages publish script (Mac/Linux)
# Usage:
#   ./publish.sh "Your commit message"
# If no message is provided, a timestamp message will be used.
# ============================

# Ensure we're in a git repo
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "ERROR: This folder is not a Git repository. Run this in your site project root."
  exit 1
fi

# Ensure quarto is installed
if ! command -v quarto >/dev/null 2>&1; then
  echo "ERROR: Quarto is not installed or not in PATH."
  echo "Try: quarto --version"
  exit 1
fi

# Ensure we are on main (optional but recommended)
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "${BRANCH}" != "main" ]]; then
  echo "ERROR: You are on branch '${BRANCH}'. Switch to main first:"
  echo "  git checkout main"
  exit 1
fi

# Commit message
MSG="${1:-}"
if [[ -z "${MSG}" ]]; then
  MSG="Publish site $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "==> 0) Syncing with remote (rebase) ..."
git fetch origin
# Rebase your local commits on top of origin/main (prevents push rejection)
git pull --rebase --autostash origin main

echo "==> 1) Rendering site to docs/ ..."
quarto render

echo "==> 2) Checking git status ..."
git status --porcelain

echo "==> 3) Staging changes ..."
git add .

# If no changes, exit cleanly
if git diff --cached --quiet; then
  echo "==> No changes to commit. Nothing to publish."
  exit 0
fi

echo "==> 4) Committing ..."
git commit -m "${MSG}"

echo "==> 5) Syncing again (in case remote changed while you were rendering) ..."
git fetch origin
git pull --rebase origin main

echo "==> 6) Pushing to GitHub ..."
git push origin main

echo "✅ Done! Your GitHub Pages site should update shortly."