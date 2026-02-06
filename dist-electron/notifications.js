"use strict";
const { Notification } = require("electron");
const { getNoteById } = require("./database");
let notificationCheckInterval;
function startNotificationScheduler(mainWindow) {
  notificationCheckInterval = setInterval(() => {
  }, 6e4);
}
function scheduleNotification(note, mainWindow) {
  if (!note.reminderAt) return;
  const reminderTime = note.reminderAt;
  const now = Date.now();
  const delay = reminderTime - now;
  if (delay <= 0) {
    showNotification(note, mainWindow);
  } else {
    setTimeout(() => {
      showNotification(note, mainWindow);
    }, delay);
  }
}
function showNotification(note, mainWindow) {
  const notification = new Notification({
    title: "Reminder",
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
  showNotification
};
