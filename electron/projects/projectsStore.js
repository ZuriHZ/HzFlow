const { app } = require("electron");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const PROJECTS_FILE = path.join(app.getPath("userData"), "projects.json");

function ensureFile() {
    if (!fs.existsSync(PROJECTS_FILE)) {
        fs.writeFileSync(PROJECTS_FILE, "[]", "utf-8");
    }
}

function readAll() {
    ensureFile();
    try {
        const data = fs.readFileSync(PROJECTS_FILE, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

function writeAll(projects) {
    ensureFile();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf-8");
}

function detectStack(projectPath) {
    try {
        const files = fs.readdirSync(projectPath);
        if (files.includes("package.json")) {
            const pkg = JSON.parse(fs.readFileSync(path.join(projectPath, "package.json"), "utf-8"));
            const deps = { ...pkg.dependencies, ...pkg.devDependencies };
            if (deps["next"]) return "Next.js";
            if (deps["nuxt"]) return "Nuxt";
            if (deps["astro"]) return "Astro";
            if (deps["svelte"] || deps["@sveltejs/kit"]) return "Svelte";
            if (deps["vue"] || deps["nuxt"]) return "Vue";
            if (deps["@angular/core"]) return "Angular";
            if (deps["react"]) return "React";
            if (deps["electron"]) return "Electron";
            if (deps["express"]) return "Express";
            if (deps["fastify"]) return "Fastify";
            if (deps["typescript"]) return "TypeScript";
            return "Node.js";
        }
        if (files.includes("requirements.txt") || files.includes("pyproject.toml")) return "Python";
        if (files.includes("Cargo.toml")) return "Rust";
        if (files.includes("go.mod")) return "Go";
        if (files.includes("Gemfile")) return "Ruby";
        if (files.includes("pom.xml") || files.includes("build.gradle")) return "Java";
        if (files.includes("pubspec.yaml")) return "Dart/Flutter";
        if (files.includes("CMakeLists.txt")) return "C/C++";
        return "Unknown";
    } catch {
        return "Unknown";
    }
}

function getAll() {
    return readAll();
}

function add(projectPath) {
    const projects = readAll();
    const exists = projects.find((p) => p.path === projectPath);
    if (exists) return exists;

    const name = path.basename(projectPath);
    const newProject = {
        id: crypto.randomUUID(),
        name,
        path: projectPath,
        stack: detectStack(projectPath),
        lastAccessed: new Date().toISOString(),
        gitBranch: undefined,
        gitAhead: undefined,
        gitBehind: undefined,
    };
    projects.push(newProject);
    writeAll(projects);
    return newProject;
}

function remove(id) {
    const projects = readAll();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return false;
    projects.splice(index, 1);
    writeAll(projects);
    return true;
}

function update(id, data) {
    const projects = readAll();
    const index = projects.findIndex((p) => p.id === id);
    if (index === -1) return null;
    projects[index] = { ...projects[index], ...data, id: projects[index].id };
    writeAll(projects);
    return projects[index];
}

module.exports = { getAll, add, remove, update, detectStack };
