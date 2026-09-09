const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const BOOKMARKS_FILE = path.join(app.getPath("userData"), "bookmarks.json");

function ensureFile() {
    if (!fs.existsSync(BOOKMARKS_FILE)) {
        fs.writeFileSync(BOOKMARKS_FILE, "[]", "utf-8");
    }
}

function readAll() {
    ensureFile();
    try {
        const data = fs.readFileSync(BOOKMARKS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeAll(bookmarks) {
    ensureFile();
    fs.writeFileSync(BOOKMARKS_FILE, JSON.stringify(bookmarks, null, 2), "utf-8");
}

function getAll() {
    return readAll();
}

function create(bookmark) {
    const bookmarks = readAll();
    const newBookmark = {
        id: crypto.randomUUID(),
        url: bookmark.url || "",
        title: bookmark.title || "",
        description: bookmark.description || "",
        category: bookmark.category || "general",
        tags: bookmark.tags || [],
        favicon: bookmark.favicon || undefined,
        createdAt: new Date().toISOString(),
    };
    bookmarks.push(newBookmark);
    writeAll(bookmarks);
    return newBookmark;
}

function update(id, data) {
    const bookmarks = readAll();
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return null;
    bookmarks[index] = { ...bookmarks[index], ...data, id: bookmarks[index].id };
    writeAll(bookmarks);
    return bookmarks[index];
}

function remove(id) {
    const bookmarks = readAll();
    const index = bookmarks.findIndex((b) => b.id === id);
    if (index === -1) return false;
    bookmarks.splice(index, 1);
    writeAll(bookmarks);
    return true;
}

function importBookmarks(data) {
    if (!Array.isArray(data)) return [];
    const bookmarks = readAll();
    const imported = data.map((item) => ({
        id: crypto.randomUUID(),
        url: item.url || "",
        title: item.title || "",
        description: item.description || "",
        category: item.category || "general",
        tags: item.tags || [],
        favicon: item.favicon || undefined,
        createdAt: item.createdAt || new Date().toISOString(),
    }));
    bookmarks.push(...imported);
    writeAll(bookmarks);
    return imported;
}

function exportAll() {
    return readAll();
}

module.exports = { getAll, create, update, remove, importBookmarks, exportAll };
