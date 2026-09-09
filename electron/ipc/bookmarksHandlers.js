const { ipcMain } = require("electron");
const bookmarksStore = require("../bookmarks/bookmarksStore");

function setupBookmarksHandlers() {
    ipcMain.handle("bookmarks:get-all", () => {
        return bookmarksStore.getAll();
    });

    ipcMain.handle("bookmarks:create", (event, bookmark) => {
        return bookmarksStore.create(bookmark);
    });

    ipcMain.handle("bookmarks:update", (event, id, data) => {
        return bookmarksStore.update(id, data);
    });

    ipcMain.handle("bookmarks:delete", (event, id) => {
        return bookmarksStore.remove(id);
    });

    ipcMain.handle("bookmarks:import", (event, data) => {
        return bookmarksStore.importBookmarks(data);
    });

    ipcMain.handle("bookmarks:export", () => {
        return bookmarksStore.exportAll();
    });
}

module.exports = { setupBookmarksHandlers };
