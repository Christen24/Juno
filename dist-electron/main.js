"use strict";
const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut, screen, nativeImage } = require("electron");
const path = require("path");
const Store = require("electron-store");
const { initDatabase, getAllNotes, addNote, deleteNote, updateNote } = require("./database");
const { scheduleNotification, cancelNotification, startNotificationScheduler } = require("./notifications");
const store = new Store();
let mainWindow;
let tray = null;
let isExpanded = false;
const COLLAPSED_SIZE = 80;
const EXPANDED_WIDTH = 400;
const EXPANDED_HEIGHT = 600;
if (process.platform === "win32") {
  app.setAppUserModelId("com.juno.app");
}
function createWindow() {
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const defaultX = screenWidth - COLLAPSED_SIZE - 20;
  const defaultY = screenHeight - COLLAPSED_SIZE - 20;
  store.get("windowX", defaultX);
  store.get("windowY", defaultY);
  mainWindow = new BrowserWindow({
    width: COLLAPSED_SIZE,
    height: COLLAPSED_SIZE,
    icon: path.join(__dirname, "../ball-icon.png"),
    // Set app icon matches tray
    frame: false,
    transparent: true,
    backgroundColor: "#00000000",
    // Explicitly fully transparent
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env.NODE_ENV === "development" || !app.isPackaged) {
    mainWindow.loadURL("http://localhost:5173").catch((err) => {
      console.error("Failed to load URL:", err);
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html")).catch((err) => {
      console.error("Failed to load file:", err);
    });
  }
  mainWindow.show();
  mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  mainWindow.on("minimize", (event) => {
    event.preventDefault();
  });
  mainWindow.on("moved", () => {
    const [x, y] = mainWindow.getPosition();
    store.set("windowX", x);
    store.set("windowY", y);
  });
  mainWindow.setAlwaysOnTop(true, "screen-saver");
  mainWindow.webContents.on("did-finish-load", () => {
    console.log("Window loaded successfully!");
  });
  mainWindow.webContents.on("did-fail-load", (event, errorCode, errorDescription) => {
    console.error("Failed to load:", errorCode, errorDescription);
  });
  mainWindow.on("moved", () => {
    if (isExpanded && mainWindow) {
      const [currentX, currentY] = mainWindow.getPosition();
      const [windowWidth, windowHeight] = mainWindow.getSize();
      const { width: screenWidth2, height: screenHeight2 } = screen.getPrimaryDisplay().workAreaSize;
      const minX = -(windowWidth / 2);
      const minY = 0;
      const maxX = screenWidth2 - windowWidth / 2;
      const maxY = screenHeight2 - windowHeight / 2;
      let newX = currentX;
      let newY = currentY;
      let needsCorrection = false;
      if (currentX < minX) {
        newX = minX;
        needsCorrection = true;
      }
      if (currentX > maxX) {
        newX = maxX;
        needsCorrection = true;
      }
      if (currentY < minY) {
        newY = minY;
        needsCorrection = true;
      }
      if (currentY > maxY) {
        newY = maxY;
        needsCorrection = true;
      }
      if (needsCorrection) {
        mainWindow.setPosition(Math.round(newX), Math.round(newY));
      }
    }
  });
}
function createTray() {
  const iconPath = path.join(__dirname, "../ball-icon.png");
  const icon = nativeImage.createFromPath(iconPath).resize({ width: 32, height: 32 });
  tray = new Tray(icon);
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Show/Hide",
      click: () => {
        if (mainWindow) {
          if (mainWindow.isVisible()) {
            mainWindow.hide();
          } else {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      }
    },
    {
      label: "Toggle Expand",
      click: () => {
        if (mainWindow && mainWindow.isVisible()) {
          mainWindow.webContents.send("toggle-from-tray");
        }
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  tray.setToolTip("Juno");
  tray.setContextMenu(contextMenu);
  tray.on("double-click", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
}
function registerHotkeys() {
  const ret = globalShortcut.register("CommandOrControl+Shift+N", () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  if (!ret) {
    console.log("Registration failed");
  }
}
app.whenReady().then(() => {
  initDatabase();
  createTray();
  createWindow();
  registerHotkeys();
  startNotificationScheduler(mainWindow);
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
ipcMain.handle("get-notes", async () => {
  return getAllNotes();
});
ipcMain.handle("add-note", async (event, noteData) => {
  const note = addNote(noteData);
  if (noteData.reminderAt) {
    scheduleNotification(note, mainWindow);
  }
  return note;
});
ipcMain.handle("delete-note", async (event, id) => {
  return deleteNote(id);
});
ipcMain.handle("update-note", async (event, id, updates) => {
  return updateNote(id, updates);
});
ipcMain.handle("toggle-expand", async (event, expanded) => {
  isExpanded = expanded;
  const [currentX, currentY] = mainWindow.getPosition();
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  if (expanded) {
    mainWindow.setResizable(true);
    mainWindow.setMovable(true);
    mainWindow.setMinimumSize(300, 400);
    mainWindow.setMaximumSize(800, 1e3);
    mainWindow.setSize(EXPANDED_WIDTH, EXPANDED_HEIGHT, true);
    const minVisibleX = -200;
    const maxVisibleX = screenWidth - EXPANDED_WIDTH / 2;
    const minVisibleY = 0;
    const maxVisibleY = screenHeight - EXPANDED_HEIGHT / 2;
    const newX = Math.max(minVisibleX, Math.min(maxVisibleX, currentX));
    const newY = Math.max(minVisibleY, Math.min(maxVisibleY, currentY));
    mainWindow.setPosition(Math.round(newX), Math.round(newY));
  } else {
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);
    mainWindow.setMinimumSize(COLLAPSED_SIZE, COLLAPSED_SIZE);
    mainWindow.setMaximumSize(COLLAPSED_SIZE, COLLAPSED_SIZE);
    mainWindow.setSize(COLLAPSED_SIZE, COLLAPSED_SIZE, true);
    setTimeout(async () => {
      if (!isExpanded && mainWindow) {
        const [currentX2, currentY2] = mainWindow.getPosition();
        const [windowWidth, windowHeight] = mainWindow.getSize();
        const centerX = currentX2 + windowWidth / 2;
        const centerY = currentY2 + windowHeight / 2;
        const padding = 20;
        const snapPositions = [
          // Corners
          { x: padding, y: padding },
          { x: screenWidth - windowWidth - padding, y: padding },
          { x: padding, y: screenHeight - windowHeight - padding },
          { x: screenWidth - windowWidth - padding, y: screenHeight - windowHeight - padding },
          // Edges
          { x: padding, y: (screenHeight - windowHeight) / 2 },
          { x: screenWidth - windowWidth - padding, y: (screenHeight - windowHeight) / 2 },
          { x: (screenWidth - windowWidth) / 2, y: padding },
          { x: (screenWidth - windowWidth) / 2, y: screenHeight - windowHeight - padding }
        ];
        let nearestPosition = snapPositions[0];
        let minDistance = Infinity;
        for (const pos of snapPositions) {
          const posCenter = {
            x: pos.x + windowWidth / 2,
            y: pos.y + windowHeight / 2
          };
          const distance = Math.sqrt(
            Math.pow(centerX - posCenter.x, 2) + Math.pow(centerY - posCenter.y, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestPosition = pos;
          }
        }
        mainWindow.setPosition(Math.round(nearestPosition.x), Math.round(nearestPosition.y));
        store.set("windowX", nearestPosition.x);
        store.set("windowY", nearestPosition.y);
      }
    }, 100);
  }
  const [x, y] = mainWindow.getPosition();
  store.set("windowX", x);
  store.set("windowY", y);
  return { expanded };
});
ipcMain.handle("start-drag", async () => {
  return true;
});
ipcMain.handle("get-window-position", async () => {
  if (mainWindow) {
    const [x, y] = mainWindow.getPosition();
    return { x, y };
  }
  return { x: 0, y: 0 };
});
ipcMain.handle("get-theme", async () => {
  return store.get("theme", "dark");
});
ipcMain.handle("set-theme", async (event, theme) => {
  store.set("theme", theme);
  return theme;
});
ipcMain.on("close-app", () => {
  app.quit();
});
ipcMain.on("hide-window", () => {
  if (mainWindow) {
    mainWindow.hide();
  }
});
ipcMain.on("quit-app", () => {
  app.quit();
});
ipcMain.handle("show-context-menu", async () => {
  if (!mainWindow) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Hide",
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
        }
      }
    },
    { type: "separator" },
    {
      label: "Quit",
      click: () => {
        app.quit();
      }
    }
  ]);
  contextMenu.popup({ window: mainWindow });
});
ipcMain.on("set-ignore-mouse-events", (event, ignore) => {
  if (mainWindow) {
    if (ignore) {
      mainWindow.setIgnoreMouseEvents(true, { forward: true });
    } else {
      mainWindow.setIgnoreMouseEvents(false);
    }
  }
});
ipcMain.handle("set-window-position", async (event, x, y) => {
  if (mainWindow && typeof x === "number" && typeof y === "number" && !isNaN(x) && !isNaN(y)) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
    const [windowWidth, windowHeight] = mainWindow.getSize();
    const minX = -(windowWidth / 2);
    const minY = -(windowHeight / 2);
    const maxX = screenWidth - windowWidth / 2;
    const maxY = screenHeight - windowHeight / 2;
    const boundedX = Math.max(minX, Math.min(maxX, Math.round(x)));
    const boundedY = Math.max(minY, Math.min(maxY, Math.round(y)));
    if (!isExpanded) {
      mainWindow.setBounds({
        x: boundedX,
        y: boundedY,
        width: 80,
        height: 80
      });
    } else {
      mainWindow.setPosition(boundedX, boundedY);
    }
  }
});
ipcMain.handle("finalize-drag", async () => {
  if (mainWindow && !isExpanded) {
    mainWindow.setSize(80, 80);
    mainWindow.setResizable(false);
    mainWindow.setMovable(false);
    return true;
  }
  return false;
});
ipcMain.handle("snap-to-edge", async () => {
  if (!mainWindow || isExpanded) {
    return;
  }
  const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize;
  const [currentX, currentY] = mainWindow.getPosition();
  const [windowWidth, windowHeight] = mainWindow.getSize();
  const centerX = currentX + windowWidth / 2;
  const centerY = currentY + windowHeight / 2;
  const padding = 20;
  const snapPositions = [
    // Corners
    { x: padding, y: padding, name: "top-left" },
    { x: screenWidth - windowWidth - padding, y: padding, name: "top-right" },
    { x: padding, y: screenHeight - windowHeight - padding, name: "bottom-left" },
    { x: screenWidth - windowWidth - padding, y: screenHeight - windowHeight - padding, name: "bottom-right" },
    // Edges (middle of each side)
    { x: padding, y: (screenHeight - windowHeight) / 2, name: "left-middle" },
    { x: screenWidth - windowWidth - padding, y: (screenHeight - windowHeight) / 2, name: "right-middle" },
    { x: (screenWidth - windowWidth) / 2, y: padding, name: "top-middle" },
    { x: (screenWidth - windowWidth) / 2, y: screenHeight - windowHeight - padding, name: "bottom-middle" }
  ];
  let nearestPosition = snapPositions[0];
  let minDistance = Infinity;
  for (const pos of snapPositions) {
    const posCenter = {
      x: pos.x + windowWidth / 2,
      y: pos.y + windowHeight / 2
    };
    const distance = Math.sqrt(
      Math.pow(centerX - posCenter.x, 2) + Math.pow(centerY - posCenter.y, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearestPosition = pos;
    }
  }
  mainWindow.setPosition(Math.round(nearestPosition.x), Math.round(nearestPosition.y));
  store.set("windowX", nearestPosition.x);
  store.set("windowY", nearestPosition.y);
  return { x: nearestPosition.x, y: nearestPosition.y, edge: nearestPosition.name };
});
