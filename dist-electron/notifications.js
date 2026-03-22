"use strict";
const { Notification, app } = require("electron");
const { getNoteById, getDueTasks, getDueNotes, clearTaskReminder, clearNoteReminder, updateTask } = require("./db");
const path = require("path");
const fs = require("fs");
let notificationCheckInterval;
let scheduledTimeouts = {};
let lastCheckTime = 0;
let _mainWindow = null;
function log(msg) {
  try {
    const logPath = path.join(app.getPath("userData"), "juno-notifications.log");
    const timestamp = (/* @__PURE__ */ new Date()).toLocaleString();
    const line = `[${timestamp}] ${msg}
`;
    fs.appendFileSync(logPath, line);
  } catch (e) {
  }
}
function startNotificationScheduler(mainWindow) {
  _mainWindow = mainWindow;
  lastCheckTime = Date.now();
  console.log("🔔 Notification scheduler started");
  log("--- Notification scheduler started ---");
  notificationCheckInterval = setInterval(() => {
    const now = Date.now();
    const elapsed = now - lastCheckTime;
    if (elapsed > 12e4) {
      log(`⚠️ Time gap detected (${Math.round(elapsed / 1e3)}s since last check) — likely resumed from sleep. Re-checking now.`);
    }
    lastCheckTime = now;
    checkDueReminders(_mainWindow);
  }, 3e4);
  checkDueReminders(mainWindow);
}
function checkDueReminders(mainWindow) {
  try {
    const now = Date.now();
    const dueTasks = getDueTasks(now);
    console.log(`🔔 checkDueReminders: found ${dueTasks.length} due task(s), now=${new Date(now).toLocaleString()}`);
    if (dueTasks.length > 0) {
      log(`Found ${dueTasks.length} due task(s)`);
    }
    dueTasks.forEach((task) => {
      log(`Task "${task.title}" (id=${task.id}) is due. isRecurring=${task.isRecurring}, reminderAt=${task.reminderAt}, now=${now}`);
      showNotification({
        id: `task-${task.id}`,
        content: `Task Due: ${task.title}`,
        reminderAt: task.reminderAt
      }, mainWindow);
      if (task.isRecurring) {
        const originalDate = new Date(task.reminderAt);
        const nextDate = new Date(now);
        nextDate.setDate(nextDate.getDate() + 1);
        nextDate.setHours(originalDate.getHours(), originalDate.getMinutes(), originalDate.getSeconds(), 0);
        const nextReminder = nextDate.getTime();
        log(`Rescheduling recurring task "${task.title}" to ${new Date(nextReminder).toLocaleString()}`);
        const result = updateTask(task.id, {
          reminderAt: nextReminder,
          dueDate: nextReminder
        });
        log(`updateTask result: reminderAt=${result.reminderAt}, dueDate=${result.dueDate}`);
      } else {
        const nextReminder = now + 30 * 60 * 1e3;
        log(`Rescheduling non-recurring task "${task.title}" to nag in 30min: ${new Date(nextReminder).toLocaleString()}`);
        updateTask(task.id, { reminderAt: nextReminder });
      }
    });
    if (dueTasks.length > 0 && mainWindow && !mainWindow.isDestroyed()) {
      try {
        mainWindow.webContents.send("tasks-updated");
      } catch (e) {
      }
    }
    const dueNotes = getDueNotes(now);
    dueNotes.forEach((note) => {
      showNotification({
        id: `note-${note.id}`,
        content: `Note: ${note.content}`,
        reminderAt: note.reminderAt
      }, mainWindow);
      clearNoteReminder(note.id);
    });
  } catch (err) {
    log(`ERROR in checkDueReminders: ${err.message}
${err.stack}`);
    console.error("Error checking due reminders:", err);
  }
}
function scheduleNotification(note, mainWindow) {
  if (!note.reminderAt) return;
  cancelNotification(note.id);
  const reminderTime = note.reminderAt;
  const now = Date.now();
  const delay = reminderTime - now;
  if (delay <= 0) {
    showNotification(note, mainWindow);
  } else {
    const timeoutId = setTimeout(() => {
      delete scheduledTimeouts[note.id];
      showNotification(note, mainWindow);
    }, delay);
    scheduledTimeouts[note.id] = timeoutId;
    log(`Scheduled notification for "${note.content}" in ${Math.round(delay / 1e3)}s`);
  }
}
function cancelNotification(id) {
  if (scheduledTimeouts[id]) {
    clearTimeout(scheduledTimeouts[id]);
    delete scheduledTimeouts[id];
    log(`Cancelled scheduled notification for id=${id}`);
  }
}
function showNotification(note, mainWindow) {
  try {
    console.log(`🔔 Showing notification: "${note.content}"`);
    const notification = new Notification({
      title: "Juno Reminder",
      body: note.content,
      silent: false,
      urgency: "normal"
    });
    notification.on("click", () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.webContents.send("notification-clicked", note.id);
      }
    });
    notification.show();
    log(`Notification shown: "${note.content}"`);
  } catch (err) {
    log(`ERROR showing notification: ${err.message}`);
  }
}
function stopNotificationScheduler() {
  if (notificationCheckInterval) {
    clearInterval(notificationCheckInterval);
  }
}
module.exports = {
  startNotificationScheduler,
  stopNotificationScheduler,
  scheduleNotification,
  showNotification,
  cancelNotification,
  checkDueReminders
};
