#!/bin/bash
set -e

if [ -z "$1" ]; then
  echo "❌ Usage: ./update.sh <version>"
  exit 1
fi

NEW_VERSION=$1

# --- Verify format semver ---
if [[ ! "$NEW_VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9\.\-]+)?$ ]]; then
  echo "❌ Version must follow semver (e.g. 1.2.3 or 1.2.3-alpha.1)"
  exit 1
fi

# --- Get current version from package.json ---
CURRENT_VERSION=$(jq -r .version package.json)

# --- Compare versions ---
if [ "$(printf '%s\n' "$CURRENT_VERSION" "$NEW_VERSION" | sort -V | head -n1)" = "$NEW_VERSION" ] && [ "$CURRENT_VERSION" != "$NEW_VERSION" ]; then
  echo "❌ New version ($NEW_VERSION) must be greater than current version ($CURRENT_VERSION)"
  exit 1
fi

echo "ℹ️ Current version: $CURRENT_VERSION"
echo "ℹ️ New version: $NEW_VERSION"

# --- Update package.json ---
jq --arg v "$NEW_VERSION" '.version = $v' package.json > package.json.tmp && mv package.json.tmp package.json

# --- Commit and tag ---
git add package.json
git commit -m "chore: release v$NEW_VERSION"
git tag "v$NEW_VERSION"
git push origin main --tags

echo "✅ Version updated to $NEW_VERSION and pushed to main"
