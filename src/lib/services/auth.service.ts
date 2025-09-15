import { computed, inject, Injectable, signal } from '@angular/core'
import { BetterFetchError } from 'better-auth/client'
import { defer, filter, first, map, Observable, shareReplay, switchMap } from 'rxjs'
import { MainService } from './main.service'
import { Provider, Session, User } from '../models'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  /**
   * Current authenticated session
   */
  readonly session = signal<{ user: any; session: any } | null>(null)

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
    this.session$()

    const useSession$ = new Observable<{
      data: { user: User; session: Session } | null
      error: BetterFetchError | null
      isPending: boolean
    }>((subscriber) => {
      this.client.useSession.subscribe((value) => subscriber.next(value))
    })

    this.sessionState$ = useSession$.pipe(
      filter((session) => !session.isPending),
      map((session) => {
        if (session.error) {
          return null
        }
        return session.data
      }),
      shareReplay(1),
    )
  }

  /**
   * Asynchronously checks if the user is authenticated.
   * Ideal for route guards.
   * @returns An Observable that emits true for an active session, and false otherwise.
   */
  isLoggedIn$(): Observable<boolean> {
    return this.sessionState$.pipe(map((session) => !!session?.session))
  }

  private session$() {
    this.client.useSession.subscribe((session) => {
      if (session.isPending) {
        this.session.set(null)
        return
      }
      if (session.error) {
        const error: BetterFetchError = session.error
        if (error.status !== 401) {
          console.error('Error fetching session:', error)
        }
        this.session.set(null)
        return
      }
      this.session.set(session.data)
    })
  }

  signInEmail(data: { email: string; password: string; rememberMe?: boolean }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => this.client.signIn.email(data)).pipe(
      switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))),
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
  }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => this.client.signUp.email(data)).pipe(
      switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))),
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
    ).pipe(switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))))
  }

  signOut(): Observable<null> {
    return defer(() => this.client.signOut()).pipe(switchMap(() => this.sessionState$.pipe(filter((s) => s === null))))
  }

  sendVerificationEmail(data: { email: string; callbackURL?: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.sendVerificationEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  requestPasswordReset(data: { email: string; redirectTo?: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.requestPasswordReset(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  resetPassword(data: { newPassword: string; token: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.resetPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  changePassword(data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }): Observable<{
    token: string
    user: User
  }> {
    return defer(() => this.client.changePassword(data)).pipe(
      map((data) => this.mainService.mapData<{ token: string; user: User }>(data as any)),
    )
  }

  changeEmail(data: { newEmail: string; callbackURL?: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.changeEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  updateUser(data: {
    name?: string
    image?: string
    username?: string
    displayUsername?: string
  }): Observable<{ status: boolean }> {
    return defer(() => this.client.updateUser(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  deleteUser(data?: { callbackURL?: string; token?: string; password?: string }): Observable<null> {
    return defer(() => this.client.deleteUser(data)).pipe(
      switchMap(() => this.sessionState$.pipe(filter((s) => s === null))),
      first(),
    )
  }
}
