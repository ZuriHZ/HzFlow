const { app, ipcMain } = require("electron");
const { loadToken, saveToken, clearToken } = require("./tokenStore");
const { startDeviceFlow, pollForToken, cancelDeviceFlow } = require("./deviceFlow");
const { getAuthenticatedUser, listPullRequests, getPullRequest } = require("./api");
const { openExternalUrl } = require("./openExternal");

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";

let deviceFlowState = null;

function isDev() {
    return !app.isPackaged;
}

function getGithubClientId() {
    return CLIENT_ID;
}

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

async function handleDeviceFlowStart() {
    const clientId = getGithubClientId();
    if (!clientId) {
        throw { code: "UNKNOWN", message: "GITHUB_CLIENT_ID is not configured." };
    }

    if (deviceFlowState && deviceFlowState.polling) {
        throw { code: "UNKNOWN", message: "A device flow is already in progress." };
    }

    const flowData = await startDeviceFlow(clientId);

    deviceFlowState = {
        polling: true,
        deviceCode: flowData.deviceCode,
        interval: flowData.interval,
    };

    return {
        userCode: flowData.userCode,
        verificationUri: flowData.verificationUri,
        expiresIn: flowData.expiresIn,
        interval: flowData.interval,
    };
}

async function handleDeviceFlowWait() {
    const clientId = getGithubClientId();
    if (!clientId) {
        throw { code: "UNKNOWN", message: "GITHUB_CLIENT_ID is not configured." };
    }

    if (!deviceFlowState || !deviceFlowState.polling) {
        throw { code: "UNKNOWN", message: "No device flow in progress. Start one first." };
    }

    try {
        const token = await pollForToken(
            clientId,
            deviceFlowState.deviceCode,
            deviceFlowState.interval
        );

        saveToken(token);

        deviceFlowState = null;

        const user = await getAuthenticatedUser(token);
        return { authenticated: true, user };
    } catch (err) {
        deviceFlowState = null;
        throw err;
    }
}

async function handleDeviceFlowCancel() {
    cancelDeviceFlow();
    deviceFlowState = null;
}

async function handleLogout() {
    clearToken();
    cancelDeviceFlow();
    deviceFlowState = null;
}

async function handleLoginPat(event, payload) {
    if (!isDev()) {
        throw { code: "UNKNOWN", message: "PAT login is only available in development mode." };
    }

    if (!payload || !payload.token) {
        throw { code: "UNKNOWN", message: "No token provided." };
    }

    const token = payload.token;

    try {
        const user = await getAuthenticatedUser(token);
        saveToken(token);
        return { authenticated: true, user };
    } catch (err) {
        throw err;
    }
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
    ipcMain.handle("github:device-flow:start", handleDeviceFlowStart);
    ipcMain.handle("github:device-flow:wait", handleDeviceFlowWait);
    ipcMain.handle("github:device-flow:cancel", handleDeviceFlowCancel);
    ipcMain.handle("github:logout", handleLogout);
    ipcMain.handle("github:login-pat", handleLoginPat);
    ipcMain.handle("github:prs:list", handlePrsList);
    ipcMain.handle("github:prs:get", handlePrsGet);
    ipcMain.handle("github:open-external", handleOpenExternal);
}

module.exports = { setupGithubHandlers };
