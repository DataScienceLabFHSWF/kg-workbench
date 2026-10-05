# Contributing

Start with the local setup in [README.md](README.md). Use Node.js 22, the pnpm
version declared in `package.json`, and Python 3.11-3.13 with uv for the extractor.
Keep JavaScript dependencies in `pnpm-lock.yaml`; do not add an npm lockfile.

## Changes and verification

Discuss substantial changes in an issue first. Keep pull requests focused and
describe the problem, resulting behavior, and verification performed. Include
screenshots for visual changes and regression tests for behavior changes.

```bash
pnpm install --frozen-lockfile
pnpm check
uv sync --project services/internal-extractor --locked
uv run --directory services/internal-extractor --locked pytest
```

The web checks include lint, TypeScript, regression tests, and a production build.
The extractor tests mock model providers and do not require API keys or paid calls.
Run `pnpm check:all` for the complete local web, extractor, dependency-audit, and
secret-scan suite. It requires `uv` and downloads the pinned Gitleaks release
automatically; use `pnpm check:all -- --database` only with a disposable Supabase
CLI database.
Database changes also need a reset against a disposable local Supabase instance;
never reset a database containing data you need to keep.

Follow [the architecture](docs/agents/architecture.md) and the existing feature
patterns. Update the affected feature README when its behavior or structure changes.
Give every migration a unique timestamp. Add new migrations for existing schemas
instead of changing previously applied migrations. Regenerate database types after
schema changes.

## Dependencies

```bash
pnpm deps:update
pnpm check
pnpm audit
```

`npm run deps:update` runs the same script and supplies the pinned pnpm version if needed. It calls
`pnpm update --latest`, updating JavaScript runtime and development dependencies,
including major versions. Review breaking changes and both `package.json` and
`pnpm-lock.yaml`. For updates within existing version ranges, use `pnpm update`.

Python has its own dependency graph:

```bash
uv lock --project services/internal-extractor --upgrade
uv sync --project services/internal-extractor --locked
uv run --directory services/internal-extractor --locked pytest
```

Commit lockfiles with dependency changes. Dependency updates do not update Node,
Python, Docker image tags, or the pinned package-manager version automatically.

## Data, security, and licensing

Use synthetic or redistributable examples. Do not commit credentials, local
environment files, private documents, screenshots containing personal data, logs,
or tool caches. Report vulnerabilities using [SECURITY.md](SECURITY.md).

Submit only material you have the right to contribute. Contributions to the
project's own code use [MIT](LICENSE.txt); preserve the licenses and notices of
third-party material. Follow [the code of conduct](CODE_OF_CONDUCT.md).
