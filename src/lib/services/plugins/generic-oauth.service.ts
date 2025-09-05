import { inject, Injectable } from '@angular/core'
import { defer, filter, switchMap } from 'rxjs'
import { MainService } from '../main.service'
import { validatePlugin } from '../../utils/validate-plugin'
import { AuthService } from '../auth.service'

@Injectable({ providedIn: 'root' })
export class GenericOauthService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  oauth: any

  constructor() {
    const client = this.mainService.authClient as { oauth2?: any }
    validatePlugin(client, 'oauth2')
    this.oauth = client.oauth2
  }

  signIn(data: {
    providerId: string
    callbackURL?: string
    errorCallbackURL?: string
    newUserCallbackURL?: string
    disableRedirect?: boolean
    scopes?: string[]
    requestSignUp?: boolean
  }) {
    return defer(() => (this.mainService.authClient.signIn as any).oauth2(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  link(data: { providerId: string; callbackURL: string }) {
    return defer(() => this.oauth.link(data))
  }
}
