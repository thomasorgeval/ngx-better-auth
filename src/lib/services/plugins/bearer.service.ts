import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { Session, User } from '../../models'
import { BetterAuthFetchOptions } from './captcha.service'
import { MainService } from '../main.service'

export interface BearerSessionData {
  token: string
  fetchOptions?: BetterAuthFetchOptions
}

export function bearerHeaders(token: string): Record<string, string> {
  return { authorization: `Bearer ${token}` }
}

export function bearerFetchOptions(token: string, fetchOptions: BetterAuthFetchOptions = {}): BetterAuthFetchOptions {
  return {
    ...fetchOptions,
    headers: {
      ...fetchOptions.headers,
      ...bearerHeaders(token),
    },
  }
}

@Injectable({ providedIn: 'root' })
export class BearerService {
  private readonly mainService = inject(MainService)

  session(data: BearerSessionData): Observable<{ user: User; session: Session } | null> {
    return defer(() =>
      this.mainService.authClient.getSession({
        fetchOptions: bearerFetchOptions(data.token, data.fetchOptions),
      }),
    ).pipe(map((data) => this.mainService.mapData<{ user: User; session: Session } | null>(data as any)))
  }

  signIn(data: BearerSessionData): Observable<{ user: User; session: Session } | null> {
    return this.session(data)
  }
}
