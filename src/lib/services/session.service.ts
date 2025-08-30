import { inject, Injectable } from '@angular/core'
import { AuthService } from './auth.service'
import { defer } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly authService = inject(AuthService)

  private readonly client = this.authService.authClient

  listSessions() {
    return defer(() => this.client.listSessions())
  }

  revokeSession(sessionToken: string) {
    return defer(() => this.client.revokeSession({ token: sessionToken }))
  }

  revokeOtherSessions() {
    return defer(() => this.client.revokeOtherSessions())
  }

  revokeAllSessions() {
    return defer(() => this.client.revokeSessions())
  }
}
