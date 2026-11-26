# Draftly assessment handoff

## Completed

- Account signup/login with scrypt password hashing and expiring signed bearer tokens; optional seeded Ayush, Rahul and Priya demo identities.
- Create, rename, format, search, reopen and delete persistent MongoDB documents.
- Tiptap JSON editor with headings, lists, inline formatting, alignment, undo/redo and queued, debounced server-confirmed autosave.
- Share with another account or demo user as viewer/editor; owners can change roles and revoke access. Backend policies enforce read/edit/delete/share permissions.
- Import `.txt` and `.md` files (up to 1 MB) into editable documents.
- Download documents as Markdown or plain text, with a sanitized filename based on the title.
- Responsive workspace/editor, loading/error/empty states, neutral dark theme, and centralized API/query/state wiring.
- Modular Express/Mongoose backend, validation, Helmet, exact-origin CORS, rate limiting and safe API errors.

## Partially complete / scope choices

- Concurrent editing is last-write-wins; there is no realtime collaboration, comments, version history or live cursors, as excluded by the assessment scope.
- Markdown import supports a safe subset: headings and bullet lists, with remaining text imported as paragraphs.
- Frontend uses JavaScript and Tailwind CSS, with styles authored through the existing application stylesheet. Automated tests currently focus on backend access policy and API safety; there are no frontend component tests or database-backed API integration tests in the repository.

## Verification run for this handoff

- Backend `npm.cmd test`: **8 passed, 0 failed**. Includes owner/shared/outsider access policy, viewer restrictions, owner-only delete/share, revocation policy, health response, bearer-token CORS preflight, rejection of arbitrary demo identities and malformed JSON handling.
- Frontend `npm.cmd run lint`: **passed**.
- Frontend `npm.cmd run build`: **passed** (Vite production build).
- The existing local API `/api/health` check: **passed**, MongoDB reported connected. A second `npm.cmd start` connected to MongoDB but then exited with `EADDRINUSE`, confirming port 5000 was already occupied by the running backend; I left that existing process untouched.
- Live API smoke against the configured database: **passed** for account signup/login/current-user token auth (temporary account removed), demo switching, create/edit/read persistence, title search, viewer/editor access, viewer edit denial, collaborator delete denial, revoke-immediate-access, Markdown import structure and cleanup of all temporary documents.

## Demo users and local run

Seeded demo identities: Ayush (`ayush`), Rahul (`rahul`) and Priya (`priya`). They are controlled demo sessions, not password accounts. Create an account through signup for a personal account.

Copy `backend/.env.example` to `backend/.env`, set MongoDB connection values and a private `AUTH_TOKEN_SECRET`, then run in separate terminals:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

See [README.md](./README.md) for environment details, API endpoints, tests and deployment steps.

## Deployment and walkthrough

Deployment instructions for Vercel, Render and MongoDB Atlas are prepared. No live deployment has been completed or verified.

- Live URL: **[add after deployment]**
- Walkthrough URL: **[add after recording]**
- Video link: see `VIDEO_LINK.txt`

## Remaining manual tasks

- Review the implementation and editable notes in `AI_WORKFLOW.md` and add your own review notes.
- Record and add the walkthrough URL.
- Deploy using the documented steps, configure `NODE_ENV=production`, `MONGODB_URI`, private `AUTH_TOKEN_SECRET` (at least 32 characters), and the exact frontend `CLIENT_ORIGIN`; then verify the deployed flows.
