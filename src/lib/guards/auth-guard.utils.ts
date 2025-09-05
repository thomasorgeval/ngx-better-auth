import { inject } from '@angular/core'
import { Router, UrlTree } from '@angular/router'
import { AuthService } from '../services'
import { map, Observable } from 'rxjs'

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
export function hasRole(
  requiredRoles: string[],
  redirectTo: string[] = ['/unauthorized'],
): () => Observable<UrlTree | boolean> {
  return () => {
    const auth = inject(AuthService)
    const router = inject(Router)

    return auth.sessionState$.pipe(
      map((session) => {
        if (!session || !session.user) {
          return router.createUrlTree(redirectTo)
        }

        const role = (session?.user as any)?.['role']
        if (Array.isArray(role)) {
          if (role.some((r) => requiredRoles.includes(r))) {
            return true
          }
        } else if (typeof role === 'string') {
          if (requiredRoles.includes(role)) {
            return true
          }
        }

        return router.createUrlTree(redirectTo)
      }),
    )
  }
}
