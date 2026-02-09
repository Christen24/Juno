const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db;

function initDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'notes.db');
    db = new Database(dbPath);

    // Create notes table
    db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      color TEXT DEFAULT '#0ea5e9',
      pinned INTEGER DEFAULT 0,
      reminder_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

    // Create tasks table
    db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT DEFAULT 'medium',
      due_date INTEGER,
      completed INTEGER DEFAULT 0,
      reminder_at INTEGER,
      created_at INTEGER,
      updated_at INTEGER
    )
  `);

    // Create folders table
    db.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `);

    // Create files table
    db.exec(`
    CREATE TABLE IF NOT EXISTS files (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      original_path TEXT NOT NULL,
      stored_path TEXT,
      file_type TEXT,
      size INTEGER,
      folder_id INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY(folder_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `);

    // Enable foreign keys
    db.pragma('foreign_keys = ON');

    console.log('Database initialized at:', dbPath);
}

function getAllNotes() {
    const stmt = db.prepare('SELECT * FROM notes ORDER BY pinned DESC, created_at DESC');
    const notes = stmt.all();

    return notes.map(note => ({
        id: note.id,
        content: note.content,
        color: note.color,
        pinned: Boolean(note.pinned),
        reminderAt: note.reminder_at,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }));
}

function getAllTasks() {
    const stmt = db.prepare('SELECT * FROM tasks ORDER BY completed ASC, due_date ASC, priority DESC');
    const tasks = stmt.all();

    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        completed: Boolean(task.completed),
        reminderAt: task.reminder_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
    }));
}

function addNote(noteData) {
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT INTO notes(content, color, pinned, reminder_at, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?)
            `);

    const info = stmt.run(
        noteData.content,
        noteData.color || '#0ea5e9',
        noteData.pinned ? 1 : 0,
        noteData.reminderAt || null,
        now,
        now
    );

    return {
        id: info.lastInsertRowid,
        content: noteData.content,
        color: noteData.color || '#0ea5e9',
        pinned: Boolean(noteData.pinned),
        reminderAt: noteData.reminderAt || null,
        createdAt: now,
        updatedAt: now,
    };
}

function addTask(taskData) {
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT INTO tasks(title, description, priority, due_date, completed, reminder_at, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            `);

    const info = stmt.run(
        taskData.title,
        taskData.description || '',
        taskData.priority || 'medium',
        taskData.dueDate || null,
        0, // Not completed by default
        taskData.reminderAt || null,
        now,
        now
    );

    return {
        id: info.lastInsertRowid,
        title: taskData.title,
        description: taskData.description || '',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || null,
        completed: false,
        reminderAt: taskData.reminderAt || null,
        createdAt: now,
        updatedAt: now,
    };
}

function updateNote(id, updates) {
    const fields = [];
    const values = [];

    if (updates.content !== undefined) {
        fields.push('content = ?');
        values.push(updates.content);
    }
    if (updates.color !== undefined) {
        fields.push('color = ?');
        values.push(updates.color);
    }
    if (updates.pinned !== undefined) {
        fields.push('pinned = ?');
        values.push(updates.pinned ? 1 : 0);
    }
    if (updates.reminderAt !== undefined) {
        fields.push('reminder_at = ?');
        values.push(updates.reminderAt);
    }

    fields.push('updated_at = ?');
    values.push(Date.now());

    values.push(id);

    const stmt = db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ? `);
    stmt.run(...values);

    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    return {
        id: note.id,
        content: note.content,
        color: note.color,
        pinned: Boolean(note.pinned),
        reminderAt: note.reminder_at,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    };
}

function updateTask(id, updates) {
    const fields = [];
    const values = [];

    if (updates.title !== undefined) {
        fields.push('title = ?');
        values.push(updates.title);
    }
    if (updates.description !== undefined) {
        fields.push('description = ?');
        values.push(updates.description);
    }
    if (updates.priority !== undefined) {
        fields.push('priority = ?');
        values.push(updates.priority);
    }
    if (updates.dueDate !== undefined) {
        fields.push('due_date = ?');
        values.push(updates.dueDate);
    }
    if (updates.completed !== undefined) {
        fields.push('completed = ?');
        values.push(updates.completed ? 1 : 0);
    }
    if (updates.reminderAt !== undefined) {
        fields.push('reminder_at = ?');
        values.push(updates.reminderAt);
    }

    fields.push('updated_at = ?');
    values.push(Date.now());

    values.push(id);

    const stmt = db.prepare(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? `);
    stmt.run(...values);

    const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
    return {
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        completed: Boolean(task.completed),
        reminderAt: task.reminder_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
    };
}

