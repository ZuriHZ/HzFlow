const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const NOTES_FILE = path.join(app.getPath("userData"), "notes.json");

function ensureFile() {
    if (!fs.existsSync(NOTES_FILE)) {
        fs.writeFileSync(NOTES_FILE, "[]", "utf-8");
    }
}

function readAll() {
    ensureFile();
    try {
        const data = fs.readFileSync(NOTES_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeAll(notes) {
    ensureFile();
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2), "utf-8");
}

function getAll() {
    return readAll();
}

function getById(id) {
    return readAll().find((n) => n.id === id) || null;
}

function create(note) {
    const notes = readAll();
    const now = new Date().toISOString();
    const newNote = {
        id: crypto.randomUUID(),
        title: note.title || "Untitled",
        content: note.content || "",
        category: note.category || "general",
        tags: note.tags || [],
        pinned: note.pinned || false,
        createdAt: now,
        updatedAt: now,
    };
    notes.push(newNote);
    writeAll(notes);
    return newNote;
}

function update(id, data) {
    const notes = readAll();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return null;
    notes[index] = { ...notes[index], ...data, id: notes[index].id, updatedAt: new Date().toISOString() };
    writeAll(notes);
    return notes[index];
}

function remove(id) {
    const notes = readAll();
    const index = notes.findIndex((n) => n.id === id);
    if (index === -1) return false;
    notes.splice(index, 1);
    writeAll(notes);
    return true;
}

function search(query) {
    const q = query.toLowerCase();
    return readAll().filter(
        (n) =>
            n.title.toLowerCase().includes(q) ||
            n.content.toLowerCase().includes(q) ||
            n.category.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q))
    );
}

module.exports = { getAll, getById, create, update, remove, search };
