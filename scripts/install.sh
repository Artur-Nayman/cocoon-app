#!/bin/bash
set -e

DIR="$(cd "$(dirname "$0")/.." && pwd)"
APP_NAME="Digital Cocoon"
DESKTOP_NAME="digital-cocoon.desktop"
BIN_DIR="$HOME/.local/bin"
APPS_DIR="$HOME/.local/share/applications"
ICONS_DIR="$HOME/.local/share/icons"

echo "=== Rebuilding $APP_NAME ==="
cd "$DIR"
npm run electron:build:linux

echo ""
echo "=== Installing AppImage ==="
mkdir -p "$BIN_DIR"
cp "$DIR/release/$APP_NAME-1.0.0.AppImage" "$BIN_DIR/digital-cocoon.AppImage"
chmod +x "$BIN_DIR/digital-cocoon.AppImage"
echo "  -> $BIN_DIR/digital-cocoon.AppImage"

echo ""
echo "=== Installing desktop entry ==="
mkdir -p "$APPS_DIR"
cp "$DIR/build/$DESKTOP_NAME" "$APPS_DIR/"
echo "  -> $APPS_DIR/$DESKTOP_NAME"

echo ""
echo "=== Installing icon ==="
mkdir -p "$ICONS_DIR"
cp "$DIR/build/icons/256x256.png" "$ICONS_DIR/digital-cocoon.png"
echo "  -> $ICONS_DIR/digital-cocoon.png"

echo ""
echo "=== Updating desktop database ==="
update-desktop-database "$APPS_DIR" 2>/dev/null || true

echo ""
echo "=== Done! Search 'Digital Cocoon' in your launcher. ==="
