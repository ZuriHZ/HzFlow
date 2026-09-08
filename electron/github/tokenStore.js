const { app, safeStorage } = require("electron");
const fs = require("fs");
const path = require("path");

const TOKEN_FILE = path.join(app.getPath("userData"), "github-token.json");

let memoryToken = null;

function canEncrypt() {
    return typeof safeStorage === "object" && typeof safeStorage.encryptString === "function";
}

function loadToken() {
    try {
        if (!fs.existsSync(TOKEN_FILE)) {
            return null;
        }

        const raw = fs.readFileSync(TOKEN_FILE, "utf-8");
        const data = JSON.parse(raw);

        if (data.plaintext) {
            memoryToken = data.plaintext;
            return data.plaintext;
        }

        if (data.encrypted && canEncrypt()) {
            const buf = Buffer.from(data.encrypted, "base64");
            const decrypted = safeStorage.decryptString(buf);
            memoryToken = decrypted;
            return decrypted;
        }

        return memoryToken;
    } catch {
        return memoryToken;
    }
}

function saveToken(token) {
    if (!token || typeof token !== "string") {
        return false;
    }

    memoryToken = token;

    try {
        if (canEncrypt()) {
            const encrypted = safeStorage.encryptString(token);
            fs.writeFileSync(
                TOKEN_FILE,
                JSON.stringify({ encrypted: encrypted.toString("base64") }),
                "utf-8"
            );
        } else {
            fs.writeFileSync(
                TOKEN_FILE,
                JSON.stringify({ plaintext: token }),
                "utf-8"
            );
        }
        return true;
    } catch {
        return false;
    }
}

function clearToken() {
    memoryToken = null;
    try {
        if (fs.existsSync(TOKEN_FILE)) {
            fs.unlinkSync(TOKEN_FILE);
        }
        return true;
    } catch {
        return false;
    }
}

module.exports = { loadToken, saveToken, clearToken };
