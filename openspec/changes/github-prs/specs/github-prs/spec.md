# GitHub PRs Specification

## Purpose

Definir el comportamiento de la feature **GitHub Pull Requests in-app** en ZuriHZ: autenticación segura, listado/detalle de PRs en el renderer, y apertura externa controlada en el navegador del sistema. Dominio nuevo (no existe spec previa en `openspec/specs/`).

## Requirements

### Requirement: Navigation to PRs section

The system MUST expose a dedicated in-app section for GitHub Pull Requests reachable from the primary navigation.

#### Scenario: User opens PRs from sidebar

- GIVEN the app shell is loaded and the sidebar is visible
- WHEN the user selects the navigation item for Pull Requests
- THEN the app SHALL navigate to the `/prs` route (HashRouter)
- AND the PRs section UI SHALL be displayed in the main content area

#### Scenario: Direct hash route

- GIVEN the app is running
- WHEN the location hash is `#/prs`
- THEN the PRs page MUST render without requiring a full app restart

---

### Requirement: GitHub authentication via Device Flow

The system MUST authenticate the user to GitHub using OAuth Device Authorization Grant (Device Flow) as the primary method, without opening a secondary app BrowserWindow for login.

#### Scenario: Start Device Flow

- GIVEN the user is not authenticated with GitHub
- WHEN the user starts "Conectar con GitHub"
- THEN the system MUST obtain a `user_code` and `verification_uri` from GitHub
- AND the UI MUST show the `user_code` and instructions to complete authorization in the browser
- AND the system MUST poll GitHub for completion until success, denial, expiry, or user cancel

#### Scenario: Successful Device Flow

- GIVEN Device Flow is in progress and the user approves access on GitHub
- WHEN polling receives an access token
- THEN the system MUST persist the token only in the Electron main process using OS-backed encryption (`safeStorage` when available)
- AND the renderer MUST receive only a success status and non-secret profile fields (e.g. login, avatar URL)
- AND the token MUST NOT be returned to the renderer over IPC

#### Scenario: User cancels Device Flow

- GIVEN Device Flow is in progress
- WHEN the user cancels from the app UI
- THEN polling MUST stop
- AND no token SHALL be stored
- AND the UI MUST return to the unauthenticated state

#### Scenario: Device Flow expires or is denied

- GIVEN Device Flow is in progress
- WHEN GitHub reports expiry or access denied
- THEN the system MUST stop polling
- AND the UI MUST show a clear error and allow retry
- AND no token SHALL be stored

---

### Requirement: Optional PAT for development only

The system MAY accept a GitHub Personal Access Token for local development convenience.

#### Scenario: Dev PAT login

- GIVEN the app is running in a development context (or an explicitly enabled dev auth path)
- WHEN the user submits a PAT through the designated dev-only control
- THEN the main process MAY validate and store the token with the same storage rules as Device Flow
- AND the renderer MUST NOT retain the PAT after submission
- AND production builds SHOULD NOT surface the PAT entry path as the primary auth UX

---

### Requirement: Session status and logout

The system MUST allow the renderer to query authentication status and to log out without exposing secrets.

#### Scenario: Query status when authenticated

- GIVEN a valid token is stored in main
- WHEN the renderer requests GitHub auth status
- THEN the response MUST include authenticated=true and public user identity fields
- AND the response MUST NOT include the access token

#### Scenario: Query status when not authenticated

- GIVEN no valid token is stored
- WHEN the renderer requests GitHub auth status
- THEN the response MUST include authenticated=false

#### Scenario: Logout

- GIVEN the user is authenticated
- WHEN the user chooses logout
- THEN the system MUST delete the stored token from main-process storage
- AND subsequent list/detail requests MUST require re-authentication
- AND the PRs UI MUST reflect the unauthenticated state

---

### Requirement: List pull requests in-app

When authenticated, the system MUST list the user's relevant pull requests inside the app.

#### Scenario: List PRs success

- GIVEN the user is authenticated
- WHEN the PRs list is requested (initial load or manual refresh)
- THEN the system MUST fetch pull requests from the GitHub API in the main process
- AND the UI MUST display each item with at least: title, repository, state (open/closed/merged if available), author, and updated time
- AND the UI SHOULD indicate draft status and basic labels when provided by the API

#### Scenario: Empty list

- GIVEN the user is authenticated and has no matching PRs
- WHEN the list is loaded
- THEN the UI MUST show an empty state (not an error)