function deleteNote(id) {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
    stmt.run(id);
    return { success: true };
}

function deleteTask(id) {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    stmt.run(id);
    return { success: true };
}

function getNoteById(id) {
    const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
    if (!note) return null;

    return {
        id: note.id,
        content: note.content,
        color: note.color,
        pinned: Boolean(note.pinned),
        reminderAt: note.reminder_at,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    };
}

function getDueTasks(timestamp) {
    const stmt = db.prepare('SELECT * FROM tasks WHERE reminder_at <= ? AND completed = 0');
    const tasks = stmt.all(timestamp);
    return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        priority: task.priority,
        dueDate: task.due_date,
        completed: Boolean(task.completed),
        reminderAt: task.reminder_at,
        createdAt: task.created_at,
        updatedAt: task.updated_at,
    }));
}

function getDueNotes(timestamp) {
    const stmt = db.prepare('SELECT * FROM notes WHERE reminder_at <= ?');
    const notes = stmt.all(timestamp);
    return notes.map(note => ({
        id: note.id,
        content: note.content,
        color: note.color,
        pinned: Boolean(note.pinned),
        reminderAt: note.reminder_at,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
    }));
}

function clearTaskReminder(id) {
    const stmt = db.prepare('UPDATE tasks SET reminder_at = NULL WHERE id = ?');
    stmt.run(id);
}

function clearNoteReminder(id) {
    const stmt = db.prepare('UPDATE notes SET reminder_at = NULL WHERE id = ?');
    stmt.run(id);
}

module.exports = {
    initDatabase,
    getAllNotes,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
    getAllTasks,
    addTask,
    updateTask,
    addTask,
    updateTask,
    deleteTask,
    getDueTasks,
    getDueNotes,
    clearTaskReminder,
    clearTaskReminder,
    clearNoteReminder,

    // File Manager
    getFolders: (parentId) => {
        // Handle root (null) vs folder
        const query = parentId ? 'SELECT * FROM folders WHERE parent_id = ?' : 'SELECT * FROM folders WHERE parent_id IS NULL';
        const stmt = db.prepare(query);
        const args = parentId ? [parentId] : [];
        return stmt.all(...args).map(f => ({
            id: f.id,
            name: f.name,
            parentId: f.parent_id,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        }));
    },
    getFiles: (folderId) => {
        const query = folderId ? 'SELECT * FROM files WHERE folder_id = ?' : 'SELECT * FROM files WHERE folder_id IS NULL';
        const stmt = db.prepare(query);
        const args = folderId ? [folderId] : [];
        return stmt.all(...args).map(f => ({
            id: f.id,
            name: f.name,
            originalPath: f.original_path,
            storedPath: f.stored_path,
            fileType: f.file_type,
            size: f.size,
            folderId: f.folder_id,
            createdAt: f.created_at,
            updatedAt: f.updated_at
        }));
    },
    createFolder: (name, parentId) => {
        const now = Date.now();
        const stmt = db.prepare('INSERT INTO folders (name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?)');
        const info = stmt.run(name, parentId || null, now, now);
        return { id: info.lastInsertRowid, name, parentId, createdAt: now, updatedAt: now };
    },
    addFile: (fileData) => {
        const now = Date.now();
        const stmt = db.prepare(`
            INSERT INTO files (name, original_path, stored_path, file_type, size, folder_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        const info = stmt.run(
            fileData.name,
            fileData.originalPath,
            fileData.storedPath || null,
            fileData.fileType,
            fileData.size,
            fileData.folderId || null,
            now, now
        );
        return { id: info.lastInsertRowid, ...fileData, createdAt: now, updatedAt: now };
    },
    deleteFolder: (id) => {
        db.prepare('DELETE FROM folders WHERE id = ?').run(id);
        return { success: true };
    },
    deleteFile: (id) => {
        db.prepare('DELETE FROM files WHERE id = ?').run(id);
        return { success: true };
    },
    renameFolder: (id, newName) => {
        db.prepare('UPDATE folders SET name = ?, updated_at = ? WHERE id = ?').run(newName, Date.now(), id);
        return { success: true };
    },
    renameFile: (id, newName) => {
        db.prepare('UPDATE files SET name = ?, updated_at = ? WHERE id = ?').run(newName, Date.now(), id);
        return { success: true };
    },
    moveFile: (id, targetFolderId) => {
        db.prepare('UPDATE files SET folder_id = ?, updated_at = ? WHERE id = ?').run(targetFolderId || null, Date.now(), id);
        return { success: true };
    }
};
