import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

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
