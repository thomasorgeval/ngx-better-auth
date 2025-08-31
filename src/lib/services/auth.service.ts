import { computed, inject, Injectable, signal } from '@angular/core'
import { BetterFetchError } from 'better-auth/client'
import { AuthSession, Provider } from '../models'
import { defer, filter, map, Observable, shareReplay, switchMap, tap } from 'rxjs'
import { MainService } from './main.service'
import { SocialProviderList } from 'better-auth/social-providers'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  /**
   * Current authenticated session
   */
  readonly session = signal<AuthSession | null>(null)

  /**
   * Whether there is an active session
   */
  readonly isLoggedIn = computed(() => !!this.session()?.session)

  /**
   * Observable stream of the session state. Emits only when the session is resolved (not pending).
   * This is intended for guards and other async operations.
   */
  readonly sessionState$!: Observable<AuthSession | null>

  constructor() {
    this.session$()

    const useSession$ = new Observable<{
      data: AuthSession | null
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

  signInEmail(data: { email: string; password: string; rememberMe?: boolean }) {
    return defer(() => this.client.signIn.email(data)).pipe(switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))))
  }

  /**
   * Sign up a new user using email and password.
   *
   * Parameters username and displayUsername can be used if the username's plugin is enabled.
   * @param data
   */
  signUpEmail(data: { name: string; email: string; password: string; username: string; displayUsername?: string }) {
    return defer(() => this.client.signUp.email(data)).pipe(switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))))
  }

  signInProvider(provider: Provider) {
    return defer(() => this.client.signIn.social({ provider })).pipe(switchMap(() => this.sessionState$.pipe(filter((s) => s !== null))))
  }

  signOut() {
    return defer(() => this.client.signOut()).pipe(tap(() => this.sessionState$.pipe(filter((s) => s === null))))
  }

  sendVerificationEmail(data: { email: string; callbackURL?: string }) {
    return defer(() => this.client.sendVerificationEmail(data))
  }

  requestPasswordReset(data: { email: string; redirectTo?: string }) {
    return defer(() => this.client.requestPasswordReset(data))
  }

  resetPassword(data: { newPassword: string; token: string }) {
    return defer(() => this.client.resetPassword(data))
  }

  changePassword(data: { currentPassword: string; newPassword: string; revokeOtherSessions?: boolean }) {
    return defer(() => this.client.changePassword(data))
  }

  changeEmail(data: { newEmail: string; callbackURL?: string }) {
    return defer(() => this.client.changeEmail(data))
  }

  updateUser(data: { name?: string; image?: string; username?: string; displayUsername?: string }) {
    return defer(() => this.client.updateUser(data))
  }

  isUsernameAvailable(data: { username: string }) {
    return defer(() => (this.client as any).isUsernameAvailable(data))
  }

  deleteUser(data: { callbackURL?: string; token?: string; password?: string }) {
    return defer(() => this.client.deleteUser(data)).pipe(tap(() => this.sessionState$.pipe(filter((s) => s === null))))
  }
}
