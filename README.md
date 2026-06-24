# ngx-better-auth

An **Angular 20+ wrapper for [Better Auth](https://github.com/better-auth/better-auth)**. Provides reactive session handling with **signals**, clean **DI provider setup** with **observables**, and modern **guards**.

![npm](https://img.shields.io/npm/v/ngx-better-auth)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ngx-better-auth)
![license](https://img.shields.io/npm/l/ngx-better-auth)
![downloads](https://img.shields.io/npm/dm/ngx-better-auth)

![angular](https://img.shields.io/badge/angular-20+-dd0031?logo=angular&logoColor=white)
![better-auth](https://img.shields.io/badge/better--auth-1.6.x-blueviolet)

---

## 🚀 Compatibility

| ngx-better-auth | Angular | Better Auth |
|-----------------|---------|-------------|
| `1.6.x`         | `>=20`  | `>=1.6.10 <1.7.0` |
| `0.11.x`        | `>=20`  | `>=1.3.7`   |

---

## 📦 Installation

```bash
npm install ngx-better-auth better-auth
```

If you use Passkey, install the split Better Auth Passkey package too:

```bash
npm install @better-auth/passkey
```

If you use the Better Auth Stripe plugin, install its split package too. It is an optional peer dependency of `ngx-better-auth` and is only needed by apps that configure `stripeClient(...)`:

```bash
npm install @better-auth/stripe
```

---

## ⚙️ Setup Provider
First, configure your Better Auth client in your application:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideBetterAuth } from 'ngx-better-auth'
import { environment } from './environments/environment'
import { adminClient, siweClient, twoFactorClient, usernameClient } from 'better-auth/client/plugins'
import { passkeyClient } from '@better-auth/passkey/client'
import { stripeClient } from '@better-auth/stripe/client'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBetterAuth({
      baseURL: environment.apiUrl, // it works also with proxy config
      basePath: '/auth',   // optional, default is '/api/auth'
        
      // Example with plugins
      plugins: [
        usernameClient(),
        twoFactorClient({
          onTwoFactorRedirect() {
              window.location.href = '/two-factor-auth'
          },
        }),
        adminClient({
          ac: accessControl,
          roles: {
            admin,
            moderator,
            user,
          },
        }),
        passkeyClient(),
        stripeClient({ subscription: true }),
        siweClient(),
      ],
    })
  ]
}
```

## 🧩 Different services

### Migrating to 1.6.x

`ngx-better-auth 1.6.x` targets Better Auth `>=1.6.10 <1.7.0`.

If you use Passkey, install the split package and update imports:

```bash
pnpm add @better-auth/passkey
```

```ts
import { passkeyClient } from '@better-auth/passkey/client'
```

SIWE users can keep using `SiweService.getNonce(...)`; internally it now maps to Better Auth's `siwe.getNonce` endpoint introduced in `1.6.10`.

You can inject different services depending on your needs.  
**AuthService** provides the core Better Auth client methods (signIn, signOut, signUp, e.g.).  
The full list of methods  is available at the end of this README.

## 🔌 Plugin compatibility

### Authentication
- ✅ Two Factor ➡️ `TwoFactorService`
- ✅ Username ➡️ `UsernameService`
- ✅ Anonymous ➡️ `AnonymousService`
- ✅ Phone Number ➡️ `PhoneNumberService`
- ✅ Magic Link ➡️ `MagicLinkService`
- ✅ Email OTP ➡️ `EmailOtpService`
- ✅ Passkey ➡️ `PasskeyService`
- ✅ Generic OAuth ➡️ `GenericOauthService`
- ✅ OAuth Popup ➡️ `OauthPopupService`
- ✅ One Tap ➡️ `OneTapService`
- ✅ Sign In With Ethereum (SIWE) ➡️ `SiweService`

### Authorization & Management
- ✅ Admin ➡️ `AdminService`
- ✅ Organization ➡️ `OrganizationService`

### API & Tokens

- ✅ Last Login Method ➡️ `LastLoginMethodService`
- ✅ Multi Session ➡️ `MultiSessionService`
- ✅ One Time Token ➡️ `OneTimeTokenService`
- ✅ JWT ➡️ `JwtService`
- ✅ Bearer ➡️ `BearerService`, `bearerHeaders()`, `bearerFetchOptions()`
- ✅ API Key ➡️ `ApiKeyService`

### OAuth & OIDC Providers

- ✅ Device Authorization ➡️ `DeviceAuthorizationService`
- ✅ OAuth 2.1 Provider ➡️ `OAuthProviderService`
- ✅ SSO ➡️ `SsoService`

### Payments & Billing

- ✅ Stripe ➡️ `StripeService`

### Security & Utilities

- ✅ Captcha ➡️ `captchaHeaders()`, `captchaFetchOptions()` for the `x-captcha-response` header
- ✅ Open API ➡️ `OpenApiService`
- ✅ SCIM ➡️ `ScimService`

### Captcha helper

Better Auth's Captcha plugin validates the `x-captcha-response` header. Use `captchaFetchOptions()` with any auth method that supports Better Auth `fetchOptions`.

```ts
import { AuthService, captchaFetchOptions } from 'ngx-better-auth'
import { inject } from '@angular/core'

const auth = inject(AuthService)

const captchaResponse = await getCaptchaResponseFromYourWidget()

auth.signInEmail({
    email: 'user@example.com',
    password: 'password',
    ...captchaFetchOptions(captchaResponse),
})
```

### Bearer helper

Configure Better Auth with the server-side `bearer()` plugin, then use `BearerService` to resolve a session from a bearer token.

```ts
import { BearerService } from 'ngx-better-auth'
import { inject } from '@angular/core'

const bearer = inject(BearerService)

bearer.signIn({ token }).subscribe((session) => {
    console.log(session?.user.email)
})
```

### OpenAPI helper

Configure Better Auth with the server-side `openAPI()` plugin, then use `OpenApiService` to fetch the generated schema or build the reference URL.

```ts
import { OpenApiService } from 'ngx-better-auth'
import { inject } from '@angular/core'

const openApi = inject(OpenApiService)

openApi.schema().subscribe((schema) => {
    console.log(schema.paths)
})
```

## 🔄 Real-time Session

### AuthService keeps the session in sync automatically
- `session` → a signal with the current session or null
- `isLoggedIn` → a computed boolean

### Demonstration of usage in a component
```ts
import { AuthService } from "ngx-better-auth"
import { inject } from "@angular/core"

@Component({
    // ...
})
export class MyComponent {
    private readonly authService = inject(AuthService)

    get isLoggedIn() {
        return this.authService.isLoggedIn()
    }

    get userName() {
        return this.authService.session()?.user.name
    }
}
```

## ⚡ Signal resources for reads

GET/list-style methods keep their existing `Observable` API and also expose Angular `resource` factories for zoneless-friendly templates.

Mutations such as sign in, sign out, update, delete, revoke, invite, and verify still use `Observable` because they are command workflows.

### Available resource factories

- `SessionService.sessionsResource()`
- `AccountService.accountsResource()`
- `PasskeyService.userPasskeysResource()`
- `OrganizationService.organizationsResource()`
- `OrganizationService.fullOrganizationResource(() => params)`
- `OrganizationService.invitationResource(() => params)`
- `OrganizationService.invitationsResource(() => params)`
- `OrganizationService.userInvitationsResource()`
- `OrganizationService.activeMemberResource()`
- `AdminService.usersResource(() => params)`
- `AdminService.userSessionsResource(() => params)`
- `StripeService.listResource(() => params)`
- `MultiSessionService.deviceSessionsResource()`
- `OrganizationService.activeMemberRoleResource(() => params)`
- `OrganizationService.rolesResource(() => params)`
- `OrganizationService.teamsResource(() => params)`
- `OrganizationService.userTeamsResource()`
- `OrganizationService.teamMembersResource(() => params)`

### Simple read resource

```ts
import { Component, inject } from '@angular/core'
import { SessionService } from 'ngx-better-auth'

@Component({
    // ...
})
export class SessionsComponent {
    private readonly sessionService = inject(SessionService)

    readonly sessions = this.sessionService.sessionsResource()
}
```

```html
@if (sessions.isLoading()) {
    <p>Loading sessions...</p>
} @else if (sessions.error()) {
    <p>Unable to load sessions.</p>
} @else {
    @for (session of sessions.value() ?? []; track session.token) {
        <p>{{ session.ipAddress }}</p>
    }
}
```

### Parameterized read resource

```ts
import { Component, inject, signal } from '@angular/core'
import { OrganizationService } from 'ngx-better-auth'

@Component({
    // ...
})
export class OrganizationComponent {
    private readonly organizationService = inject(OrganizationService)

    readonly organizationId = signal<string | undefined>(undefined)

    readonly organization = this.organizationService.fullOrganizationResource(() => ({
        organizationId: this.organizationId(),
        membersLimit: 20,
    }))

    selectOrganization(organizationId: string) {
        this.organizationId.set(organizationId)
    }
}
```

Call `resource.reload()` after a mutation when you need to refresh a read resource manually.

## 🛡️ Guards
This library ships with guards to quickly set up route protection.

### Helpers
- `redirectUnauthorizedTo(['/login'])` → redirect if not logged in
- `redirectLoggedInTo(['/'])` → redirect if already logged in 
- `hasRole(['admin'], ['/unauthorized'])` → restrict access by role and redirect if not authorized
- `hasOrganizationRole(['owner', 'admin'], ['/unauthorized'])` → restrict access by active organization role
- `hasActiveOrganization(['/select-organization'])` → require an active organization member

### Usage in routes
```ts
import { Routes } from '@angular/router'
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo, hasRole, hasOrganizationRole, hasActiveOrganization } from 'ngx-better-auth'

export const routes: Routes = [
  {
    path: '',
    component: SomeComponent,
    ...canActivate(redirectUnauthorizedTo(['/login']))
  },
  {
    path: 'admin',
    component: AdminComponent,
    ...canActivate(hasRole(['admin'], ['/unauthorized']))
  },
  {
    path: 'organization',
    component: OrganizationComponent,
    ...canActivate(hasOrganizationRole(['owner', 'admin'], ['/unauthorized']))
  },
  {
    path: 'organization/select',
    component: SelectOrganizationComponent,
    ...canActivate(hasActiveOrganization(['/select-organization']))
  },
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(redirectLoggedInTo(['/']))
  }
]
```

## ✅ Validators

The username plugin provides validators that work seamlessly with both reactive and template-driven forms.

```ts
import { FormControl } from '@angular/forms'
import { inject } from '@angular/core'
import { UsernameAvailableValidator } from 'ngx-better-auth'

const usernameService = inject(UsernameService)
const initialUsername = 'thomas-orgeval'

const usernameControl = new FormControl('', {
    asyncValidators: [usernameAvailableValidator(usernameService, initialUsername)],
    updateOn: 'change'
})
```

## 💰 Stripe subscriptions

Configure Better Auth with `stripeClient({ subscription: true })`, then inject `StripeService` to start checkouts, list subscriptions, cancel, restore, or open the billing portal.

```ts
import { inject } from '@angular/core'
import { StripeService } from 'ngx-better-auth'

export class UsageComponent {
    private readonly subscriptions = inject(StripeService)

    startCheckout(orgId: string) {
        return this.subscriptions.upgrade({
            plan: 'starter',
            annual: false,
            customerType: 'organization',
            referenceId: orgId,
            successUrl: '/organization/usage?checkout=success',
            cancelUrl: '/organization/usage?checkout=cancelled',
        })
    }
}
```

## ⭐ Star History

[![Star History Chart](https://api.star-history.com/svg?repos=thomasorgeval/ngx-better-auth&type=Date)](https://www.star-history.com/#thomasorgeval/ngx-better-auth&Date)
