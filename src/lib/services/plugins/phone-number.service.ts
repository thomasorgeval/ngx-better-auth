import { inject, Injectable } from '@angular/core'
import { defer, filter, map, Observable, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { User, Session } from '../../models'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'

export interface PhoneNumberUser extends User {
  phoneNumber: string
  phoneNumberVerified: boolean
}

@Injectable({ providedIn: 'root' })
export class PhoneNumberService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  private readonly phoneNumber: any

  constructor() {
    const client = this.mainService.authClient as { phoneNumber?: any }
    validatePlugin(client, 'phoneNumber')
    this.phoneNumber = client.phoneNumber
  }

  signIn(data: {
    phoneNumber: string
    password: string
    rememberMe?: boolean
  }): Observable<{ user: User; session: Session }> {
    return defer(() => this.mainService.authClient.signIn.phoneNumber(data)).pipe(
      map((data) => this.mainService.mapData<{ token: string; user: PhoneNumberUser }>(data as any)),
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  sendOtp(data: { phoneNumber: string }): Observable<{ message: string }> {
    return defer(() => this.phoneNumber.sendOtp(data)).pipe(
      map((data) => this.mainService.mapData<{ message: string }>(data as any)),
    )
  }

  verify(data: {
    phoneNumber: string
    code: string
    disableSession?: boolean
    updatePhoneNumber?: boolean
    [key: string]: any
  }): Observable<{ status: boolean; token: string | null; user: PhoneNumberUser }> {
    return defer(() => this.phoneNumber.verify(data)).pipe(
      map((data) =>
        this.mainService.mapData<{ status: boolean; token: string | null; user: PhoneNumberUser }>(data as any),
      ),
    )
  }

  requestPasswordReset(data: { phoneNumber: string }): Observable<{ status: boolean }> {
    return defer(() => this.phoneNumber.requestPasswordReset(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  resetPassword(data: { phoneNumber: string; otp: string; newPassword: string }): Observable<{ status: boolean }> {
    return defer(() => this.phoneNumber.resetPassword(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }
}
