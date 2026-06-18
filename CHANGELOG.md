# Changelog

All notable changes to this project will be documented in this file.

## [1.6.0] - 2026-06-18

### Added

- Added the Better Auth 1.6 compatibility line for `ngx-better-auth`.
- Added `@better-auth/passkey` as an optional peer dependency for `PasskeyService`.
- Added migration documentation for Better Auth 1.6, SIWE, and Passkey users.

### Changed

- Changed the Better Auth peer dependency to `>=1.6.10 <1.7.0`.
- Updated development validation dependencies to `better-auth@1.6.19` and `@better-auth/passkey@1.6.19`.
- Updated `SiweService.getNonce(...)` to call Better Auth's `siwe.getNonce(...)` client API.
- Updated Passkey types to import from `@better-auth/passkey` after Better Auth's package split.
- Updated `provideBetterAuth(...)` to use Better Auth client options instead of server options.
- Removed the Karma/Jasmine test setup from the project configuration.

### Fixed

- Propagated Better Auth client errors from auth service methods instead of silently ignoring them.
- Fixed package typings that previously exposed non-nameable Better Auth internal client types.

### Migration Notes

- `better-auth@1.6.10` is the minimum supported version because earlier `1.6.x` releases do not expose `siwe.getNonce` / `/siwe/get-nonce`.
- If you use Passkey, install the split package and update client imports:

```bash
pnpm add @better-auth/passkey
```

```ts
import { passkeyClient } from '@better-auth/passkey/client'
```

[1.6.0]: https://github.com/thomasorgeval/ngx-better-auth/compare/v0.11.0...v1.6.0
