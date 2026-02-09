const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Notes operations
    getNotes: () => ipcRenderer.invoke('get-notes'),
    addNote: (noteData) => ipcRenderer.invoke('add-note', noteData),
    deleteNote: (id) => ipcRenderer.invoke('delete-note', id),
    updateNote: (id, updates) => ipcRenderer.invoke('update-note', id, updates),

    // Tasks operations
    getTasks: () => ipcRenderer.invoke('get-tasks'),
    addTask: (taskData) => ipcRenderer.invoke('add-task', taskData),
    deleteTask: (id) => ipcRenderer.invoke('delete-task', id),
    updateTask: (id, updates) => ipcRenderer.invoke('update-task', id, updates),

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

    // File Manager
    getFolders: (parentId) => ipcRenderer.invoke('get-folders', parentId),
    getFiles: (folderId) => ipcRenderer.invoke('get-files', folderId),
    createFolder: (name, parentId) => ipcRenderer.invoke('create-folder', name, parentId),
    addFile: (fileData) => ipcRenderer.invoke('add-file', fileData),
    deleteFolder: (id) => ipcRenderer.invoke('delete-folder', id),
    deleteFile: (id) => ipcRenderer.invoke('delete-file', id),
    renameFolder: (id, newName) => ipcRenderer.invoke('rename-folder', id, newName),
    renameFile: (id, newName) => ipcRenderer.invoke('rename-file', id, newName),
    moveFile: (id, targetFolderId) => ipcRenderer.invoke('move-file', id, targetFolderId),
    openFile: (path) => ipcRenderer.invoke('open-file', path),
    revealFile: (path) => ipcRenderer.invoke('reveal-file', path),
    selectFile: () => ipcRenderer.invoke('select-file'),
    startDrag: (path) => ipcRenderer.send('ondragstart', path),

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
