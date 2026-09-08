const { ipcMain } = require("electron");
const notesStore = require("../notes/notesStore");

function setupNotesHandlers() {
    ipcMain.handle("notes:get-all", () => {
        return notesStore.getAll();
    });

    ipcMain.handle("notes:get-by-id", (event, id) => {
        return notesStore.getById(id);
    });

    ipcMain.handle("notes:create", (event, note) => {
        return notesStore.create(note);
    });

    ipcMain.handle("notes:update", (event, id, data) => {
        return notesStore.update(id, data);
    });

    ipcMain.handle("notes:delete", (event, id) => {
        return notesStore.remove(id);
    });

    ipcMain.handle("notes:search", (event, query) => {
        return notesStore.search(query);
    });
}

module.exports = { setupNotesHandlers };
