import { computed, inject, Injectable, signal } from '@angular/core'
import { BETTER_AUTH_CONFIG_TOKEN } from '../providers'
import { BetterFetchError, createAuthClient } from 'better-auth/client'
import { AuthSession } from '../models'

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

  constructor() {
    this.session$()
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
