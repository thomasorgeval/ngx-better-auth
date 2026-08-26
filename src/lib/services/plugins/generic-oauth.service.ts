import { inject, Injectable } from '@angular/core'
import { AccountService } from '../account.service'
import { AuthService } from '../auth.service'

@Injectable({ providedIn: 'root' })
export class GenericOauthService {
  private readonly accountService = inject(AccountService)
  private readonly authService = inject(AuthService)

  signIn(data: {
    providerId: string
    callbackURL?: string
    errorCallbackURL?: string
    newUserCallbackURL?: string
    disableRedirect?: boolean
    scopes?: string[]
    requestSignUp?: boolean
  }) {
    const { providerId, ...options } = data
    return this.authService.signInProvider({ provider: providerId, ...options })
  }

  link(data: { providerId: string; callbackURL: string }) {
    const { providerId, ...options } = data
    return this.accountService.linkSocial({ provider: providerId, ...options })
  }
}
