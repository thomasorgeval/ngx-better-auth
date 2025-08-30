import { computed, inject, Injectable, signal } from '@angular/core'
import { BETTER_AUTH_CONFIG_TOKEN } from '../providers'
import { BetterFetchError, createAuthClient } from 'better-auth/client'
import { AuthSession } from '../models'
import { filter, map, Observable, shareReplay } from 'rxjs'

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly config = inject(BETTER_AUTH_CONFIG_TOKEN)

  readonly authClient = createAuthClient({
    ...this.config,
  })

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
      this.authClient.useSession.subscribe((value) => subscriber.next(value))
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
  isAuthenticated(): Observable<boolean> {
    return this.sessionState$.pipe(map((session) => !!session?.session))
  }

  private session$() {
    this.authClient.useSession.subscribe((session) => {
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
}
