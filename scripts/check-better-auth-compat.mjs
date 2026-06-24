#!/usr/bin/env node

import { spawnSync } from 'node:child_process'
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const rootPackage = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'))
const distDir = join(repoRoot, 'dist', 'ngx-better-auth')

const optionalPluginPackages = [
  '@better-auth/api-key',
  '@better-auth/oauth-provider',
  '@better-auth/passkey',
  '@better-auth/scim',
  '@better-auth/sso',
  '@better-auth/stripe',
]

const secondaryEntrypoints = ['api-key', 'oauth-provider', 'passkey', 'scim', 'sso', 'stripe']

const args = process.argv.slice(2)
const flags = new Set(args.filter((arg) => arg.startsWith('--')))
const explicitBetterAuthVersions = args
  .filter((arg) => !arg.startsWith('--'))
  .flatMap((arg) => arg.split(','))
  .map((arg) => arg.trim())
  .filter(Boolean)
const usesDefaultVersions = flags.has('--default')
const includeLatest = flags.has('--include-latest')

if ((explicitBetterAuthVersions.length === 0 && !usesDefaultVersions) || flags.has('--help')) {
  console.log(`Usage: pnpm compat:better-auth <version|range|tag> [--skip-build] [--core-only] [--keep-temp] [--verbose]
       pnpm compat:better-auth --default [--include-latest]

Examples:
  pnpm compat:better-auth --default
  pnpm compat:better-auth --default --include-latest
  pnpm compat:better-auth 1.6.19
  pnpm compat:better-auth 1.6.9 1.6.10 1.6.19
  pnpm compat:better-auth 1.6.9,1.6.10,1.6.19
  pnpm compat:better-auth latest
  pnpm compat:better-auth "1.6.x" --skip-build
  pnpm compat:better-auth 1.6.19 --verbose
`)
  process.exit(explicitBetterAuthVersions.length > 0 || usesDefaultVersions ? 0 : 1)
}

const keepTemp = flags.has('--keep-temp')
const coreOnly = flags.has('--core-only')
const skipBuild = flags.has('--skip-build')
const verbose = flags.has('--verbose')

function run(label, command, commandArgs, options = {}) {
  process.stdout.write(`${label}... `)

  const result = spawnSync(command, commandArgs, {
    cwd: options.cwd ?? repoRoot,
    env: process.env,
    encoding: 'utf8',
    stdio: verbose ? 'inherit' : 'pipe',
    shell: false,
  })

  if (result.error) {
    console.log('failed')
    throw result.error
  }

  if (result.status !== 0) {
    console.log('failed')
    if (!verbose) {
      const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
      if (output) {
        console.log(`\n${formatCommandOutput(output)}`)
      }
    }
    throw new Error(`${command} ${commandArgs.join(' ')} failed with exit code ${result.status}`)
  }

  console.log('ok')
}

function formatCommandOutput(output) {
  if (output.includes('ERR_PNPM_PEER_DEP_ISSUES')) {
    const peerLines = output
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.includes('unmet peer'))

    if (peerLines.length > 0) {
      return ['Unmet peer dependencies:', ...peerLines].join('\n')
    }
  }

  return output.split('\n').slice(-40).join('\n')
}

function devDependency(name) {
  const version =
    rootPackage.devDependencies?.[name] ?? rootPackage.dependencies?.[name] ?? rootPackage.peerDependencies?.[name]

  if (!version) {
    throw new Error(`Missing ${name} in root package.json dependencies`)
  }

  return version
}

