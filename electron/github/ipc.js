const { ipcMain } = require("electron");
const { loadToken, saveToken, clearToken } = require("./tokenStore");
const { getAuthenticatedUser, listPullRequests, getPullRequest } = require("./api");
const { openExternalUrl } = require("./openExternal");

async function handleGetStatus() {
    const token = loadToken();
    if (!token) {
        return { authenticated: false };
    }

    try {
        const user = await getAuthenticatedUser(token);
        return { authenticated: true, user };
    } catch {
        clearToken();
        return { authenticated: false };
    }
}

async function handleLogout() {
    clearToken();
}

async function handleLoginPat(event, payload) {
    if (!payload || !payload.token) {
        throw { code: "UNKNOWN", message: "No token provided." };
    }

    const token = payload.token.trim();
    if (!token) {
        throw { code: "UNKNOWN", message: "Token is empty." };
    }

    const user = await getAuthenticatedUser(token);
    saveToken(token);
    return { authenticated: true, user };
}



async function handlePrsList(event, filter) {
    const token = loadToken();
    if (!token) {
        throw { code: "UNAUTHENTICATED", message: "Not authenticated. Please connect with GitHub first." };
    }

    return await listPullRequests(token, filter);
}

async function handlePrsGet(event, payload) {
    const token = loadToken();
    if (!token) {
        throw { code: "UNAUTHENTICATED", message: "Not authenticated. Please connect with GitHub first." };
    }

    if (!payload || !payload.owner || !payload.repo || !payload.number) {
        throw { code: "UNKNOWN", message: "Missing owner, repo, or number." };
    }

    return await getPullRequest(token, payload.owner, payload.repo, payload.number);
}

async function handleOpenExternal(event, payload) {
    if (!payload || !payload.url) {
        throw { code: "INVALID_URL", message: "No URL provided." };
    }

    await openExternalUrl(payload.url);
}

function setupGithubHandlers() {
    ipcMain.handle("github:get-status", handleGetStatus);
    ipcMain.handle("github:logout", handleLogout);
    ipcMain.handle("github:login-pat", handleLoginPat);
    ipcMain.handle("github:prs:list", handlePrsList);
    ipcMain.handle("github:prs:get", handlePrsGet);
    ipcMain.handle("github:open-external", handleOpenExternal);
}

module.exports = { setupGithubHandlers };
