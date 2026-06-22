import { inject, Injectable } from '@angular/core'
import { defer, filter, map, Observable, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'
import { User } from '../../models'

type EmailOtpType = 'sign-in' | 'change-email' | 'email-verification' | 'forget-password'

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

  signInEmailOtp(data: { email: string; otp: string; name?: string; image?: string; [key: string]: any }) {
    return defer(() => (this.mainService.authClient.signIn as any).emailOtp(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  sendVerificationOtp(data: { email: string; type: EmailOtpType }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.sendVerificationOtp(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  createVerificationOtp(data: { email: string; type: EmailOtpType }): Observable<string> {
    return defer(() => this.emailOtp.createVerificationOtp(data)).pipe(
      map((data) => this.mainService.mapData<string>(data as any)),
    )
  }

  getVerificationOtp(data: { email: string; type: EmailOtpType }): Observable<{ otp: string | null }> {
    return defer(() => this.emailOtp.getVerificationOtp({ query: data })).pipe(
      map((data) => this.mainService.mapData<{ otp: string | null }>(data as any)),
    )
  }

  checkVerificationOtp(data: { email: string; type: EmailOtpType; otp: string }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.checkVerificationOtp(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  verifyEmail(data: { email: string; otp: string }): Observable<{ status: boolean; token: string | null; user: User }> {
    return defer(() => this.emailOtp.verifyEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean; token: string | null; user: User }>(data as any)),
    )
  }

  requestPasswordReset(data: { email: string }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.requestPasswordReset(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  forgetPassword(data: { email: string }): Observable<{ success: boolean }> {
    return defer(() => (this.mainService.authClient.forgetPassword as any).emailOtp(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  resetPassword(data: { email: string; otp: string; password: string }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.resetPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  requestEmailChange(data: { newEmail: string; otp?: string }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.requestEmailChange(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  changeEmail(data: { newEmail: string; otp: string }): Observable<{ success: boolean }> {
    return defer(() => this.emailOtp.changeEmail(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
