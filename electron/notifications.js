const { Notification } = require('electron');
const { getNoteById } = require('./database');

let notificationCheckInterval;

function startNotificationScheduler(mainWindow) {
    // Check for due reminders every minute
    notificationCheckInterval = setInterval(() => {
        checkDueReminders(mainWindow);
    }, 60000); // 60 seconds

    // Also check immediately on startup
    checkDueReminders(mainWindow);
}

function checkDueReminders(mainWindow) {
    // This would query the database for notes with reminder_at <= now
    // For now, we'll implement the basic structure
    // The actual implementation will be enhanced when we have the full database system
}

function scheduleNotification(note, mainWindow) {
    if (!note.reminderAt) return;

    const reminderTime = note.reminderAt;
    const now = Date.now();
    const delay = reminderTime - now;

    if (delay <= 0) {
        // Reminder time has passed, show immediately
        showNotification(note, mainWindow);
    } else {
        // Schedule for future
        setTimeout(() => {
            showNotification(note, mainWindow);
        }, delay);
    }
}

function showNotification(note, mainWindow) {
    const notification = new Notification({
        title: 'Reminder',
        body: note.content,
        silent: false,
        urgency: 'normal',
    });

    notification.on('click', () => {
        // Show the window and focus on the note
        if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send('notification-clicked', note.id);
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
    showNotification,
};
