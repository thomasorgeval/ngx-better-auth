import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'
import { Session2, User } from '../models'

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private readonly mainService = inject(MainService)

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
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  sendOtp(): Observable<{ status: boolean }> {
    return defer(() => this.twoFactor.sendOtp()).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  verifyOtp(data: { code: string; trustDevice?: boolean }): Observable<{ token: string; user: User }> {
    return defer(() => this.twoFactor.verifyOtp(data)).pipe(
      map((data) => this.mainService.mapData<{ token: string; user: User }>(data as any)),
    )
  }

  generateBackupCodes(data: { password: string }): Observable<{ status: boolean; backupCodes: string[] }> {
    return defer(() => this.twoFactor.generateBackupCodes(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean; backupCodes: string[] }>(data as any)),
    )
  }

  verifyBackupCode(data: { code: string; disableSession?: boolean; trustDevice?: boolean }): Observable<{
    user: User
    session: Session2
  }> {
    return defer(() => this.twoFactor.verifyBackupCode(data)).pipe(
      map((data) =>
        this.mainService.mapData<{
          user: User
          session: Session2
        }>(data as any),
      ),
    )
  }
}
