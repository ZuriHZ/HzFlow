const { app } = require("electron");
const path = require("path");
const fs = require("fs");

const CONFIG_FILE = "github-config.json";

function getConfigPath() {
    return path.join(app.getPath("userData"), CONFIG_FILE);
}

function loadConfig() {
    try {
        const configPath = getConfigPath();
        if (!fs.existsSync(configPath)) {
            return { clientId: "" };
        }
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        return { clientId: parsed.clientId || "" };
    } catch {
        return { clientId: "" };
    }
}

function saveConfig(config) {
    const configPath = getConfigPath();
    const data = { clientId: config.clientId || "" };
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2), "utf-8");
}

function getClientId() {
    return loadConfig().clientId;
}

module.exports = { loadConfig, saveConfig, getClientId };