function writeJson(filePath, value) {
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function copyPnpmWorkspace(targetDir) {
  const workspaceFile = join(repoRoot, 'pnpm-workspace.yaml')

  if (existsSync(workspaceFile)) {
    cpSync(workspaceFile, join(targetDir, 'pnpm-workspace.yaml'))
  }
}

function parseVersion(version) {
  const match = String(version).trim().replace(/^[~^=v]+/, '').match(/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/)
  if (!match) {
    return null
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: `${match[1]}.${match[2]}.${match[3]}`,
  }
}

function compareVersions(a, b) {
  const parsedA = parseVersion(a)
  const parsedB = parseVersion(b)

  if (!parsedA || !parsedB) {
    throw new Error(`Cannot compare versions: ${a}, ${b}`)
  }

  return parsedA.major - parsedB.major || parsedA.minor - parsedB.minor || parsedA.patch - parsedB.patch
}

function satisfiesComparator(version, comparator) {
  const match = comparator.trim().match(/^(>=|>|<=|<|=)?\s*(\d+\.\d+\.\d+)$/)
  if (!match) {
    return true
  }

  const operator = match[1] ?? '='
  const comparison = compareVersions(version, match[2])

  if (operator === '>=') return comparison >= 0
  if (operator === '>') return comparison > 0
  if (operator === '<=') return comparison <= 0
  if (operator === '<') return comparison < 0
  return comparison === 0
}

function satisfiesRange(version, range) {
  if (!parseVersion(version)) {
    return false
  }

  return range
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .every((part) => satisfiesComparator(version, part))
}

function minVersionFromRange(range) {
  const lowerBound = range
    .split(/\s+/)
    .map((part) => part.trim())
    .map((part) => part.match(/^>=\s*(\d+\.\d+\.\d+)$/)?.[1])
    .find(Boolean)

  if (!lowerBound) {
    throw new Error(`Cannot infer minimum Better Auth version from peer range: ${range}`)
  }

  return lowerBound
}

function npmViewJson(packageName, field) {
  const result = spawnSync('pnpm', ['view', packageName, field, '--json'], {
    cwd: repoRoot,
    env: process.env,
    encoding: 'utf8',
    stdio: 'pipe',
    shell: false,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    const output = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`pnpm view ${packageName} ${field} failed${output ? `\n${formatCommandOutput(output)}` : ''}`)
  }

  return JSON.parse(result.stdout)
}

function maxPublishedSatisfying(packageName, range) {
  const versions = npmViewJson(packageName, 'versions')

  if (!Array.isArray(versions)) {
    throw new Error(`Unexpected npm versions response for ${packageName}`)
  }

  const maxVersion = versions
    .filter((version) => parseVersion(version) && satisfiesRange(version, range))
    .sort(compareVersions)
    .at(-1)

  if (!maxVersion) {
    throw new Error(`No published ${packageName} version satisfies ${range}`)
  }

  return maxVersion
}

function resolveDefaultBetterAuthVersions() {
  const peerRange = rootPackage.peerDependencies?.['better-auth']
  if (!peerRange) {
    throw new Error('Missing better-auth peer dependency')
  }

  const versions = [minVersionFromRange(peerRange)]
  const devVersion = rootPackage.devDependencies?.['better-auth']

  if (devVersion && parseVersion(devVersion) && satisfiesRange(devVersion, peerRange)) {
    versions.push(parseVersion(devVersion).raw)
  }

  versions.push(maxPublishedSatisfying('better-auth', peerRange))

  if (includeLatest) {
    versions.push('latest')
  }

  return [...new Set(versions)]
}

function smokeSources(includeOptionalPlugins) {
  const optionalTypeImports = includeOptionalPlugins
    ? `
import { apiKeyClient } from '@better-auth/api-key/client'
import { oauthProviderClient } from '@better-auth/oauth-provider/client'
import { ApiKeyService } from 'ngx-better-auth/api-key'
import { OAuthProviderService } from 'ngx-better-auth/oauth-provider'
import { PasskeyService } from 'ngx-better-auth/passkey'
import { ScimService } from 'ngx-better-auth/scim'
import { SsoService } from 'ngx-better-auth/sso'
import { StripeService } from 'ngx-better-auth/stripe'
import { scimClient } from '@better-auth/scim/client'
import { ssoClient } from '@better-auth/sso/client'
import type { Passkey } from '@better-auth/passkey'
import { passkeyClient } from '@better-auth/passkey/client'
import { stripeClient } from '@better-auth/stripe/client'
`
    : ''

  const optionalReferences = includeOptionalPlugins
    ? `
  ApiKeyService,
  OAuthProviderService,
  PasskeyService,
  ScimService,
  SsoService,
  StripeService,
  apiKeyClient,
  oauthProviderClient,
  passkeyClient,
  scimClient,
  ssoClient,
  stripeClient,
] satisfies unknown[]

const passkey = null as Passkey | null
void passkey
`
    : `
] satisfies unknown[]
`

  const typecheck = `
import type { BetterAuthClientOptions } from 'better-auth/client'
import { anonymousClient, emailOTPClient, magicLinkClient, multiSessionClient, oneTapClient, organizationClient, siweClient, twoFactorClient, usernameClient } from 'better-auth/client/plugins'
import {
  AccountService,
  AnonymousService,
  AuthService,
  EmailOtpService,
  MagicLinkService,
  MultiSessionService,
  OrganizationService,
  SessionService,
  TwoFactorService,
  UsernameService,
  canActivate,
  provideBetterAuth,
} from 'ngx-better-auth'
${optionalTypeImports}

const options = {
  baseURL: 'http://localhost:3000',
} satisfies BetterAuthClientOptions

const providers = provideBetterAuth(options)
void providers

const exportedSurface = [
  AccountService,
  AnonymousService,
  AuthService,
  EmailOtpService,
  MagicLinkService,
  MultiSessionService,
  OrganizationService,
  SessionService,
  TwoFactorService,
  UsernameService,
  anonymousClient,
  emailOTPClient,
  magicLinkClient,
  multiSessionClient,
  oneTapClient,
  organizationClient,
  siweClient,
  twoFactorClient,
  usernameClient,
  canActivate,
${optionalReferences}

void exportedSurface
`

  const runtimeOptionalImports = includeOptionalPlugins
    ? `
await import('@better-auth/api-key/client')
await import('@better-auth/oauth-provider/client')
await import('@better-auth/passkey/client')
await import('@better-auth/scim/client')
await import('@better-auth/sso/client')
await import('@better-auth/stripe/client')
`
    : ''

  const runtime = `
await import('@angular/compiler')
await import('ngx-better-auth')
await import('better-auth/client')
await import('better-auth/client/plugins')
${runtimeOptionalImports}

console.log('runtime imports ok')
`

  return { runtime, typecheck }
}

function betterAuthApiContractSource() {
  return `
import { createAuthClient } from 'better-auth/client'
import { organizationClient, siweClient } from 'better-auth/client/plugins'

const client = createAuthClient({
  baseURL: 'http://localhost:3000',
  plugins: [
    organizationClient({
      teams: { enabled: true },
      dynamicAccessControl: { enabled: true },
    }),
    siweClient(),
  ],
})

const organizationId = 'org-id'
const organizationSlug = 'org-slug'

const organizationCalls = [
  client.organization.create({
    name: 'Acme',
    slug: organizationSlug,
    logo: 'https://example.com/logo.png',
    metadata: { source: 'compat' },
    keepCurrentActiveOrganization: true,
  }),
  client.organization.checkSlug({ slug: organizationSlug }),
  client.organization.list(),
  client.organization.setActive({ organizationId }),
  client.organization.setActive({ organizationSlug }),
  client.organization.getFullOrganization({ query: { organizationId, membersLimit: 10 } }),
  client.organization.update({
    data: { name: 'Acme Inc', slug: organizationSlug, logo: 'https://example.com/logo.png' },
    organizationId,
  }),
  client.organization.delete({ organizationId }),
  client.organization.inviteMember({
    email: 'member@example.com',
    role: ['member'],
    organizationId,
    resend: true,
    teamId: 'team-id',
  }),
  client.organization.acceptInvitation({ invitationId: 'invitation-id' }),
  client.organization.cancelInvitation({ invitationId: 'invitation-id' }),
  client.organization.rejectInvitation({ invitationId: 'invitation-id' }),
  client.organization.getInvitation({ query: { id: 'invitation-id' } }),
  client.organization.listInvitations({ query: { organizationId } }),
  client.organization.listUserInvitations(),
  client.organization.listMembers({
    query: {
      organizationId,
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      filterField: 'email',
      filterOperator: 'contains',
      filterValue: 'example.com',
    },
  }),
  client.organization.removeMember({ memberIdOrEmail: 'member@example.com', organizationId }),
  client.organization.updateMemberRole({ memberId: 'member-id', role: ['admin'], organizationId }),
  client.organization.getActiveMember(),
  client.organization.getActiveMemberRole({ query: { userId: 'user-id', organizationId, organizationSlug } }),
  client.organization.leave({ organizationId }),
  client.organization.hasPermission({
    organizationId,
    permissions: { organization: ['update'] },
  }),
  client.organization.createRole({
    role: 'editor',
    permission: { organization: ['update'] },
    organizationId,
    additionalFields: { description: 'Can edit organization' },
  }),
  client.organization.deleteRole({ organizationId, roleName: 'editor' }),
  client.organization.deleteRole({ organizationId, roleId: 'role-id' }),
  client.organization.listRoles({ query: { organizationId } }),
] satisfies unknown[]

void organizationCalls

const siweCalls = [
  client.siwe.getNonce({ walletAddress: '0x0000000000000000000000000000000000000000', chainId: 1 }),
] satisfies unknown[]

void siweCalls
`
}

function betterAuthRouteContractSource() {
  return `
import { organization } from 'better-auth/plugins'

const plugin = organization({
  teams: { enabled: true },
  dynamicAccessControl: { enabled: true },
})

const organizationId = 'org-id'
const organizationSlug = 'org-slug'

const routeCases = [
  {
    key: 'createOrganization',
    path: '/organization/create',
    method: 'POST',
    body: {
      name: 'Acme',
      slug: organizationSlug,
      logo: 'https://example.com/logo.png',
      metadata: { source: 'compat' },
      keepCurrentActiveOrganization: true,
    },
  },
  {
    key: 'checkOrganizationSlug',
    path: '/organization/check-slug',
    method: 'POST',
    body: { slug: organizationSlug },
  },
  {
    key: 'listOrganizations',
    path: '/organization/list',
    method: 'GET',
  },
  {
    key: 'setActiveOrganization',
    path: '/organization/set-active',
    method: 'POST',
    body: { organizationId },
  },
  {
    key: 'getFullOrganization',
    path: '/organization/get-full-organization',
    method: 'GET',
    query: { organizationId, membersLimit: 10 },
  },
  {
    key: 'updateOrganization',
    path: '/organization/update',
    method: 'POST',
    body: {
      data: { name: 'Acme Inc', slug: organizationSlug, logo: 'https://example.com/logo.png' },
      organizationId,
    },
  },
  {
    key: 'deleteOrganization',
    path: '/organization/delete',
    method: 'POST',
    body: { organizationId },
  },
  {
    key: 'createInvitation',
    path: '/organization/invite-member',
    method: 'POST',
    body: {
      email: 'member@example.com',
      role: ['member'],
      organizationId,
      resend: true,
      teamId: 'team-id',
    },
  },
  {
    key: 'acceptInvitation',
    path: '/organization/accept-invitation',
    method: 'POST',
    body: { invitationId: 'invitation-id' },
  },
  {
    key: 'cancelInvitation',
    path: '/organization/cancel-invitation',
    method: 'POST',
    body: { invitationId: 'invitation-id' },
  },
  {
    key: 'rejectInvitation',
    path: '/organization/reject-invitation',
    method: 'POST',
    body: { invitationId: 'invitation-id' },
  },
  {
    key: 'getInvitation',
    path: '/organization/get-invitation',
    method: 'GET',
    query: { id: 'invitation-id' },
  },
  {
    key: 'listInvitations',
    path: '/organization/list-invitations',
    method: 'GET',
    query: { organizationId },
  },
  {
    key: 'listUserInvitations',
    path: '/organization/list-user-invitations',
    method: 'GET',
  },
  {
    key: 'listMembers',
    path: '/organization/list-members',
    method: 'GET',
    query: {
      organizationId,
      limit: 10,
      offset: 0,
      sortBy: 'createdAt',
      sortDirection: 'desc',
      filterField: 'email',
      filterOperator: 'contains',
      filterValue: 'example.com',
    },
  },
  {
    key: 'removeMember',
    path: '/organization/remove-member',
    method: 'POST',
    body: { memberIdOrEmail: 'member@example.com', organizationId },
  },
  {
    key: 'updateMemberRole',
    path: '/organization/update-member-role',
    method: 'POST',
    body: { memberId: 'member-id', role: ['admin'], organizationId },
  },
  {
    key: 'getActiveMember',
    path: '/organization/get-active-member',
    method: 'GET',
  },
  {
    key: 'getActiveMemberRole',
    path: '/organization/get-active-member-role',
    method: 'GET',
    query: { userId: 'user-id', organizationId, organizationSlug },
  },
  {
    key: 'leaveOrganization',
    path: '/organization/leave',
    method: 'POST',
    body: { organizationId },
  },
  {
    key: 'hasPermission',
    path: '/organization/has-permission',
    method: 'POST',
    body: { organizationId, permissions: { organization: ['update'] } },
  },
  {
    key: 'createOrgRole',
    path: '/organization/create-role',
    method: 'POST',
    body: {
      role: 'editor',
      permission: { organization: ['update'] },
      organizationId,
      additionalFields: { description: 'Can edit organization' },
    },
  },
  {
    key: 'deleteOrgRole',
    path: '/organization/delete-role',
    method: 'POST',
    body: { organizationId, roleName: 'editor' },
  },
  {
    key: 'listOrgRoles',
    path: '/organization/list-roles',
    method: 'GET',
    query: { organizationId },
  },
]

for (const routeCase of routeCases) {
  const endpoint = plugin.endpoints?.[routeCase.key]
  if (!endpoint) {
    throw new Error(\`Missing organization endpoint: \${routeCase.key}\`)
  }

  if (endpoint.path !== routeCase.path) {
    throw new Error(\`\${routeCase.key} path changed: expected \${routeCase.path}, got \${endpoint.path}\`)
  }

  const method = endpoint.options?.method
  if (method !== routeCase.method) {
    throw new Error(\`\${routeCase.key} method changed: expected \${routeCase.method}, got \${method}\`)
  }

  if ('body' in routeCase) {
    const parsed = endpoint.options?.body?.safeParse(routeCase.body)
    if (!parsed?.success) {
      throw new Error(\`\${routeCase.key} body schema rejected ngx-better-auth payload: \${JSON.stringify(parsed?.error?.issues ?? parsed)}\`)
    }
  }

  if ('query' in routeCase) {
    const parsed = endpoint.options?.query?.safeParse(routeCase.query)
    if (!parsed?.success) {
      throw new Error(\`\${routeCase.key} query schema rejected ngx-better-auth payload: \${JSON.stringify(parsed?.error?.issues ?? parsed)}\`)
    }
  }
}

console.log('better-auth route contract ok')
`
}

const tempRoot = mkdtempSync(join(tmpdir(), 'ngx-better-auth-compat-'))

function copySourceProject(targetDir, betterAuthVersion) {
  for (const file of [
    'angular.json',
    'ng-package.json',
    'tsconfig.json',
    'tsconfig.lib.json',
    'tsconfig.lib.prod.json',
    'README.md',
    'LICENSE',
  ]) {
    cpSync(join(repoRoot, file), join(targetDir, file))
  }

  copyPnpmWorkspace(targetDir)
  cpSync(join(repoRoot, 'src'), join(targetDir, 'src'), { recursive: true })
  for (const entrypoint of secondaryEntrypoints) {
    cpSync(join(repoRoot, entrypoint), join(targetDir, entrypoint), { recursive: true })
  }

  const packageJson = structuredClone(rootPackage)
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    'better-auth': betterAuthVersion,
  }
  for (const packageName of optionalPluginPackages) {
    packageJson.devDependencies[packageName] = betterAuthVersion
  }
  delete packageJson.scripts.compat
  delete packageJson.scripts['compat:better-auth']
  writeJson(join(targetDir, 'package.json'), packageJson)
}

