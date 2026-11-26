# AI workflow notes

This is an editable engineering log for the assessment. Review it and adjust any notes to reflect the submitter's own process before submission.

## AI tools used

- OpenAI Codex assisted with workspace inspection, implementation and verification in this coding session.

## Tasks handled with AI assistance

- Reviewed the existing React/Vite starter and the supplied assessment requirements.
- Added the Express/Mongoose application structure, demo user seed, document routes, validation, access policy, import handling and safe middleware.
- Built the React workspace, Redux/TanStack Query wiring, Axios client, Tiptap editor, autosave, sharing dialog and file import flow.
- Added architecture, setup and deployment preparation documentation.

## Human review and editable notes

- Code and generated documentation should be reviewed by the submitter before delivery.
- Add the specific changes you personally made after reviewing the AI-generated implementation: **[edit this section]**.
- Add any AI suggestions you rejected or modified: **[edit this section]**.
- Confirm that the Atlas account, network allowlist and local demo data were checked by you: **[edit this section]**.

## Issues discovered during implementation

- The workspace path includes `&`, which caused Windows npm executable shims to misparse paths. Frontend scripts and the backend Nodemon script now call local Node entry points directly, and Windows setup instructions use `npm.cmd`.
- Final deployment review found that the Express CORS allowlist omitted the `Authorization` header used by account sessions. The allowlist now includes bearer auth and a regression test verifies the browser preflight.
- The Vercel review also found the SPA had no deep-link fallback and Render setup notes omitted the required production token secret. Added the Vercel rewrite and documented `NODE_ENV` plus a private `AUTH_TOKEN_SECRET` for Render.
- Populated Mongoose owner/shared-user references require policy checks to compare their `_id`; this was corrected and covered by the authorization-policy tests.
- Initial Vite output placed the editor and dashboard in one large bundle. Major routes and Tiptap dependencies were split into lazy chunks; the final build has no chunk-size warning.
- npm audit reported two moderate development-only Nodemon/minimatch advisories. The compatible fix pinned Nodemon to 3.1.11; the final backend audit reported zero vulnerabilities.

## Verification recorded in this session

- Backend automated tests: **8 passed** after adding direct coverage for viewer read-only permissions and bearer-token CORS preflight.
- Frontend lint: **passed**.
- Frontend production build: **passed**, with no chunk-size warning after splitting the editor dependencies.
- Current live API smoke against the configured Atlas database passed signup/login/token auth, demo switching, document persistence/search, viewer/editor permissions, revoke, Markdown import and cleanup; the temporary account and documents were removed.
