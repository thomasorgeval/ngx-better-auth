import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from './main.service'
import { Account, Provider, User } from '../models'

type AccountTokenRequest = { providerId: Provider | string; accountId?: string; userId?: string }

export interface AccountAccessToken {
  accessToken: string
  accessTokenExpiresAt?: Date
  scopes: string[]
  idToken?: string
}

export interface AccountRefreshToken {
  accessToken?: string
  refreshToken: string
  accessTokenExpiresAt?: Date
  refreshTokenExpiresAt?: Date | null
  scope?: string | null
  idToken?: string | null
  providerId: string
  accountId: string
}

export interface AccountInfo {
  user: User
  data: Record<string, any>
}

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  listAccounts(): Observable<Account[]> {
    return this.mainService.read<Account[]>(() => this.client.listAccounts())
  }

  accountsResource(): ResourceRef<Account[] | undefined> {
    return this.mainService.readResource<Account[]>(() => this.client.listAccounts())
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
    return defer(() => this.client.unlinkAccount(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  getAccessToken(data: AccountTokenRequest): Observable<AccountAccessToken> {
    return defer(() => this.client.getAccessToken(data)).pipe(
      map((data) => this.mainService.mapData<AccountAccessToken>(data as any)),
    )
  }

  refreshToken(data: AccountTokenRequest): Observable<AccountRefreshToken> {
    return defer(() => this.client.refreshToken(data)).pipe(
      map((data) => this.mainService.mapData<AccountRefreshToken>(data as any)),
    )
  }

  accountInfo(data?: AccountTokenRequest): Observable<AccountInfo | null> {
    return defer(() => this.client.accountInfo(data ? { query: data } : undefined)).pipe(
      map((data) => this.mainService.mapData<AccountInfo | null>(data as any)),
    )
  }
}
