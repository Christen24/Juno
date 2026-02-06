const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Notes operations
    getNotes: () => ipcRenderer.invoke('get-notes'),
    addNote: (noteData) => ipcRenderer.invoke('add-note', noteData),
    deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
    updateNote: (id, updates) => ipcRenderer.invoke('update-note', id, updates),

    // Window operations
    toggleExpand: (expanded) => ipcRenderer.invoke('toggle-expand', expanded),
    startDrag: () => ipcRenderer.invoke('start-drag'),
    closeApp: () => ipcRenderer.send('close-app'),
    hideWindow: () => ipcRenderer.send('hide-window'),
    quitApp: () => ipcRenderer.send('quit-app'),
    setIgnoreMouseEvents: (ignore) => ipcRenderer.send('set-ignore-mouse-events', ignore),

    // Theme operations
    getTheme: () => ipcRenderer.invoke('get-theme'),
    setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),

    // Window positioning
    setWindowPosition: (x, y) => ipcRenderer.invoke('set-window-position', x, y),
    getWindowPosition: () => ipcRenderer.invoke('get-window-position'),
    snapToEdge: () => ipcRenderer.invoke('snap-to-edge'),
    showContextMenu: () => ipcRenderer.invoke('show-context-menu'),
    finalizeDrag: () => ipcRenderer.invoke('finalize-drag'),

    // Listen to events from main process
    onNotificationClick: (callback) => {
        const subscription = (event, noteId) => callback(noteId);
        ipcRenderer.on('notification-clicked', subscription);
        return () => ipcRenderer.removeListener('notification-clicked', subscription);
    },
    onToggleFromTray: (callback) => {
        const subscription = () => callback();
        ipcRenderer.on('toggle-from-tray', subscription);
        return () => ipcRenderer.removeListener('toggle-from-tray', subscription);
    },
});
