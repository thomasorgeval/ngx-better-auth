import { inject, Injectable } from '@angular/core'
import { defer, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export interface SignInPopupOptions {
  provider?: string
  providerId?: string
  callbackURL?: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  requestSignUp?: boolean
  scopes?: string[]
  additionalData?: Record<string, unknown>
  windowFeatures?: string
  timeoutMs?: number
}

export interface SignInPopupResult {
  data: { success: boolean } | null
  error: { code: string; message: string; status?: number } | null
}

@Injectable({ providedIn: 'root' })
export class OauthPopupService {
  private readonly mainService = inject(MainService)

  constructor() {
    validatePlugin(this.mainService.authClient.signIn, 'popup')
  }

  signIn(data: SignInPopupOptions): Observable<SignInPopupResult> {
    return defer(() => this.mainService.authClient.signIn.popup(data) as Promise<SignInPopupResult>)
  }
}
