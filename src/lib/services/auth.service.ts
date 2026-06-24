import { computed, inject, Injectable, signal } from '@angular/core'
import type { BetterFetchError } from 'better-auth/client'
import { defer, filter, first, map, Observable, shareReplay, switchMap } from 'rxjs'
import { MainService } from './main.service'
import { Provider, Session, User } from '../models'
import { BetterAuthFetchOptions } from './plugins/captcha.service'

type SessionState = {
  data: { user: User; session: Session } | null
  error: BetterFetchError | null
  isPending: boolean
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  /**
   * Current authenticated session
   */
  readonly session = signal<{ user: User; session: Session } | null>(null)

  /**
   * Whether there is an active session
   */
  readonly isLoggedIn = computed(() => !!this.session()?.session)

  /**
   * Observable stream of the session state. Emits only when the session is resolved (not pending).
   * This is intended for guards and other async operations.
   */
  readonly sessionState$!: Observable<{ user: User; session: Session } | null>

  constructor() {
    const useSession$ = new Observable<SessionState>((subscriber) => {
      const unsubscribe = this.client.useSession.subscribe((value: unknown) => subscriber.next(value as SessionState))

      return () => {
        if (typeof unsubscribe === 'function') {
          unsubscribe()
          return
        }

        unsubscribe?.unsubscribe?.()
      }
    }).pipe(shareReplay(1))

    this.sessionState$ = useSession$.pipe(
      filter((session) => !session.isPending),
      map((session) => {
        if (session.error) {
          return null
        }
        return session.data
      }),
    )

    useSession$.subscribe((session) => {
      if (session.isPending) {
        this.session.set(null)
        return
      }
      if (session.error) {
        if (session.error.status !== 401) {
          console.error('Error fetching session:', session.error)
        }
        this.session.set(null)
        return
      }
      this.session.set(session.data)
    })
  }

  /**
   * Asynchronously checks if the user is authenticated.
   * Ideal for route guards.
   * @returns An Observable that emits true for an active session, and false otherwise.
   */
  isLoggedIn$(): Observable<boolean> {
    return this.sessionState$.pipe(map((session) => !!session?.session))
  }

  signInEmail(data: {
    email: string
    password: string
    rememberMe?: boolean
    fetchOptions?: BetterAuthFetchOptions
  }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => this.client.signIn.email(data)).pipe(
      map((data) => this.mainService.mapData(data as any)),
      switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))),
      first(),
    )
  }

  /**
   * Sign up a new user using email and password.
   *
   * Parameters username and displayUsername can be used if the username's plugin is enabled.
   * @param data
   */
  signUpEmail(data: {
    name: string
    email: string
    password: string
    username: string
    displayUsername?: string
    fetchOptions?: BetterAuthFetchOptions
  }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => this.client.signUp.email(data)).pipe(
      map((data) => this.mainService.mapData(data as any)),
      switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))),
      first(),
    )
  }

  signInProvider(data: {
    provider: Provider
    callbackURL?: string
    disableRedirect?: boolean
    errorCallbackURL?: string
    idToken?: string
    loginHint?: string
    newUserCallbackURL?: string
    requestSignUp?: boolean
    scopes?: string[]
  }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() =>
      this.client.signIn.social({
        callbackURL: window.location.origin,
        ...(data as any),
      }),
    ).pipe(
      map((data) => this.mainService.mapData(data as any)),
      switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))),
      first(),
    )
  }

  signOut(): Observable<null> {
    return defer(() => this.client.signOut()).pipe(
      map((data) => this.mainService.mapData(data as any)),
      switchMap(() => this.sessionState$.pipe(filter((s) => s === null))),
      first(),
    )
  }

  sendVerificationEmail(data: { email: string; callbackURL?: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.sendVerificationEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  requestPasswordReset(data: {
    email: string
    redirectTo?: string
    fetchOptions?: BetterAuthFetchOptions
  }): Observable<{ status: boolean }> {
    return defer(() => this.client.requestPasswordReset(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  resetPassword(data: { newPassword: string; token: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.resetPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  verifyEmail(data: { token: string; callbackURL?: string }): Observable<void | { status: boolean }> {
    return defer(() => this.client.verifyEmail({ query: data })).pipe(
      map((data) => this.mainService.mapData<void | { status: boolean }>(data as any)),
    )
  }

  verifyPassword(data: { password: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.verifyPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  setPassword(data: { newPassword: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.setPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  changePassword(data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }): Observable<{
    token: string | null
    user: User
  }> {
    return defer(() => this.client.changePassword(data)).pipe(
      map((data) => this.mainService.mapData<{ token: string | null; user: User }>(data as any)),
    )
  }

  changeEmail(data: { newEmail: string; callbackURL?: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.changeEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  updateUser(
    data: Partial<{
      name: string
      image: string
      username: string
      displayUsername: string
      [key: string]: any
    }>,
  ): Observable<{ status: boolean }> {
    return defer(() => this.client.updateUser(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  deleteUser(data?: { callbackURL?: string; token?: string; password?: string }): Observable<null> {
    return defer(() => this.client.deleteUser(data)).pipe(
      map((data) => this.mainService.mapData(data as any)),
      switchMap(() => this.sessionState$.pipe(filter((s) => s === null))),
      first(),
    )
  }
}
