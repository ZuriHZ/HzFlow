const GITHUB_API = "https://api.github.com";
const GITHUB_ACCEPT = "application/vnd.github+json";
const GITHUB_API_VERSION = "2022-11-28";

function makeHeaders(token) {
    return {
        Accept: GITHUB_ACCEPT,
        "X-GitHub-Api-Version": GITHUB_API_VERSION,
        Authorization: `Bearer ${token}`,
    };
}

function mapApiError(status, data) {
    if (status === 401) {
        return { code: "UNAUTHENTICATED", message: "Invalid or expired token." };
    }
    if (status === 403 && data && data.message && data.message.toLowerCase().includes("rate limit")) {
        const reset = data.headers && data.headers["x-ratelimit-reset"];
        const resetTime = reset ? new Date(parseInt(reset, 10) * 1000).toISOString() : "unknown";
        return { code: "RATE_LIMITED", message: `Rate limit exceeded. Resets at ${resetTime}.` };
    }
    if (status === 422) {
        return { code: "NETWORK", message: data && data.message ? data.message : "Validation error." };
    }
    return { code: "UNKNOWN", message: data && data.message ? data.message : `GitHub API error: ${status}` };
}

async function getAuthenticatedUser(token) {
    const response = await fetch(`${GITHUB_API}/user`, {
        method: "GET",
        headers: makeHeaders(token),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw mapApiError(response.status, data);
    }

    const user = await response.json();
    return {
        login: user.login,
        avatarUrl: user.avatar_url,
        name: user.name,
        htmlUrl: user.html_url,
    };
}

function buildSearchQuery(filter) {
    const parts = ["is:pr"];

    const involvement = (filter && filter.involvement) || "involved";
    if (involvement === "involved") {
        parts.push("involves:@me");
    } else if (involvement === "created") {
        parts.push("author:@me");
    } else if (involvement === "assigned") {
        parts.push("assignee:@me");
    } else if (involvement === "review-requested") {
        parts.push("review-requested:@me");
    }

    const state = (filter && filter.state) || "open";
    parts.push(`is:${state}`);

    return parts.join(" ");
}

function mapSearchItem(item) {
    const repoFullName = item.repository_url
        ? item.repository_url.replace("https://api.github.com/repos/", "")
        : "unknown/unknown";

    const isMerged = item.pull_request && item.pull_request.merged_at !== null;

    return {
        id: item.id,
        number: item.number,
        title: item.title,
        state: isMerged ? "closed" : item.state,
        merged: isMerged,
        draft: item.draft || false,
        repository: repoFullName,
        author: item.user ? item.user.login : "unknown",
        labels: (item.labels || []).map((l) => l.name),
        updatedAt: item.updated_at,
        htmlUrl: item.html_url,
    };
}

async function listPullRequests(token, filter) {
    const q = buildSearchQuery(filter);
    const perPage = (filter && filter.perPage) || 30;
    const url = `${GITHUB_API}/search/issues?q=${encodeURIComponent(q)}&per_page=${perPage}&sort=updated&order=desc`;

    const response = await fetch(url, {
        method: "GET",
        headers: makeHeaders(token),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw mapApiError(response.status, data);
    }

    const data = await response.json();
    return (data.items || []).map(mapSearchItem);
}

async function getPullRequest(token, owner, repo, number) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/pulls/${number}`;

    const response = await fetch(url, {
        method: "GET",
        headers: makeHeaders(token),
    });

    if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw mapApiError(response.status, data);
    }

    const pr = await response.json();
    const repoFullName = `${owner}/${repo}`;

    return {
        id: pr.id,
        number: pr.number,
        title: pr.title,
        state: pr.merged ? "closed" : pr.state,
        merged: pr.merged || false,
        draft: pr.draft || false,
        repository: repoFullName,
        author: pr.user ? pr.user.login : "unknown",
        labels: (pr.labels || []).map((l) => l.name),
        updatedAt: pr.updated_at,
        htmlUrl: pr.html_url,
        body: pr.body || null,
        createdAt: pr.created_at,
        baseRef: pr.base ? pr.base.ref : undefined,
        headRef: pr.head ? pr.head.ref : undefined,
        checksSummary: null,
        reviewers: (pr.requested_reviewers || []).map((r) => ({ login: r.login, avatarUrl: r.avatar_url })),
        reviewTeams: (pr.requested_teams || []).map((t) => t.name),
        commits: pr.commits || 0,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        changedFiles: pr.changed_files || 0,
        reviewComments: pr.review_comments || 0,
        mergeable: pr.mergeable ?? null,
        mergeState: pr.mergeable_state || null,
        mergedBy: pr.merged_by ? pr.merged_by.login : null,
        diffUrl: pr.diff_url || null,
        headRepo: pr.head && pr.head.repo ? pr.head.repo.full_name : null,
    };
}

module.exports = { getAuthenticatedUser, listPullRequests, getPullRequest };