function buildPackageForVersion(betterAuthVersion) {
  if (skipBuild) {
    if (!existsSync(join(distDir, 'package.json'))) {
      throw new Error(`Missing ${join(distDir, 'package.json')}. Run pnpm build first or omit --skip-build.`)
    }

    run('Pack library', 'pnpm', ['pack', '--pack-destination', tempRoot], { cwd: distDir })

    const tarball = join(tempRoot, `${rootPackage.name}-${rootPackage.version}.tgz`)
    if (!existsSync(tarball)) {
      throw new Error(`Expected tarball not found: ${tarball}`)
    }

    return tarball
  }

  const sourceDir = join(tempRoot, `source-${betterAuthVersion.replaceAll(/[^a-zA-Z0-9._-]/g, '-')}`)
  mkdirSync(sourceDir)
  copySourceProject(sourceDir, betterAuthVersion)

  run('Install source deps', 'pnpm', ['install', '--config.strict-peer-dependencies=false'], { cwd: sourceDir })
  run('Build library', 'pnpm', ['build'], { cwd: sourceDir })
  run('Pack library', 'pnpm', ['pack', '--pack-destination', tempRoot], {
    cwd: join(sourceDir, 'dist', 'ngx-better-auth'),
  })

  const tarball = join(tempRoot, `${rootPackage.name}-${rootPackage.version}.tgz`)
  if (!existsSync(tarball)) {
    throw new Error(`Expected tarball not found: ${tarball}`)
  }

  return tarball
}

