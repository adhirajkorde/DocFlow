# Architecture

## High-Level Architecture
DocFlow utilizes a classic decoupled SPA (Single Page Application) architecture.

```text
+-------------------+        JSON / HTTP         +---------------------+
|                   |   (Authorization: Bearer)  |                     |
|    React SPA      | <------------------------> |   Express REST API  |
|   (Frontend/Vite) |                            |      (Backend)      |
|                   |                            |                     |
+-------------------+                            +----------+----------+
          |                                                 |
          | (Local Storage)                                 | (Prisma ORM)
          v                                                 v
+-------------------+                            +----------+----------+
|                   |                            |                     |
|    JWT Auth       |                            |   SQLite Database   |
|                   |                            |                     |
+-------------------+                            +---------------------+
```

### Auth Token Flow
1. User provides credentials to the backend.
2. Backend validates against SQLite, signs a payload utilizing `jsonwebtoken`, and returns the Token string.
3. The React SPA stores this token in `localStorage`.
4. Axios Interceptors automatically attach `Authorization: Bearer <token>` to all outbound requests.
5. `auth.middleware.js` on the backend validates the signature before allowing route controller execution.

**Trade-off:** Storing JWTs in `localStorage` is simpler for a time-boxed assignment and allows rapid integration with Axios. However, it is structurally vulnerable to Cross-Site Scripting (XSS) attacks. A more robust, enterprise-grade approach would involve storing tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS vectoring entirely.

## Data Model

The database relies on three tightly scoped SQLite tables orchestrated by Prisma ORM:

1. **User**: `id`, `email`, `passwordHash`, `name`
2. **Document**: `id`, `title`, `content` (HTML Text), `ownerId`
3. **DocumentShare**: `id`, `documentId`, `sharedWithUserId`, `permission` ("view" | "edit")

**Rationale:**
- **One-to-Many**: A `User` inherently owns many `Documents` (tracked via `ownerId`). 
- **Many-to-Many (via Join Table)**: `DocumentShare` acts as the explicit join table between Users and Documents they don't own. 
- Including the `permission` string directly on the join table allows for infinite scaling of granular Role-Based Access Control (RBAC). It's inherently simple, avoids JSON-blob permission storage, and makes indexing efficient.

## Content Storage Decision
Document content is saved strictly as **HTML strings** generated natively by `react-quill`.

**Rationale:**
- **Simplicity**: Eliminates the overhead of maintaining a separate intermediate rich-text schema parsing layer (like Quill Deltas or Slate ASTs).
- **Trade-off**: Requires implicit trust of the HTML structure. While `react-quill` attempts to output normalized HTML, without strict server-side HTML sanitization (e.g., `DOMPurify`), malicious scripts could theoretically be injected if the API is hit outside the SPA client.

## Folder Structure Rationale
The backend adheres to a strict Layered Architecture (Controller-Service-Route):

- `routes/`: Maps specific URL endpoints and HTTP verbs to specific controllers. Includes validation middleware injection.
- `controllers/`: Handles raw HTTP req/res cycles. Extracts parameters, triggers services, and formulates the JSON response.
- `services/`: Holds purely agnostic business logic (Prisma queries). By entirely decoupling from Express, they become vastly easier to mock and unit test.
- `middleware/`: Standalone functions for JWT decoding, Zod validation formatting, and Multer file streaming.

## Notable Design Decisions
- **Phase 3 (Debounced Autosave)**: Implemented a custom `useDebounceSave` hook (1500ms delay) to prevent UI blocking and API rate-limiting while typing rapidly in the editor.
- **Phase 5 (File Import Conversion)**: Kept file persistence entirely in-memory using Multer `memoryStorage()`. Once `marked` compiles the buffer to HTML string, the binary is immediately dumped, saving server disk capacity and avoiding complex cleanup cronjobs.
- **Phase 6 (Permission Model)**: Backend endpoints explicitly inject the user's evaluated `permission` ("owner", "edit", "view") directly into the `getDocumentById` payload. This single-source-of-truth allows the frontend to effortlessly toggle toolbar options and lock `react-quill` into `readOnly` mode without making secondary RBAC checks.
