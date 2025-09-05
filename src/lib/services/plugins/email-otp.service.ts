import { inject, Injectable } from '@angular/core'
import { defer, filter, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'

@Injectable({ providedIn: 'root' })
export class EmailOtpService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  emailOtp: any

  constructor() {
    const client = this.mainService.authClient as { emailOtp?: any }
    validatePlugin(client, 'emailOtp')
    this.emailOtp = client.emailOtp
  }

  signInEmailOtp(data: { email: string; otp: string }) {
    return defer(() => (this.mainService.authClient.signIn as any).emailOtp(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  sendVerificationOtp(data: { email: string; type: 'sign-in' | 'email-verification' | 'forget-password' }) {
    return defer(() => this.emailOtp.sendVerificationOtp(data))
  }

  checkVerificationOtp(data: {
    email: string
    type: 'sign-in' | 'email-verification' | 'forget-password'
    otp: string
  }) {
    return defer(() => this.emailOtp.checkVerificationOtp(data))
  }

  verifyEmail(data: { email: string; otp: string }) {
    return defer(() => this.emailOtp.verifyEmail(data))
  }

  resetPassword(data: { email: string; otp: string; password: string }) {
    return defer(() => this.emailOtp.resetPassword(data))
  }
}