#### Scenario: List without authentication

- GIVEN the user is not authenticated
- WHEN the user visits `/prs`
- THEN the system MUST NOT call the GitHub API with an anonymous token path for private data
- AND the UI MUST prompt the user to connect GitHub

#### Scenario: API or network failure on list

- GIVEN the user is authenticated
- WHEN the list request fails due to network or GitHub API error
- THEN the UI MUST show an error state with a retry action
- AND the system MUST NOT crash the app shell

#### Scenario: Rate limit on list

- GIVEN GitHub returns a rate limit response
- WHEN the list request fails for that reason
- THEN the UI SHOULD explain rate limiting and when/how to retry
- AND the system MUST NOT loop aggressively on automatic retries

---

### Requirement: Pull request detail in-app

The system MUST provide a basic in-app detail view for a selected pull request.

#### Scenario: Open PR detail

- GIVEN a PR is visible in the list
- WHEN the user selects that PR
- THEN the UI MUST show a detail view with at least: title, body/description (or placeholder if empty), state, repository, author, base/head refs when available, and timestamps
- AND the UI MAY show review/check summary fields when available from the API

#### Scenario: Detail fetch failure

- GIVEN the user opens a PR detail
- WHEN the detail request fails
- THEN the UI MUST show an error with retry
- AND the user MUST be able to return to the list

---

### Requirement: Open on GitHub via system browser

The system MUST support opening a pull request (and verification URLs) in the user's default browser using the OS shell, without embedding github.com as the primary review surface.

#### Scenario: Open PR externally

- GIVEN a PR detail or list item with a valid GitHub HTML URL
- WHEN the user activates "Abrir en GitHub"
- THEN the main process MUST open that URL with `shell.openExternal`
- AND the URL MUST be restricted to allowed GitHub HTTPS hosts (e.g. `github.com`)

#### Scenario: Reject non-GitHub external URL

- GIVEN an open-external request with a non-allowed URL
- WHEN main validates the URL
- THEN the system MUST reject the request
- AND MUST NOT open the URL

#### Scenario: Open Device Flow verification URI

- GIVEN Device Flow has started and a `verification_uri` is available
- WHEN the user chooses to open the verification page
- THEN the system MUST open an allowed GitHub HTTPS verification URL via `shell.openExternal`

---

### Requirement: Security boundaries for IPC and storage

The system MUST keep Node/Electron privileged APIs and secrets out of the renderer.

#### Scenario: Renderer isolation preserved

- GIVEN the app window webPreferences
- WHEN the GitHub feature is integrated
- THEN `contextIsolation` MUST remain true
- AND `nodeIntegration` MUST remain false
- AND `sandbox` MUST remain true
- AND GitHub capabilities MUST be exposed only through `contextBridge` (`electronAPI.github.*`)

#### Scenario: Token storage location

- GIVEN a successful authentication
- WHEN the token is persisted
- THEN it MUST be stored only by the main process
- AND it MUST NOT be written to renderer `localStorage` or similar web storage
- AND it SHOULD be encrypted with `safeStorage` when the platform supports it

#### Scenario: IPC surface minimization

- GIVEN the preload bridge for GitHub
- WHEN inspecting exposed methods
- THEN only the documented github operations SHALL be available
- AND arbitrary HTTP or filesystem APIs MUST NOT be exposed to the renderer

---

### Requirement: No multi-window manager in this change

This change MUST NOT introduce a multi-window manager or secondary feature windows as part of the PRs deliverable.

#### Scenario: Single primary window UX

- GIVEN the user uses GitHub PRs features (auth, list, detail, open external)
- WHEN those flows complete
- THEN the app MUST remain on the existing single primary BrowserWindow model
- AND MUST NOT require a window-manager subsystem for this feature

#### Scenario: No webview-primary review path

- GIVEN the user reviews PRs in-app
- WHEN using the primary happy path
- THEN the system MUST present native list/detail UI
- AND MUST NOT use an embedded github.com webview as the primary review experience

---

### Requirement: Copy user code during Device Flow

The system SHOULD make the Device Flow `user_code` easy to transfer to the browser session.

#### Scenario: Copy user code

- GIVEN Device Flow UI is showing a `user_code`
- WHEN the user activates copy
- THEN the code MUST be placed on the clipboard
- AND the UI SHOULD confirm the copy action
