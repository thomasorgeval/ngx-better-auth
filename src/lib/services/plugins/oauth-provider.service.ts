import { inject, Injectable } from '@angular/core'
import { defer, map, type Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export interface OAuthProviderRedirectResult {
  redirect: boolean
  url: string
}

@Injectable({ providedIn: 'root' })
export class OAuthProviderService {
  private readonly mainService = inject(MainService)

  private readonly oauth2: any

  constructor() {
    const client = this.mainService.authClient as { oauth2?: any }
    validatePlugin(client, 'oauth2')
    this.oauth2 = client.oauth2
  }

  consent(data: { accept: boolean; scope?: string; oauth_query?: string }): Observable<OAuthProviderRedirectResult> {
    return defer(() => this.oauth2.consent(data)).pipe(
      map((data) => this.mainService.mapData<OAuthProviderRedirectResult>(data as any)),
    )
  }

  continue(data: {
    selected?: boolean
    created?: boolean
    postLogin?: boolean
    oauth_query?: string
  }): Observable<OAuthProviderRedirectResult> {
    return defer(() => this.oauth2.continue(data)).pipe(
      map((data) => this.mainService.mapData<OAuthProviderRedirectResult>(data as any)),
    )
  }

}
