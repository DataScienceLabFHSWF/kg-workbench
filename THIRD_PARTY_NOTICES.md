# Third-party notices

The project's MIT license applies to its own contributions. Third-party software
and copied or adapted source retain their upstream licenses.

## shadcn/ui

UI components under `src/components/ui/` include source based on
[shadcn/ui](https://github.com/shadcn-ui/ui).

Copyright (c) 2023 shadcn. Licensed under MIT; the upstream license is included in
[LICENSES/shadcn-MIT.txt](LICENSES/shadcn-MIT.txt).

## Supabase deployment bundle

The deployment bundle under `deploy/supabase/` contains files adapted from the
[Supabase self-hosting Docker distribution](https://github.com/supabase/supabase/tree/master/docker).
Local changes include the reduced service set, environment wiring, SQL bootstrap,
gateway configuration, and migration tooling described in the bundle's README.

Copyright 2024 Supabase. Licensed under Apache-2.0; the upstream license is included
in [LICENSES/Supabase-Apache-2.0.txt](LICENSES/Supabase-Apache-2.0.txt).

## Installed dependencies

JavaScript and Python dependencies are recorded in `pnpm-lock.yaml` and
`services/internal-extractor/uv.lock`. Their license texts and notices remain part
of their distributions. This file records known vendored source; it is not an
exhaustive license inventory of all transitive dependencies or container images.
