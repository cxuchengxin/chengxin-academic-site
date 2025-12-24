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

# Commit message
MSG="${1:-}"
if [[ -z "${MSG}" ]]; then
  MSG="Publish site $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo "==> 1) Rendering site to docs/ ..."
quarto render

echo "==> 2) Checking git status ..."
git status --porcelain

# Stage everything (including docs/)
echo "==> 3) Staging changes ..."
git add .

# If no changes, exit cleanly
if git diff --cached --quiet; then
  echo "==> No changes to commit. Nothing to publish."
  exit 0
fi

echo "==> 4) Committing ..."
git commit -m "${MSG}"

echo "==> 5) Pushing to GitHub ..."
git push

echo "✅ Done! Your GitHub Pages site should update shortly."