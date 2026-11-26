# Security setup and verification

The API verifies a persistent authentication session, account role, account revision, and resource access on every protected request. Browser API requests pass through the same-origin frontend proxy; browser session JSON contains identity and status only. Access tokens last 15 minutes. Refresh tokens rotate once per use, expire with the original session family, and revoke the family on replay. Logout and credential changes revoke sessions.

## Required deployment setup

- Set independent random `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXTAUTH_SECRET`, and `TOKEN_ENCRYPTION_KEY` values of at least 32 bytes. Generate each separately with `openssl rand -hex 32`. Store secrets in your deployment secret manager. Never use the example placeholders.
- Configure `BACKEND_API_URL` on the frontend, HTTPS `NEXTAUTH_URL`, and an explicit HTTPS `CORS_ORIGINS` allowlist on the API. Terminate HTTPS at a trusted reverse proxy. The API binds to `127.0.0.1` by default; change `HOST` explicitly for isolated container networks. Only enable `TRUST_PROXY=loopback` when the proxy is local and strips untrusted forwarded headers.
- Provide MongoDB credentials with access limited to this application's database, require authenticated/TLS database access outside local development, restrict network access, and maintain encrypted backups. Startup fails if MongoDB or required indexes cannot be initialized. Sessions and rate counters depend on this database.
- Run `npm ci` in both package directories. Native Argon2 installation requires its package installation step. Run `npm test`, frontend TypeScript/lint checks, `npm run build`, and `npm audit` in both directories before release.

## Account migration

Existing sessions must sign in again because authentication now requires a persistent session and the frontend token encryption format changed. Public administrator registration is disabled. Create the first administrator with `npm run bootstrap:admin`, supplying `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` through a private environment/secret manager. Unset bootstrap variables afterward. Additional administrator creation requires an authenticated administrator.

Teachers must be verified by an administrator before authoring or accessing student data: `POST /api/v1/admins/teacher-approvals` with `{ "teacher_id": "..." }`. Guardian links require administrator verification through `POST /api/v1/admins/guardian-links` with `{ "student_id": "...", "parent_id": "..." }`. Existing guardian relationships require re-verification. These endpoints accept only administrator sessions.

## Learning integrity and privacy

Assessments and quizzes accept `answers` keyed by question ID. Scores, pass status, points, and feedback are calculated on the server. Answer keys are omitted from student question responses and supplied after submission. Text/coding assessment answers use exact text comparison; submitted code is never executed. Lesson checkpoints remain visible as instructional practice; completion validates the current approved version and submitted checkpoint answers. This is not proof of watch time or an anti-cheating system. XP and course awards use atomic conditions to prevent duplicate awards.

Catalog responses contain lesson summaries. Student lesson responses exclude newer unpublished versions. Teacher and guardian access is scoped. Followers/friends post visibility is enforced, and nonpublic posts cannot be redistributed through sharing. Profile uploads accept one genuine JPG, PNG, or WebP image of at most 4 MB with matching extension, MIME type, and signature.

Nonce-based CSP requires dynamic page rendering, so page shells are no longer statically cached. Keep multiple frontend processes on a shared session-rotation coordinator or sticky routing: concurrent refresh coordination is currently per process, while the backend's replay protection is shared in MongoDB. Generation concurrency and its bounded queue are also per process; use a dedicated durable worker for multi-instance job recovery.

The browser tests run isolated services on loopback ports 3100 and 5100 with a disposable local MongoDB database. They exercise persistent authentication, session refresh, teacher approval, class joining, and responsive rendering using sample accounts and authored sample lessons.

Automated checks reduce risk but do not establish absolute security. Live deployment still requires verified secrets, HTTPS, database configuration, and an operational review. Verification uses isolated local services; live databases and model providers are not exercised.
