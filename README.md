# DocFlow - Collaborative Document Editor

DocFlow is a lightweight collaborative document editor that allows users to create, rich-text edit, import, and securely share documents with granular access controls (view vs. edit permissions). It is built for small teams or individuals looking for a Google Docs-lite experience, prioritizing speed, minimalism, and secure access management.

## Tech Stack
**Frontend:**
- **Framework:** React (v19) powered by Vite (v8)
- **Routing:** React Router DOM (v7)
- **Styling:** Tailwind CSS (v3)
- **Editor:** React Quill (v2.0.0)
- **API Client:** Axios

**Backend:**
- **Runtime:** Node.js
- **Framework:** Express.js (v5)
- **Database:** SQLite (via Prisma ORM v6.19)
- **Authentication:** JSON Web Tokens (jsonwebtoken) & bcrypt
- **Validation:** Zod
- **File Parsing:** Multer & Marked (Markdown parsing)
- **Testing:** Jest & Supertest

## Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

## Setup Instructions

### 1. Clone the repository
```bash
git clone <repository-url>
cd docflow
```

### 2. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory based on `.env.example`:
```env
DATABASE_URL="file:./dev.db"
PORT=5000
JWT_SECRET="your-super-secret-jwt-key"
```
Run Prisma migrations to initialize the database:
```bash
npx prisma migrate dev --name init
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install --legacy-peer-deps
```
Create a `.env` file in the `frontend/` directory (if not present) and configure the API URL:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application Locally

You will need two terminal windows to run both servers concurrently.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```
*The backend API will start on `http://localhost:5000`.*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*The frontend development server will start on `http://localhost:5173`.*

## Running the Automated Test Suite (Backend)
The backend features a comprehensive test suite covering Auth, Document CRUD, and Sharing constraints. Tests use an isolated in-memory/file-based SQLite database to ensure idempotency.

```bash
cd backend
npm run test
```

## Core Features
- **User Authentication:** Secure registration and login using bcrypt password hashing and JWTs.
- **Document Management:** Create new documents, list owned documents, and securely delete them.
- **Rich Text Editing:** Edit documents via a responsive WYSIWYG editor (`react-quill`).
- **Autosave Engine:** Debounced background saves ensure no content is lost without spamming the backend API.
- **File Import:** Import local `.txt` or `.md` files natively into the rich-text editor (Markdown compiles directly to styled HTML).
- **Granular Sharing:** Share documents with registered users via their email. Assign "Can view" or "Can edit" permissions.
- **Segregated Dashboards:** Distinct visual sections for "My Documents" and "Shared With Me".
- **Robust Error Handling:** Unified, toast-based error propagation across the frontend and secure, masked validation rejections via Zod on the backend.

## Known Limitations / Future Work
- **No Real-Time Collaborative Cursors:** While multiple users can theoretically edit a document simultaneously via the autosave engine, there is no WebSocket integration (e.g., Yjs or Socket.io) to visually represent live cursors, meaning concurrent edits can result in race conditions.
- **No Password Reset Flow:** Lost passwords cannot be recovered as email integration (SMTP) is not configured.
- **No Pagination:** The dashboard fetches all documents at once. For massive document libraries, cursor-based pagination would be required.
- **Session Revocation:** JWTs are stateless; there is currently no Redis blocklist implemented to immediately revoke compromised sessions before expiry.
- **Exporting Documents:** Currently, users can import files but cannot export their rich text back to `.pdf` or `.docx`.
