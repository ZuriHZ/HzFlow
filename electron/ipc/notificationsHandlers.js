const { ipcMain, Notification } = require("electron");

function setupNotificationsHandlers() {
    ipcMain.handle("notifications:send", (event, title, body) => {
        if (!Notification.isSupported()) return { sent: false, reason: "not_supported" };
        const notification = new Notification({ title, body });
        notification.show();
        return { sent: true };
    });

    ipcMain.handle("notifications:request-permission", () => {
        if (!Notification.isSupported()) return "not_supported";
        return Notification.permission;
    });
}

module.exports = { setupNotificationsHandlers };
