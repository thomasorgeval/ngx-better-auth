import { inject, Injectable } from '@angular/core'
import { defer, filter, first, map, Observable, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'
import type { User, Session } from 'better-auth'

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  twoFactor: any

  constructor() {
    const client = this.mainService.authClient as { twoFactor?: any }
    validatePlugin(client, 'twoFactor')
    this.twoFactor = client.twoFactor
  }

  enable(data: { password: string; issuer?: string }): Observable<{ totpURI: string; backupCodes: string[] }> {
    return defer(() => this.twoFactor.enable(data)).pipe(
      map((data) =>
        this.mainService.mapData<{
          totpURI: string
          backupCodes: string[]
        }>(data as any),
      ),
    )
  }

  disable(data: { password: string }): Observable<{ status: boolean }> {
    return defer(() => this.twoFactor.disable(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  getTotpUri(data: { password: string }): Observable<{ totpURI: string }> {
    return defer(() => this.twoFactor.getTotpUri(data)).pipe(
      map((data) => this.mainService.mapData<{ totpURI: string }>(data as any)),
    )
  }

  verifyTotp(data: { code: string; trustDevice?: boolean }): Observable<{ status: boolean }> {
    return defer(() => this.twoFactor.verifyTotp(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
      first(),
      map(() => ({ status: true })),
    )
  }

  sendOtp(): Observable<{ status: boolean }> {
    return defer(() => this.twoFactor.sendOtp()).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  verifyOtp(data: { code: string; trustDevice?: boolean }): Observable<{ status: boolean }> {
    return defer(() => this.twoFactor.verifyOtp(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
      first(),
      map(() => ({ status: true })),
    )
  }

  generateBackupCodes(data: { password: string }): Observable<{ status: boolean; backupCodes: string[] }> {
    return defer(() => this.twoFactor.generateBackupCodes(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean; backupCodes: string[] }>(data as any)),
    )
  }

  verifyBackupCode(data: { code: string; disableSession?: boolean; trustDevice?: boolean }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => this.twoFactor.verifyBackupCode(data)).pipe(
      map((data) =>
        this.mainService.mapData<{
          user: User
          session: Session
        }>(data as any),
      ),
    )
  }
}
