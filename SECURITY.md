# Security

## Reporting a vulnerability

Use **Security -> Report a vulnerability** on this repository to send a private
GitHub advisory to the maintainers. If that option is unavailable, request a
private contact channel from the repository owner without publishing the
vulnerability details. Do not include credentials or private documents in public
issues, pull requests, or logs.

Include the affected commit/version, configuration, impact, and a minimal
reproduction using synthetic data. Test only systems you own or are authorized
to assess. The project is pre-1.0; fixes target the current default branch, and
there is no guaranteed response time or support for older versions.

## Deployment model

KG Workbench currently targets trusted users on a controlled network. The shared
password/group gate is not a complete public multi-tenant authentication system.

- Unprotected mode (`APP_PASSWORD_PROTECTION_ENABLED=false`) gives every visitor
  read/write access to the `shared` workspace. Use it only for local development
  or an otherwise access-controlled installation.
- For network deployments, enable protection and set strong, unique passwords.
  Use TLS and restrict access at the reverse proxy. The gate has no built-in
  login rate limiting, individual accounts, or expiring server-side sessions.
- Database access uses a server-side Supabase service-role key. Never put it in
  a `NEXT_PUBLIC_*` variable or expose it to a browser. Group isolation is enforced
  in application code; the schema does not currently provide row-level security.
- Keep the Supabase API, database, Studio, and internal extractor private. The
  supplied Compose host ports bind to loopback. The SQL bootstrap grants broad
  privileges to API roles; do not expose the database API to untrusted clients.
- User-supplied external extractor URLs are fetched by the server. Only trusted
  users should be able to configure them; enforce outbound network restrictions
  before considering access for untrusted users.
- Uploaded documents and ontology content are sent to the selected extractor.
  Cloud model providers receive document content when selected. Use data you are
  permitted to send and choose a local provider where required.
- The internal extractor has no independent authentication or tenant isolation.
  Do not publish it directly on the Internet. Treat its logs and outputs as
  potentially containing document content or provider error details.

## Release checks

CI checks Git history for secrets and audits dependencies. These checks do not
establish that screenshots, PDFs, fixtures, or personal information are safe to
publish. Review those manually. See [the release checklist](docs/OPEN_SOURCE_RELEASE.md).
