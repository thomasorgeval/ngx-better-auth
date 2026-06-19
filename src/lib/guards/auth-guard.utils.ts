import { inject } from '@angular/core'
import { Router, type UrlTree } from '@angular/router'
import { catchError, map, of, type Observable } from 'rxjs'
import { AuthService } from '../services'
import { OrganizationService } from '../services/plugins/organization.service'

type GuardRedirect = string[] | UrlTree

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

const redirectResult = (router: Router, redirectTo: GuardRedirect): UrlTree => {
  if (Array.isArray(redirectTo)) {
    return router.createUrlTree(redirectTo)
  }

  return redirectTo
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

        const roles = normalizeRoles((session.user as { role?: unknown }).role)
        if (roles.some((role) => requiredRoles.includes(role))) {
          return true
        }

        return router.createUrlTree(redirectTo)
      }),
    )
  }
}

/**
 * Allows access only when an active organization member exists.
 * Redirects users without an active organization to the specified commands or UrlTree.
 */
export function hasActiveOrganization(
  redirectTo: GuardRedirect = ['/unauthorized'],
): () => Observable<UrlTree | boolean> {
  return () => {
    const organization = inject(OrganizationService)
    const router = inject(Router)

    return organization.getActiveMember().pipe(
      map((member) => (member ? true : redirectResult(router, redirectTo))),
      catchError(() => of(redirectResult(router, redirectTo))),
    )
  }
}

/**
 * Allows access only to active organization members with at least one of the specified roles.
 * Redirects users without an active organization, active member, or matching role.
 */
export function hasOrganizationRole(
  requiredRoles: string[],
  redirectTo: GuardRedirect = ['/unauthorized'],
): () => Observable<UrlTree | boolean> {
  return () => {
    const organization = inject(OrganizationService)
    const router = inject(Router)

    return organization.getActiveMember().pipe(
      map((member) => {
        if (!member) {
          return redirectResult(router, redirectTo)
        }

        const roles = normalizeRoles((member as { role?: unknown }).role)
        if (roles.some((role) => requiredRoles.includes(role))) {
          return true
        }

        return redirectResult(router, redirectTo)
      }),
      catchError(() => of(redirectResult(router, redirectTo))),
    )
  }
}
