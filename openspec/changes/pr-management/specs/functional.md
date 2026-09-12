# Functional Specifications: GitHub PR Management

## FR-01: Merge Pull Request

### Scenario: Merge with squash method

**Given** the user is viewing a mergeable PR detail
**When** the user clicks "Merge" in the toolbar
**Then** the PrMergeModal opens with squash selected by default

**Given** the PrMergeModal is open
**When** the user selects "squash" as merge method
**And** the user optionally edits the commit title (pre-filled with PR title)
**And** the user optionally adds a commit message
**And** the user clicks "Confirmar merge"
**Then** a confirmation dialog appears: "¿Estás seguro de que quieres hacer merge de este PR?"

**Given** the confirmation dialog is shown
**When** the user confirms
**Then** the merge API is called with the selected options
**And** a loading indicator is shown during the request
**And** on success, a toast "PR mergeado correctamente" is shown
**And** the PR detail is refreshed to show merged state
**And** the merge button is disabled

### Scenario: Merge with conflicts

**Given** the user tries to merge a PR with conflicts
**When** the API returns 422
**Then** an error toast shows: "Hay conflictos que resolver primero."
**And** the PR remains in its current state

### Scenario: Already merged PR

**Given** the PR is already merged
**When** the merge API returns 405
**Then** an error toast shows: "El PR ya fue mergeado."
**And** the PR detail is refreshed

---

## FR-02: Close / Reopen Pull Request

### Scenario: Close an open PR

**Given** the user is viewing an open PR
**When** the user clicks "Cerrar PR" in the toolbar
**Then** a confirmation dialog appears: "¿Estás seguro de que quieres cerrar este PR?"

**Given** the confirmation dialog is shown
**When** the user confirms
**Then** the PR is updated to closed state via PATCH API
**And** a toast "PR cerrado" is shown
**And** the button changes to "Reabrir PR"

### Scenario: Reopen a closed PR

**Given** the user is viewing a closed (not merged) PR
**When** the user clicks "Reabrir PR"
**Then** the PR is reopened via PATCH API
**And** a toast "PR reabierto" is shown
**And** the button changes to "Cerrar PR"

---

## FR-03: Create Review

### Scenario: Approve a PR

**Given** the user is viewing a PR
**When** the user clicks "Revisar" and selects "Aprobar"
**Then** the review form shows an optional body textarea
**And** the user clicks "Enviar revisión"
**And** the review is submitted with event APPROVE
**And** a toast "Revisión enviada" is shown

### Scenario: Request changes

**Given** the user selects "Pedir cambios"
**Then** the body textarea is required
**When** the user leaves body empty and clicks submit
**Then** a validation error shows: "El comentario es requerido para pedir cambios."

**Given** the user provides a body
**When** the user clicks "Enviar revisión"
**Then** the review is submitted with event REQUEST_CHANGES
**And** a toast "Revisión enviada" is shown

### Scenario: Comment on a PR

**Given** the user selects "Comentar"
**Then** the body textarea is required
**When** the user provides a body and clicks "Enviar revisión"
**Then** the review is submitted with event COMMENT
**And** a toast "Revisión enviada" is shown

---

## FR-04: Edit Pull Request

### Scenario: Edit title and body

**Given** the user is viewing a PR
**When** the user clicks "Editar" in the toolbar
**Then** the PrEditModal opens with current title and body pre-filled

**Given** the PrEditModal is open
**When** the user modifies the title and/or body
**And** the user clicks "Guardar cambios"
**Then** the PATCH API is called with the updated fields
**And** a toast "PR actualizado" is shown
**And** the PR detail is refreshed

---

## FR-05: Manage Reviewers

### Scenario: View current reviewers

**Given** the user is viewing a PR detail
**Then** the PrReviewersManager component shows:
- A list of pending reviewers with their avatars and usernames

### Scenario: Add a reviewer

**Given** the PrReviewersManager is visible
**When** the user types a username in the input field
**And** clicks "Agregar" or presses Enter
**Then** the reviewer is added via POST API
**And** the reviewer list is updated

### Scenario: Remove a reviewer

**Given** a reviewer is listed in PrReviewersManager
**When** the user clicks the remove button (X) next to the reviewer
**Then** the reviewer is removed via DELETE API
**And** the reviewer list is updated

---

## FR-06: Manage Labels

### Scenario: View current labels

**Given** the user is viewing a PR detail
**Then** the PrLabelManager component shows:
- Current labels with their color chips

### Scenario: Add a label

**Given** the PrLabelManager is visible
**When** the user selects or types a label name
**And** clicks "Agregar"
**Then** the label is added via POST API
**And** the label list is updated

### Scenario: Remove a label

**Given** a label is displayed in PrLabelManager
**When** the user clicks the remove button (X) on the label
**Then** the label is removed via DELETE API
**And** the label list is updated

---

## FR-07: Review History

### Scenario: Display past reviews

**Given** the user is viewing a PR detail
**Then** the PrReviewHistory component shows a list of past reviews
**And** each review displays:
- Reviewer avatar and username
- Verdict badge (Aprobado / Cambios solicitados / Comentario)
- Date (formatted as locale date)
- Body text (if any)
**And** reviews are sorted by date descending
