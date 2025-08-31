import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from './main.service'
import { Account, Provider } from '../models'

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  listAccounts(): Observable<Account[]> {
    return defer(() => this.client.listAccounts()).pipe(map((data) => this.mainService.mapData<Account[]>(data as any)))
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
  }): Observable<{ url: string; redirect: boolean }> {
    return defer(() => this.client.linkSocial(data)).pipe(
      map((data) => this.mainService.mapData<{ url: string; redirect: boolean }>(data as any)),
    )
  }

  unlinkAccount(data: { providerId: Provider; accountId: string }): Observable<{ status: boolean }> {
    return defer(() => this.client.unlinkAccount(data)).pipe(map((data) => this.mainService.mapData<{ status: boolean }>(data as any)))
  }
}
