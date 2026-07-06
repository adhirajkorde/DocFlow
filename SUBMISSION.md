# Submission Details

## Requirements Checklist
The following core assignment requirements were fulfilled iteratively over Phases 1–7:

- [x] **Create Documents** (Dashboard + API)
- [x] **Rename Documents** (Inline renaming for document owners)
- [x] **Rich Text Editing** (`react-quill` integration)
- [x] **Save/Reopen** (Debounced autosave + DB persistence)
- [x] **File Upload (.txt/.md)** (Multer memory streams + Marked compilation)
- [x] **Sharing** (View vs. Edit permissions via email assignment)
- [x] **Owned Section** (Dashboard segregation)
- [x] **Shared Section** (Dashboard segregation)
- [x] **Persistent Storage** (Prisma ORM + SQLite)
- [x] **Basic Auth** (JWT + bcrypt encryption)
- [x] **Error Handling** (Zod validation, ErrorBoundaries, and Contextual Toasts)
- [x] **Automated Tests** (20 passing Jest tests for Backend infrastructure)
- [x] **README.md** 
- [x] **ARCHITECTURE.md**
- [x] **AI_WORKFLOW.md**

## Evaluator Instructions

To evaluate this application locally:

1. **Spin up the Backend:**
   Navigate to the `/backend` folder, run `npm install`, then execute `npx prisma db push` to generate the SQLite file. Boot the server using `npm run dev` (defaults to port 5000).
   
2. **Spin up the Frontend:**
   Navigate to the `/frontend` folder, run `npm install --legacy-peer-deps` (required due to React 19 / Quill discrepancies), then boot the app using `npm run dev` (defaults to port 5173).

3. **Demo Workflow:**
   - Register a primary account (e.g., `alice@test.com`).
   - Create a new document ("Project Specs") and write some rich text.
   - Open a secondary incognito window and register a second account (`bob@test.com`).
   - Return to Alice's window, click "Share", and assign `bob@test.com` with `Can view` permission.
   - Switch to Bob's window. "Project Specs" will dynamically appear under his "Shared With Me" dashboard panel.
   - As Bob, open the document to verify the editor is strictly locked to Read-Only mode and the title cannot be altered.

## Screenshots / Demo
> **TODO:** *[Insert links to your demo video or screenshots here before final submission]*
- Dashboard View: `link-here`
- Editor View: `link-here`
- Share Modal: `link-here`

## Known Constraints & Trade-Offs
Given the strict 4-6 hour limitation of this assignment, several trade-offs were consciously made:
- **No Websockets (CRDTs):** The application relies on HTTP PATCH autosaves rather than true real-time syncing (like Operational Transformation or CRDTs). Simultaneous editing by two "Editors" could result in the last-save-wins race condition.
- **JWT Storage:** Tokens are maintained in `localStorage` for simplified React Router guarding, rather than `httpOnly` cookies.
- **No Email verification:** Registering relies strictly on string-matching Zod schemas rather than SMTP loopback confirmation.
