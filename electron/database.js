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

function addNote(noteData) {
    const now = Date.now();
    const stmt = db.prepare(`
    INSERT INTO notes (content, color, pinned, reminder_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
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

    const stmt = db.prepare(`UPDATE notes SET ${fields.join(', ')} WHERE id = ?`);
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

function deleteNote(id) {
    const stmt = db.prepare('DELETE FROM notes WHERE id = ?');
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

module.exports = {
    initDatabase,
    getAllNotes,
    addNote,
    updateNote,
    deleteNote,
    getNoteById,
};
