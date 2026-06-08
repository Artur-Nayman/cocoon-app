#!/bin/bash
set -e

APP_NAME="Digital Cocoon"
APPIMAGE_SRC="release/Digital Cocoon-1.0.0.AppImage"
APPIMAGE_DST="${HOME}/.local/bin/digital-cocoon.AppImage"
ICON_SRC="build/icons/256x256.png"
ICON_DST="${HOME}/.local/share/icons/digital-cocoon.png"
DESKTOP_SRC="build/digital-cocoon.desktop"
DESKTOP_DST="${HOME}/.local/share/applications/digital-cocoon.desktop"

if [ ! -f "$APPIMAGE_SRC" ]; then
  echo "Error: AppImage not found at $APPIMAGE_SRC"
  echo "Run 'npm run electron:build:linux' first."
  exit 1
fi

echo "==> Installing $APP_NAME..."

mkdir -p "${HOME}/.local/bin"
cp "$APPIMAGE_SRC" "$APPIMAGE_DST"
chmod +x "$APPIMAGE_DST"

mkdir -p "${HOME}/.local/share/icons"
cp "$ICON_SRC" "$ICON_DST"

mkdir -p "${HOME}/.local/share/applications"
cp "$DESKTOP_SRC" "$DESKTOP_DST"

# Update .desktop file with correct paths
sed -i "s|Exec=.*|Exec=${APPIMAGE_DST}|" "$DESKTOP_DST"
sed -i "s|Icon=.*|Icon=${ICON_DST}|" "$DESKTOP_DST"

echo "==> Updating application database..."
update-desktop-database "${HOME}/.local/share/applications/" 2>/dev/null || true

echo ""
echo "Done! Digital Cocoon is installed."
echo "  - AppImage: $APPIMAGE_DST"
echo "  - Launch from your app menu as 'Digital Cocoon'"
echo ""
echo "To uninstall:"
echo "  rm -f \"$APPIMAGE_DST\" \"$ICON_DST\" \"$DESKTOP_DST\""
