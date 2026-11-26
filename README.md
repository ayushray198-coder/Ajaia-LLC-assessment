# Draftly

Draftly is a document workspace for writing, organizing and sharing ideas. It stores rich-text documents in MongoDB Atlas and keeps the editor and API in one local development workflow.

## Features

- Create, rename, edit, reopen and delete documents
- Tiptap rich text: headings, bold, italic, underline, lists, alignment, undo and redo
- Debounced server-confirmed autosave with save status
- Sign up and sign in with an account, or explore the seeded demo workspace
- Share documents with other Draftly accounts as viewers or editors; owners can change roles or remove access
- Search owned and shared document titles
- Import `.txt` and `.md` files up to 1 MB
- Download documents as Markdown (`.md`) or plain text (`.txt`)
- Responsive workspace with loading, empty and error states

## Stack

- Frontend: React, Vite, Tailwind CSS, React Router, Redux Toolkit, TanStack Query, Axios, Tiptap, React Hook Form and Zod
- Backend: Node.js, Express, Mongoose, MongoDB Atlas and Zod
- Security: Helmet, explicit CORS origin, API rate limiting, scrypt password hashes, expiring signed tokens, server-side validation and centralized safe errors

## Project structure

```text
backend/
  src/
    app.js
    server.js
    config/                 # environment, CORS, database
    middleware/             # request error and not-found responses
    modules/
      auth/                 # registration, login, tokens and demo identity
      users/                # user model, repository, account and demo users
      documents/            # model, validation, repository, policy and document API
      sharing/              # sharing grants and revocation
      file-import/          # safe text and Markdown conversion
    shared/errors/
  tests/
frontend/
  src/
    api/                    # Axios client, endpoint modules and query config
    Components/             # shared UI plus document/editor components
    hooks/                  # auth and document query/mutation hooks
    Pages/                  # auth, dashboard and document editor screens
    routes/                 # route definitions and lazy page loading
    store/slices/           # Redux auth session and UI slices
    layout/                 # workspace shell and sidebar
    styles/
```

## Requirements

- Node.js 20.19+ or 22.12+ (Vite 8 requirement; Node 24 is also supported)
- npm
- MongoDB Atlas access, or another MongoDB URI

## Environment setup

1. Copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI` to your Atlas connection string. The database user needs read/write access and your current IP must be allowed in Atlas Network Access.
2. `MONGODB_DATABASE` defaults to `atlas_app`.
3. Set `CLIENT_ORIGIN` to the exact frontend origin in deployment. It defaults to `http://localhost:5173` locally.
4. Copy `frontend/.env.example` to `frontend/.env` only if you need a separately hosted API; set `VITE_API_URL` to that API origin plus `/api`. Locally, Vite proxies `/api` to port 5000.

The supplied Atlas credentials are stored only in the ignored local `backend/.env`; never commit that file.

## Run locally

In separate terminals:

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

Open the URL printed by Vite (normally `http://localhost:5173`). The API starts on `http://localhost:5000`. The first backend start seeds Ayush, Rahul and Priya if they do not already exist. Check API and database status at `http://localhost:5000/api/health`.

`npm.cmd` avoids the PowerShell script-policy issue on Windows. The frontend scripts call local Node entry points directly because the project folder contains `&` (`E:\test-R&T`), which breaks Windows npm `.cmd` shims.

## Demo users

Use the sidebar account selector to switch among:

| Name | Demo identifier | Email |
| --- | --- | --- |
| Ayush | `ayush` | `ayush@draftly.demo` |
| Rahul | `rahul` | `rahul@draftly.demo` |
| Priya | `priya` | `priya@draftly.demo` |

These seeded identities are for the optional demo workspace. Use signup and login for personal accounts. Demo users do not have passwords and cannot be used to sign in with the login form.

## API

Private API requests use a bearer token from signup/login. The optional demo workspace uses the `X-Demo-User` header (`ayush`, `rahul` or `priya`). Success responses use `{ success: true, data }`. Errors include a safe message and code.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | API and database health |
| POST | `/api/auth/register` | Create an account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Sign in (`email`, `password`) |
| GET | `/api/auth/me` | Current signed-in user |
| POST | `/api/auth/switch` | Validate a demo-user switch |
| GET | `/api/users` | List available collaborators |
| GET | `/api/documents?q=term` | List owned and shared documents |
| POST | `/api/documents` | Create a document |
| GET | `/api/documents/:id` | Read an accessible document |
| PATCH | `/api/documents/:id` | Update title or Tiptap JSON content |
| DELETE | `/api/documents/:id` | Owner-only delete |
| POST | `/api/documents/:id/share` | Owner shares with another account (`{ "userId": "...", "role": "viewer" | "editor" }`) |
| PATCH | `/api/documents/:id/share/:userId` | Owner changes a collaborator's role (`{ "role": "viewer" | "editor" }`) |
| DELETE | `/api/documents/:id/share/:userId` | Owner revokes access |
| POST | `/api/documents/import` | Import plain text (`{ "fileName": "notes.md", "content": "..." }`) |

## Tests and build

```powershell
cd backend
npm.cmd test
```

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

## Deployment preparation

The app is prepared for a Vercel frontend, Render API and MongoDB Atlas database; it has not been deployed.

- **Render:** create a Node web service from `backend`; build command `npm install`, start command `npm start`; set `NODE_ENV=production`, `MONGODB_URI`, a private random `AUTH_TOKEN_SECRET` (at least 32 characters), and `CLIENT_ORIGIN` (the deployed Vercel origin). `MONGODB_DATABASE` is optional (`atlas_app` by default); Render supplies `PORT`.
- **Vercel:** set the project root to `frontend`, build command `npm run build`, output directory `dist`; set `VITE_API_URL` to `https://<your-render-service>/api`. `frontend/vercel.json` rewrites app routes to the SPA entry so direct document links and refreshes work. Since this is cross-origin, set backend `CLIENT_ORIGIN` to the deployed Vercel origin.
- **Atlas:** allow the Render service network and create a least-privilege database user. Do not use a broad IP allowlist for production.
- Verify `/api/health` reports `database: connected` after deployment.

See [ARCHITECTURE.md](./ARCHITECTURE.md), [AI_WORKFLOW.md](./AI_WORKFLOW.md) and [SUBMISSION.md](./SUBMISSION.md) for design notes and current handoff status.
