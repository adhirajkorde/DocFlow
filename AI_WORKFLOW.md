# AI Workflow

DocFlow was entirely developed leveraging an **AI-native workflow**. Instead of attempting a zero-shot "build everything" prompt, the complex assignment was methodically broken down into 8 distinct phases through a Planning/Architecture pass. 

Code generation was driven iteratively using Antigravity AI.

## Phase Execution Breakdown

| Phase | Objective | Output / Status |
|---|---|---|
| **Phase 1** | Backend Initialization | Scaffolded Express/Prisma, designed SQL Schema for Users, Docs, Shares. |
| **Phase 2** | Frontend Initialization | Scaffolded Vite/React, Tailwind config, routing, and Axios interceptors. |
| **Phase 3** | Document CRUD API | Implemented backend services/controllers for robust document lifecycle. |
| **Phase 4** | Rich Text Editor UI | Integrated `react-quill` and a custom debounced autosave architecture. |
| **Phase 5** | File Imports | Setup `multer` memory streams and `marked` MD-to-HTML conversion logic. |
| **Phase 6** | Granular Sharing | Deployed the RBAC permission engine, ShareModal UI, and dual-Dashboard. |
| **Phase 7** | Hardening & Tests | Added Zod validation, global ErrorBoundaries, Toast systems, and Jest suites. |
| **Phase 8** | Documentation | Compiled README, Architecture notes, and final project Submission details. |

## Human & AI Collaboration
- **Planning & Prompt Engineering:** The architectural roadmap and phase segmentation were constructed by a human engineer.
- **Execution & Generation:** Antigravity AI generated the initial implementation scripts, configuration files, and code structures for each phase.
- **Review & Verification:** The AI iteratively debugged its own compilation failures (e.g., Jest module mismatch with `marked` ESM exports). Each phase's output was critically reviewed by the AI agent against explicit acceptance criteria and automated tests before receiving human approval to proceed to the next phase.

## Why Phase-Based Prompting?
A sequential, phased approach was chosen over one monolithic prompt for several critical reasons:
1. **Verifiable Increments:** By limiting the scope (e.g., "Build CRUD before building Sharing"), it becomes exponentially easier to verify database integrity and isolate bugs.
2. **Context Window Optimization:** Large files and complex logic (like debounced autosave side-by-side with Zod validation) often cause LLM hallucination or omission. Phased focus ensures maximum token density dedicated to solving localized, complex algorithmic challenges.
3. **Scope Control:** Having a predefined testing checklist per phase eliminates "feature creep" (e.g., preventing the AI from building an unauthorized profile-picture uploader when it should only be working on file imports).
