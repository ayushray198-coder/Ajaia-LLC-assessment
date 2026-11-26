# Draftly architecture

## Overview

Draftly is a modular monolith: one Express process and one MongoDB database, split into domain modules with explicit boundaries. The client is a React SPA organized into API, hook, page, component, route, layout and state folders. There is no realtime collaboration; concurrent edits are last-write-wins across different users.

## Frontend

- `api/` owns the Axios client, endpoint modules, Query client and query key shapes.
- `hooks/` owns authentication and document queries and mutations.
- `Pages/` contains sign-in, signup, dashboard and document editor screens; `Components/` contains shared UI and document, editor, sharing and import components.
- `routes/` owns route definitions and lazy page loading; `layout/` owns the workspace shell and sidebar.
- `store/slices/` separates the signed-in session or selected demo identity from sidebar UI state.

Redux Toolkit stores the signed-in token/user or selected demo identity and sidebar UI state. TanStack Query owns all server state, mutation results and cache invalidation. Axios sends a bearer token for accounts and the demo identity header for the optional demo workspace. The editor uses Tiptap JSON and a 750 ms debounce. Saves enter a serial promise queue so an earlier request cannot complete after and overwrite a later save from this editor instance. The server confirms each save before the UI reports it as saved.

## Backend modules and request lifecycle

- `auth/` registers and authenticates accounts, hashes passwords with Node scrypt, issues random expiring bearer sessions stored as SHA-256 hashes in MongoDB, and resolves optional seeded demo identities.
- `users/` stores accounts and exposes safe user fields; demo users are seeded with idempotent upserts.
- `documents/` owns the document schema, validation, repository, business rules, access policies and HTTP routes/controllers.
- `sharing/` owns share and revoke actions and calls document service interfaces for accessible document lookup and persistence.
- `file-import/` validates text uploads, converts a safe Markdown subset to Tiptap JSON and creates documents through the document service.
- `config/` loads local environment values and configures MongoDB and explicit CORS.
- `middleware/` applies consistent safe error and not-found responses.

Requests pass through Helmet, exact-origin CORS (including `Authorization` for account bearer tokens and `X-Demo-User` for the optional demo workspace), JSON size limits and rate limiting. Registration and login have an additional attempt limit. Private API routes resolve the persisted bearer session or controlled demo user, validate request data, apply document policies and return a consistent response. MongoDB failures are not returned to clients.

## Data model

`User` contains name, unique email, unique immutable `demoId`, initials, optional scrypt password hash and timestamps. `Document` contains a bounded title, structured Tiptap JSON, owner reference, shared user references and timestamps. Indexes support owner and shared-user lists sorted by update time. Demo users are upserted by `demoId` and are not duplicated on restart.

## Sharing and authorization

- Owners may read, edit, delete and share their documents.
- Shared users may have viewer or editor access; only owners can change access or share onward.
- Other signed-in users and demo users receive a safe not-found response for document reads/updates unless shared.
- Revoking sharing removes the database reference; subsequent requests fail access checks immediately.
- Demo identities can only be selected from the seeded allowlist; real accounts use random seven-day bearer sessions whose hashes are stored in MongoDB.

## Security measures

Helmet security headers, exact-origin CORS, API rate limiting, Zod input schemas, scrypt password hashes, opaque expiring sessions stored as hashes, a 1 MB import cap, bounded file extensions, allowlisted document update fields, Mongoose ObjectId checks, server-side access policies and generic internal errors. Production deployments require MongoDB read/write access and HTTPS; no token-signing secret environment variable is required.

## Tradeoffs and limits

- No realtime collaboration, comments, version history, rich Markdown parser or cloud uploads.
- File import supports `.txt` and a safe subset of Markdown headings and bullets; content is text and is never executed.
- Owners can grant viewer or editor access. Viewers can read but cannot edit, delete, or share; editors can read and edit but cannot delete or share. Only the owner can change roles or revoke access.
- MongoDB Atlas connectivity depends on the configured user, network allowlist and deployment environment.
- The single-process modular design can later extract users, documents or import behind service contracts if scale requires it; separate services and infrastructure are not justified for this assessment.
