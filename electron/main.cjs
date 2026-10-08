const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const isDev = !app.isPackaged && process.env.NODE_ENV === 'development';

let mainWindow;
let savedBounds = null;

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
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error(`Failed to load index.html (${errorCode}): ${errorDescription}`);
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

app.whenReady().then(() => {
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
