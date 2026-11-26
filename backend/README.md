# Draftly API

Express and Mongoose API for the Draftly document workspace. For full API, architecture and deployment notes, see [the project README](../README.md) and [ARCHITECTURE.md](../ARCHITECTURE.md).

## Local setup

1. Copy `.env.example` to `.env` and set `MONGODB_URI` to your Atlas connection string.
2. From this folder run `npm.cmd install`.
3. Run `npm.cmd run dev` to start with Nodemon, or `npm.cmd start` to start once.
4. Visit `http://localhost:5000/api/health` to confirm the database connection.

The first successful start seeds Ayush, Rahul and Priya idempotently for the optional demo workspace. Accounts created through signup use password hashing and signed bearer tokens. Set a private `AUTH_TOKEN_SECRET` before production deployment.

Run authorization and health checks with `npm.cmd test`.
