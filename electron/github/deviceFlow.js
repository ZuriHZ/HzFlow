let currentPollAbort = null;

async function startDeviceFlow(clientId) {
    const response = await fetch("https://github.com/login/device/code", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            client_id: clientId,
            scope: "",
        }),
    });

    if (!response.ok) {
        throw { code: "NETWORK", message: `GitHub device code request failed: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
        throw { code: "NETWORK", message: data.error_description || data.error };
    }

    return {
        userCode: data.user_code,
        verificationUri: data.verification_uri,
        expiresIn: data.expires_in,
        interval: data.interval || 5,
        deviceCode: data.device_code,
    };
}

async function pollForToken(clientId, deviceCode, interval, onToken) {
    return new Promise((resolve, reject) => {
        let cancelled = false;
        let timeoutId = null;

        currentPollAbort = {
            cancel: () => {
                cancelled = true;
                if (timeoutId) clearTimeout(timeoutId);
                currentPollAbort = null;
                reject({ code: "CANCELLED", message: "Device flow cancelled by user" });
            },
        };

        async function poll() {
            if (cancelled) return;

            try {
                const response = await fetch("https://github.com/login/oauth/access_token", {
                    method: "POST",
                    headers: {
                        Accept: "application/json",
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        client_id: clientId,
                        device_code: deviceCode,
                        grant_type: "urn:ietf:params:oauth:grant-type:device_code",
                    }),
                });

                if (cancelled) return;

                if (!response.ok) {
                    cancelled = true;
                    currentPollAbort = null;
                    reject({ code: "NETWORK", message: `Token poll failed: ${response.status}` });
                    return;
                }

                const data = await response.json();

                if (data.access_token) {
                    cancelled = true;
                    currentPollAbort = null;
                    resolve(data.access_token);
                    return;
                }

                if (data.error === "authorization_pending") {
                    timeoutId = setTimeout(poll, interval * 1000);
                    return;
                }

                if (data.error === "slow_down") {
                    timeoutId = setTimeout(poll, (interval + 5) * 1000);
                    return;
                }

                if (data.error === "expired_token") {
                    cancelled = true;
                    currentPollAbort = null;
                    reject({ code: "EXPIRED", message: "Device code expired. Please try again." });
                    return;
                }

                if (data.error === "access_denied") {
                    cancelled = true;
                    currentPollAbort = null;
                    reject({ code: "ACCESS_DENIED", message: "Access denied by user." });
                    return;
                }

                cancelled = true;
                currentPollAbort = null;
                reject({ code: "UNKNOWN", message: data.error_description || "Unknown polling error" });
            } catch (err) {
                if (!cancelled) {
                    cancelled = true;
                    currentPollAbort = null;
                    reject({ code: "NETWORK", message: "Network error during token polling." });
                }
            }
        }

        timeoutId = setTimeout(poll, interval * 1000);
    });
}

function cancelDeviceFlow() {
    if (currentPollAbort) {
        currentPollAbort.cancel();
        currentPollAbort = null;
    }
}

module.exports = { startDeviceFlow, pollForToken, cancelDeviceFlow };
