"use strict";const p=require("better-sqlite3"),c=require("path"),{app:u}=require("electron");let d;function l(){const e=c.join(u.getPath("userData"),"notes.db");d=new p(e),d.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL,
      color TEXT DEFAULT '#0ea5e9',
      pinned INTEGER DEFAULT 0,
      reminder_at INTEGER,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `),d.exec(`
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
  `),d.exec(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER,
      created_at INTEGER,
      updated_at INTEGER,
      FOREIGN KEY(parent_id) REFERENCES folders(id) ON DELETE CASCADE
    )
  `),d.exec(`
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
  `),d.pragma("foreign_keys = ON"),console.log("Database initialized at:",e)}function T(){return d.prepare("SELECT * FROM notes ORDER BY pinned DESC, created_at DESC").all().map(r=>({id:r.id,content:r.content,color:r.color,pinned:!!r.pinned,reminderAt:r.reminder_at,createdAt:r.created_at,updatedAt:r.updated_at}))}function m(){return d.prepare("SELECT * FROM tasks ORDER BY completed ASC, due_date ASC, priority DESC").all().map(r=>({id:r.id,title:r.title,description:r.description,priority:r.priority,dueDate:r.due_date,completed:!!r.completed,reminderAt:r.reminder_at,createdAt:r.created_at,updatedAt:r.updated_at}))}function R(e){const t=Date.now();return{id:d.prepare(`
    INSERT INTO notes(content, color, pinned, reminder_at, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?)
            `).run(e.content,e.color||"#0ea5e9",e.pinned?1:0,e.reminderAt||null,t,t).lastInsertRowid,content:e.content,color:e.color||"#0ea5e9",pinned:!!e.pinned,reminderAt:e.reminderAt||null,createdAt:t,updatedAt:t}}function E(e){const t=Date.now();return{id:d.prepare(`
    INSERT INTO tasks(title, description, priority, due_date, completed, reminder_at, created_at, updated_at)
    VALUES(?, ?, ?, ?, ?, ?, ?, ?)
            `).run(e.title,e.description||"",e.priority||"medium",e.dueDate||null,0,e.reminderAt||null,t,t).lastInsertRowid,title:e.title,description:e.description||"",priority:e.priority||"medium",dueDate:e.dueDate||null,completed:!1,reminderAt:e.reminderAt||null,createdAt:t,updatedAt:t}}function _(e,t){const r=[],n=[];t.content!==void 0&&(r.push("content = ?"),n.push(t.content)),t.color!==void 0&&(r.push("color = ?"),n.push(t.color)),t.pinned!==void 0&&(r.push("pinned = ?"),n.push(t.pinned?1:0)),t.reminderAt!==void 0&&(r.push("reminder_at = ?"),n.push(t.reminderAt)),r.push("updated_at = ?"),n.push(Date.now()),n.push(e),d.prepare(`UPDATE notes SET ${r.join(", ")} WHERE id = ? `).run(...n);const o=d.prepare("SELECT * FROM notes WHERE id = ?").get(e);return{id:o.id,content:o.content,color:o.color,pinned:!!o.pinned,reminderAt:o.reminder_at,createdAt:o.created_at,updatedAt:o.updated_at}}function a(e,t){const r=[],n=[];t.title!==void 0&&(r.push("title = ?"),n.push(t.title)),t.description!==void 0&&(r.push("description = ?"),n.push(t.description)),t.priority!==void 0&&(r.push("priority = ?"),n.push(t.priority)),t.dueDate!==void 0&&(r.push("due_date = ?"),n.push(t.dueDate)),t.completed!==void 0&&(r.push("completed = ?"),n.push(t.completed?1:0)),t.reminderAt!==void 0&&(r.push("reminder_at = ?"),n.push(t.reminderAt)),r.push("updated_at = ?"),n.push(Date.now()),n.push(e),d.prepare(`UPDATE tasks SET ${r.join(", ")} WHERE id = ? `).run(...n);const o=d.prepare("SELECT * FROM tasks WHERE id = ?").get(e);return{id:o.id,title:o.title,description:o.description,priority:o.priority,dueDate:o.due_date,completed:!!o.completed,reminderAt:o.reminder_at,createdAt:o.created_at,updatedAt:o.updated_at}}function A(e){return d.prepare("DELETE FROM notes WHERE id = ?").run(e),{success:!0}}function N(e){return d.prepare("DELETE FROM tasks WHERE id = ?").run(e),{success:!0}}function f(e){const t=d.prepare("SELECT * FROM notes WHERE id = ?").get(e);return t?{id:t.id,content:t.content,color:t.color,pinned:!!t.pinned,reminderAt:t.reminder_at,createdAt:t.created_at,updatedAt:t.updated_at}:null}function I(e){return d.prepare("SELECT * FROM tasks WHERE reminder_at <= ? AND completed = 0").all(e).map(n=>({id:n.id,title:n.title,description:n.description,priority:n.priority,dueDate:n.due_date,completed:!!n.completed,reminderAt:n.reminder_at,createdAt:n.created_at,updatedAt:n.updated_at}))}function L(e){return d.prepare("SELECT * FROM notes WHERE reminder_at <= ?").all(e).map(n=>({id:n.id,content:n.content,color:n.color,pinned:!!n.pinned,reminderAt:n.reminder_at,createdAt:n.created_at,updatedAt:n.updated_at}))}function s(e){d.prepare("UPDATE tasks SET reminder_at = NULL WHERE id = ?").run(e)}function S(e){d.prepare("UPDATE notes SET reminder_at = NULL WHERE id = ?").run(e)}module.exports={initDatabase:l,getAllNotes:T,addNote:R,updateNote:_,deleteNote:A,getNoteById:f,getAllTasks:m,addTask:E,updateTask:a,addTask:E,updateTask:a,deleteTask:N,getDueTasks:I,getDueNotes:L,clearTaskReminder:s,clearTaskReminder:s,clearNoteReminder:S,getFolders:e=>{const t=e?"SELECT * FROM folders WHERE parent_id = ?":"SELECT * FROM folders WHERE parent_id IS NULL",r=d.prepare(t),n=e?[e]:[];return r.all(...n).map(i=>({id:i.id,name:i.name,parentId:i.parent_id,createdAt:i.created_at,updatedAt:i.updated_at}))},getFiles:e=>{const t=e?"SELECT * FROM files WHERE folder_id = ?":"SELECT * FROM files WHERE folder_id IS NULL",r=d.prepare(t),n=e?[e]:[];return r.all(...n).map(i=>({id:i.id,name:i.name,originalPath:i.original_path,storedPath:i.stored_path,fileType:i.file_type,size:i.size,folderId:i.folder_id,createdAt:i.created_at,updatedAt:i.updated_at}))},createFolder:(e,t)=>{const r=Date.now();return{id:d.prepare("INSERT INTO folders (name, parent_id, created_at, updated_at) VALUES (?, ?, ?, ?)").run(e,t||null,r,r).lastInsertRowid,name:e,parentId:t,createdAt:r,updatedAt:r}},addFile:e=>{const t=Date.now();return{id:d.prepare(`
            INSERT INTO files (name, original_path, stored_path, file_type, size, folder_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(e.name,e.originalPath,e.storedPath||null,e.fileType,e.size,e.folderId||null,t,t).lastInsertRowid,...e,createdAt:t,updatedAt:t}},deleteFolder:e=>(d.prepare("DELETE FROM folders WHERE id = ?").run(e),{success:!0}),deleteFile:e=>(d.prepare("DELETE FROM files WHERE id = ?").run(e),{success:!0}),renameFolder:(e,t)=>(d.prepare("UPDATE folders SET name = ?, updated_at = ? WHERE id = ?").run(t,Date.now(),e),{success:!0}),renameFile:(e,t)=>(d.prepare("UPDATE files SET name = ?, updated_at = ? WHERE id = ?").run(t,Date.now(),e),{success:!0}),moveFile:(e,t)=>(d.prepare("UPDATE files SET folder_id = ?, updated_at = ? WHERE id = ?").run(t||null,Date.now(),e),{success:!0})};