function checkVersion(betterAuthVersion) {
  console.log(`\nChecking better-auth@${betterAuthVersion}`)

  const tarball = buildPackageForVersion(betterAuthVersion)
  const fixtureDir = join(tempRoot, `fixture-${betterAuthVersion.replaceAll(/[^a-zA-Z0-9._-]/g, '-')}`)
  const includeOptionalPlugins = !coreOnly
  mkdirSync(fixtureDir)
  copyPnpmWorkspace(fixtureDir)

  writeJson(join(fixtureDir, 'package.json'), {
    name: 'ngx-better-auth-compat-fixture',
    version: '0.0.0',
    private: true,
    type: 'module',
    scripts: {
      typecheck: 'tsc --noEmit',
      smoke: 'node smoke.mjs',
      'route-contract': 'node better-auth-route-contract.mjs',
    },
    dependencies: {
      '@angular/common': devDependency('@angular/common'),
      '@angular/compiler': devDependency('@angular/compiler'),
      '@angular/core': devDependency('@angular/core'),
      '@angular/forms': devDependency('@angular/forms'),
      '@angular/router': devDependency('@angular/router'),
      'better-auth': betterAuthVersion,
      'ngx-better-auth': `file:${tarball}`,
      rxjs: devDependency('rxjs'),
      tslib: rootPackage.dependencies?.tslib ?? devDependency('tslib'),
      typescript: devDependency('typescript'),
    },
    devDependencies: {
      '@types/node': '^24.0.0',
    },
  })

  if (includeOptionalPlugins) {
    const fixturePackagePath = join(fixtureDir, 'package.json')
    const fixturePackage = JSON.parse(readFileSync(fixturePackagePath, 'utf8'))
    for (const packageName of optionalPluginPackages) {
      fixturePackage.dependencies[packageName] = betterAuthVersion
    }
    writeJson(fixturePackagePath, fixturePackage)
  }

  const fixturePackagePath = join(fixtureDir, 'package.json')
  const fixturePackage = JSON.parse(readFileSync(fixturePackagePath, 'utf8'))
  fixturePackage.dependencies = Object.fromEntries(
    Object.entries(fixturePackage.dependencies).filter(([, value]) => value !== undefined),
  )
  writeJson(fixturePackagePath, fixturePackage)

  writeJson(join(fixtureDir, 'tsconfig.json'), {
    compilerOptions: {
      strict: true,
      skipLibCheck: true,
      module: 'NodeNext',
      moduleResolution: 'NodeNext',
      target: 'ES2022',
      lib: ['ES2022', 'DOM'],
      types: [],
    },
    files: ['typecheck.ts', 'better-auth-api-contract.ts'],
  })

  const sources = smokeSources(includeOptionalPlugins)
  writeFileSync(join(fixtureDir, 'typecheck.ts'), sources.typecheck.trimStart())
  writeFileSync(join(fixtureDir, 'better-auth-api-contract.ts'), betterAuthApiContractSource().trimStart())
  writeFileSync(join(fixtureDir, 'better-auth-route-contract.mjs'), betterAuthRouteContractSource().trimStart())
  writeFileSync(join(fixtureDir, 'smoke.mjs'), sources.runtime.trimStart())

  run('Install fixture', 'pnpm', ['install', '--config.strict-peer-dependencies=false'], { cwd: fixtureDir })
  run('Typecheck fixture', 'pnpm', ['typecheck'], { cwd: fixtureDir })
  run('Route contract', 'pnpm', ['route-contract'], { cwd: fixtureDir })
  run('Runtime smoke', 'pnpm', ['smoke'], { cwd: fixtureDir })
}

