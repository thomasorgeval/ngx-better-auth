# Agent Notes

## Repo Shape
- This is a single Angular library package, not an app workspace; `angular.json` has one library project rooted at `.` with sources in `src/`.
- Public package exports flow through `src/public-api.ts`; add new exported services/models/guards/validators there via the relevant `src/lib/**/index.ts` barrel.
- `ng-packagr` builds from `ng-package.json` into `dist/ngx-better-auth`; `dist/`, `.angular/`, and `node_modules/` are generated/ignored.

## Commands
- Use pnpm; `packageManager` is `pnpm@10.15.0` and CI runs Node 24.
- Primary verification: `pnpm build` (`ng build`, production/partial compilation by default).
- Watch build: `pnpm watch`.
- Better Auth compatibility smoke test: `pnpm compat:better-auth --default`; pass explicit versions like `pnpm compat:better-auth 1.6.10 1.6.19` or add `--skip-build` after a fresh `pnpm build`.
- There is currently no configured `test`, `lint`, or `typecheck` npm script/Angular target; do not claim one exists. The lone `.spec.ts` is not wired to a test runner in config.

## Compatibility Boundaries
- Peer range is Angular `>=20.0.0`, Better Auth `>=1.6.10 <1.7.0`, RxJS `>=7.8.0`.
- `@better-auth/passkey` and `@better-auth/stripe` are optional peer dependencies; keep their imports isolated to the passkey/stripe services or compatibility smoke code.
- CI runs `pnpm compat:better-auth --default` on pushes/PRs to `main`; scheduled runs also include `latest` even outside the peer range and are allowed to fail.

## Implementation Conventions
- `provideBetterAuth()` supplies `BETTER_AUTH_CONFIG_TOKEN` and `AuthService`; `MainService` creates the Better Auth client and shared response/resource helpers.
- `provideBetterAuth()` rewrites a non-HTTP `baseURL` to `window.location.origin`; preserve this proxy-development behavior unless intentionally changing setup semantics.
- Plugin services validate the expected dynamic client property in their constructor with `validatePlugin(client, '<property>')`; follow that pattern for new plugin wrappers.
- Read/list APIs generally expose both an `Observable` method and an Angular `ResourceRef` factory; mutations remain `Observable` workflows.
- Existing Angular style guidance lives in `.github/copilot-instructions.md`; notable local rules are `inject()` over constructor injection and do not set `standalone: true` explicitly.

## Formatting And Release Gotchas
- Prettier uses 2 spaces and print width 120; TypeScript uses single quotes and no semicolons.
- `update.sh <version>` edits `package.json`, commits, tags, and pushes to `main`; do not run it unless the user explicitly asks for a release.
- Tags matching `v*` publish `dist/ngx-better-auth` to npm; tags matching `v*.*.*`/`v*.*.*-beta.*` also create GitHub releases.
