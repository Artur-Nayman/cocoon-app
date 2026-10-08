const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const isDev = !app.isPackaged;

let mainWindow;
let savedBounds = null;
let appOrigin = 'http://localhost:3000';

// Start the bundled Express server (serves dist + /api) on an OS-assigned port.
async function startBackend() {
  process.env.NODE_ENV = 'production';
  process.env.PORT = '0';
  if (app.isPackaged) {
    process.env.YT_DLP_PATH = path.join(
      process.resourcesPath,
      process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp'
    );
  }
  const { startServer } = await import(pathToFileURL(path.join(__dirname, '../server.js')).href);
  const server = await startServer();
  return server.address().port;
}

// YouTube's IFrame API rejects embeds whose requests carry no Referer (Error 153).
function installRefererFix() {
  session.defaultSession.webRequest.onBeforeSendHeaders(
    { urls: ['*://*.youtube.com/*', '*://*.youtube-nocookie.com/*'] },
    (details, callback) => {
      if (!details.requestHeaders.Referer) {
        details.requestHeaders.Referer = `${appOrigin}/`;
      }
      callback({ requestHeaders: details.requestHeaders });
    }
  );
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    }
  });

  if (isDev) {
    appOrigin = process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000';
    mainWindow.loadURL(appOrigin);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadURL(appOrigin);
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Failed to load ${appOrigin} (${errorCode}): ${errorDescription}`);
  });

  mainWindow.on('maximize', () => {
    mainWindow?.webContents.send('window-maximized-change', true);
  });

  mainWindow.on('unmaximize', () => {
    mainWindow?.webContents.send('window-maximized-change', false);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

ipcMain.on('window-minimize', () => {
  mainWindow?.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.on('window-close', () => {
  mainWindow?.close();
});

ipcMain.on('window-resize', (_event, { width, height }) => {
  if (mainWindow && typeof width === 'number' && typeof height === 'number') {
    mainWindow.setSize(Math.round(width), Math.round(height));
  }
});

ipcMain.on('window-save-size', () => {
  if (mainWindow) {
    savedBounds = mainWindow.getBounds();
  }
});

ipcMain.on('window-restore-size', () => {
  if (mainWindow && savedBounds) {
    mainWindow.setBounds(savedBounds);
  }
});

ipcMain.on('window-set-always-on-top', (_event, flag) => {
  mainWindow?.setAlwaysOnTop(Boolean(flag));
});

app.whenReady().then(async () => {
  if (!isDev) {
    const port = await startBackend();
    appOrigin = `http://127.0.0.1:${port}`;
  }
  installRefererFix();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
