#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
exec "$DIR/release/Digital Cocoon-1.0.0.AppImage" --no-sandbox --disable-gpu "$@"
