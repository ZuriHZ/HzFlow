const { shell } = require("electron");

const ALLOWED_HOSTS = ["github.com"];

function isAllowedUrl(urlString) {
    try {
        const parsed = new URL(urlString);

        if (parsed.protocol !== "https:") {
            return false;
        }

        const hostname = parsed.hostname.toLowerCase();

        if (ALLOWED_HOSTS.includes(hostname)) {
            return true;
        }

        if (hostname.endsWith("." + "github.com")) {
            return true;
        }

        return false;
    } catch {
        return false;
    }
}

async function openExternalUrl(urlString) {
    if (!urlString || typeof urlString !== "string") {
        throw { code: "INVALID_URL", message: "No URL provided." };
    }

    if (!isAllowedUrl(urlString)) {
        throw { code: "INVALID_URL", message: "URL not allowed. Only GitHub HTTPS URLs are permitted." };
    }

    await shell.openExternal(urlString);
}

module.exports = { openExternalUrl, isAllowedUrl };
