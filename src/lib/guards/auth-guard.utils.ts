import { inject } from '@angular/core'
import { Router, type UrlTree } from '@angular/router'
import { map, type Observable } from 'rxjs'
import { AuthService } from '../services'

const normalizeRoles = (role: unknown): string[] => {
  if (Array.isArray(role)) {
    return role.map((value) => String(value).trim()).filter((value) => value.length > 0)
  }

  if (typeof role === 'string') {
    return role
      .split(',')
      .map((value) => value.trim())
      .filter((value) => value.length > 0)
  }

  return []
}

/**
 * Redirects unauthorized users to the specified commands (route).
 */
export function redirectUnauthorizedTo(commands: string[] = ['/login']): () => Observable<UrlTree | boolean> {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)
    return auth.isLoggedIn$().pipe(map((isLoggedIn) => (isLoggedIn ? true : router.createUrlTree(commands))))
  }
}

/**
 * Redirects logged-in users to the specified commands (route).
 */
export function redirectLoggedInTo(commands: string[] = ['/']): () => Observable<UrlTree | boolean> {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)
    return auth.isLoggedIn$().pipe(map((isLoggedIn) => (isLoggedIn ? router.createUrlTree(commands) : true)))
  }
}

/**
 * Allows access only to users with at least one of the specified roles.
 * Redirects unauthorized users to the specified commands (route).
 */
export function hasRole(requiredRoles: string[], redirectTo: string[] = ['/unauthorized']): () => Observable<UrlTree | boolean> {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)

    return auth.sessionState$.pipe(
      map((session) => {
        if (!session || !session.user) {
          return router.createUrlTree(redirectTo)
        }

        const roles = normalizeRoles((session.user as { role?: unknown }).role)
        if (roles.some((role) => requiredRoles.includes(role))) {
          return true
        }

        return router.createUrlTree(redirectTo)
      }),
    )
  }
}