try {
  const betterAuthVersions = usesDefaultVersions ? resolveDefaultBetterAuthVersions() : explicitBetterAuthVersions
  const results = []

  if (usesDefaultVersions) {
    console.log(`Resolved Better Auth versions: ${betterAuthVersions.join(', ')}`)
  }

  for (const version of betterAuthVersions) {
    try {
      checkVersion(version)
      results.push({ ok: true, version })
    } catch (error) {
      results.push({ error, ok: false, version })
      console.log(`\nFAILED ${rootPackage.name}@${rootPackage.version} + better-auth@${version}`)
      console.log(error instanceof Error ? error.message : error)
    }
  }

  console.log('\nSummary')
  for (const result of results) {
    console.log(`${result.ok ? 'OK    ' : 'FAILED'} better-auth@${result.version}`)
  }

  const failed = results.filter((result) => !result.ok)
  if (failed.length > 0) {
    process.exitCode = 1
  }

} catch (error) {
  console.log(`\nFAILED ${rootPackage.name}@${rootPackage.version}`)
  console.log(error instanceof Error ? error.message : error)
  process.exitCode = 1
} finally {
  if (keepTemp) {
    console.log(`\nTemp fixture kept at: ${tempRoot}`)
  } else {
    rmSync(tempRoot, { recursive: true, force: true })
  }
}
