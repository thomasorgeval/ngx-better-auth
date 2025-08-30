# ngx-better-auth

![npm](https://img.shields.io/npm/v/ngx-better-auth?style=flat-square)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/ngx-better-auth?style=flat-square)
![license](https://img.shields.io/npm/l/ngx-better-auth?style=flat-square)
![angular](https://img.shields.io/badge/angular-20+-dd0031?logo=angular&logoColor=white&style=flat-square)
![better-auth](https://img.shields.io/badge/better--auth-1.3.7+-blueviolet?style=flat-square)

An **Angular 20+ integration for [Better Auth](https://github.com/better-auth/better-auth)**.  
Provides reactive session handling with **signals**, clean **DI provider setup** with **observables**, and modern **guards**.

---

## 🚀 Compatibility

| ngx-better-auth | Angular | Better Auth |
|-----------------|---------|-------------|
| `latest`        | `>=20`  | `>=1.3.7`   |

---

## 📦 Installation

```bash
npm install ngx-better-auth better-auth
```

---

## ⚙️ Setup Provider
First, configure your Better Auth client in your application:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core'
import { provideBetterAuth } from 'ngx-better-auth'

export const appConfig: ApplicationConfig = {
  providers: [
    provideBetterAuth({
      baseURL: 'http://localhost:3000', // your API endpoint
    })
  ]
};
```

## 🧩 Different services

You can inject different services depending on your needs:

### Global services:
- `SessionService`
- `SignInService`

### Plugin services:
- `AdminService`
- `OrganizationService`

## 🔄 Real-time Session

### AuthService keeps the session in sync automatically
- `session` → a signal with the current session or null
- `isLoggedIn` → a computed boolean

### Demonstration of usage in a component
```ts
import { AuthService } from "ngx-better-auth"
import { inject } from "@angular/core"

private readonly authService = inject(AuthService)
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
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo, hasRole } from 'ngx-better-auth/guards'

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