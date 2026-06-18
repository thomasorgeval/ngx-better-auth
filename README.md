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
- ❌ Anonymous
- ❌ Phone Number
- ✅ Magic Link ➡️ `MagicLinkService`
- ✅ Email OTP ➡️ `EmailOtpService`
- ✅ Passkey ➡️ `PasskeyService`
- ✅ Generic OAuth ➡️ `GenericOauthService`
- ✅ One Tap ➡️ `OneTapService`
- ✅ Sign In With Ethereum (SIWE) ➡️ `SiweService`

### Authorization
- ✅ Admin ➡️ `AdminService`
- ❌ API Key
- ❌ MCP
- ✅ Organization ➡️ `OrganizationService`

### Enterprise

- ❌ OIDC Provider
- ❌ SSO

### Utility

- ❌ Bearer
- ❌ Device Authorization
- ❌ Captcha
- ❌ Last Login Method
- ❌ Multi Session
- ❌ One Time Token
- ❌ JWT

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

## 🛡️ Guards
This library ships with guards to quickly set up route protection.

### Helpers
- `redirectUnauthorizedTo(['/login'])` → redirect if not logged in
- `redirectLoggedInTo(['/'])` → redirect if already logged in 
- `hasRole(['admin'], ['/unauthorized'])` → restrict access by role and redirect if not authorized

### Usage in routes
```ts
import { Routes } from '@angular/router'
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo, hasRole } from 'ngx-better-auth'

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
