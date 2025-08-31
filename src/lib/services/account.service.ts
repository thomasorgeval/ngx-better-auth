import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { MainService } from './main.service'
import { Provider } from '../models'

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  listAccounts() {
    return defer(() => this.client.listAccounts())
  }

  linkSocial(data: {
    provider: Provider
    callbackURL?: string
    scopes?: string[]
    idToken?: {
      token: string
      nonce?: string
      accessToken?: string
      refreshToken?: string
    }
  }) {
    return defer(() => this.client.linkSocial(data))
  }

  unlinkAccount(data: { providerId: Provider; accountId: string }) {
    return defer(() => this.client.unlinkAccount(data))
  }
}
