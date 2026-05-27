# Digital Cocoon

A layered audio/video web app — YouTube video + music + ambient sound layers, scene management, resource library, glassmorphic UI, and 8 color themes.

Built with React + Vite (frontend) and Node.js/Express + yt-dlp (backend).

## Features

- **3 layers**: Visual (YouTube IFrame), Melodic (music), Atmospheric (ambient) — each with independent play/pause toggle and volume slider
- **Master volume**: Always-visible slider under the player, scales all 3 layers simultaneously, with Pause All button
- **Scenes**: Save/load named scenes with per-layer resources
- **Resources**: Add YouTube links, direct audio URLs, or local files; filter by category (visual/melodic/atmospheric)
- **Vinyl mode**: Replace video with a spinning vinyl record animation — toggle in Theme settings
- **Zen mode**: Fullscreen focused player view
- **8 themes**: Light, Warm, Dark, Black, Claude, Claw, Opencode, Coffee — switch via 🎨 button (bottom-left)
- **Custom backgrounds**: Color picker, image URL, or animated backgrounds (Gradient Drift, Aurora, Floating Particles)

## Quick Start

```sh
# frontend only (YouTube video + direct MP3s work)
npm install
npm run dev

# full stack with YouTube audio extraction
npm run start:server   # in one terminal
npm run dev            # in another
# or
npm start              # runs both via concurrently
```

Open http://localhost:5173

## Desktop Apps

### Linux & Windows (Electron)

```sh
# development mode (requires Vite dev server running)
npm run electron:dev

# build standalone packages
npm run electron:build:linux   # produces .AppImage + .deb in release/
npm run electron:build:win     # produces .exe installer in release/
npm run electron:build:all     # both platforms
```

### KDE Plasma 6 Widget

The `plasmoid/` directory contains a widget that embeds the app via WebEngineView.

```sh
# install the widget
cd plasmoid
make install

# remove
make remove
```

Add "Digital Cocoon" to your panel/desktop. Configure the URL in widget settings if you changed the port.

**Requires**: `qtwebengine`, `kpackagetool6` (from `plasma-sdk` or `kde-cli-tools`)

## Backend (YouTube Audio Extraction)

The backend uses yt-dlp to extract audio from YouTube URLs for the melodic and atmospheric layers.

```sh
cd server
npm install
npm start   # runs on port 3001
```

The app works without the backend — direct MP3 resources and YouTube video layer still produce sound. A warning banner appears when the backend is unavailable.

## Project Structure

```
├── electron/
│   ├── main.js              # Electron main process
│   └── preload.js           # Context bridge
├── plasmoid/
│   ├── metadata.json        # KDE widget metadata
│   ├── Makefile             # Install/remove targets
│   └── contents/
│       ├── ui/main.qml      # Widget UI (WebEngineView)
│       └── config/          # Widget configuration
├── server/
│   └── services/ytdlp.js    # yt-dlp format strategies
├── src/
│   ├── components/          # React components
│   ├── hooks/               # Custom hooks
│   ├── styles/              # CSS modules + global theme vars
│   ├── utils/               # Helpers (youtube ID extraction, audio context)
│   └── constants/defaults.js # Default scenes + resources
└── package.json             # Scripts + electron-builder config
```

## Tech Stack

- **Frontend**: React 19, Vite 8, CSS Modules, Web Audio API
- **YouTube**: IFrame Player API (client-side)
- **HLS**: hls.js (lazy-loaded for live audio streams)
- **Desktop**: Electron + electron-builder
- **Widget**: Qt6 QML / Kirigami / Plasma 6
- **Backend** (optional): Express, yt-dlp

## Configuration

All state persists in `localStorage`:

| Key | Default | Description |
|-----|---------|-------------|
| `cocoon_scenes` | — | Saved scenes |
| `cocoon_resources` | — | Saved resources |
| `cocoon_theme` | `light` | Active theme |
| `cocoon_bgType` | — | Custom background type |
| `cocoon_bgValue` | — | Custom background value |
| `cocoon_showVinyl` | `false` | Vinyl mode toggle |
| `cocoon_showMusicName` | `false` | Show music name on vinyl |

Default scenes auto-load on first visit.
