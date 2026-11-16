# Profile authentication: V1.8 boundary and production migration

V1.8 is a **local demo**: usernames, salted derived passphrase verifiers, local progress and points live inside this browser. It is intentionally not called online registration or a global ranking service. Any person with access to local browser storage can alter saved points or erase them; in private-browsing mode storage may disappear. Do not enter a password reused for other accounts.

The passphrase is processed by Web Crypto PBKDF2-SHA256 (180,000 iterations with per-account random salt) on secure origins; it is not kept as plaintext. This protection does not make the frontend a trusted authentication server.

For a real cross-device account system:
1. Pick a managed identity provider (e.g. a hosted identity service with password-reset support) or a self-hosted backend with a proven authentication library.
2. Serve the web application over HTTPS and keep authentication secrets only on a trusted server; issue secure, scoped sessions.
3. Store user ID, server-validated mission reports and points in a database with per-user access control.
4. Validate missions/rules server-side before crediting leaderboards; add rate limits, abuse review and migration from guest saves.
5. Provide account deletion, privacy disclosure, password recovery, appropriate parental/age handling, and backups.
6. If real multiplayer is needed, add room invitations, authoritative room state and reconnection, not merely role labels.

The itch.io HTML5 ZIP is static hosting: these steps require an independent service and are **not included** in V1.8.
