import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validatePlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class TwoFactorService {
  private readonly mainService = inject(MainService)

  twoFactor: any

  constructor() {
    const client = this.mainService.authClient as { twoFactor?: any }
    validatePlugin(client, 'twoFactor')
    this.twoFactor = client.twoFactor
  }

  enable(data: { password: string; issuer?: string }) {
    return defer(() => this.twoFactor.enable(data))
  }

  disable(data: { password: string }) {
    return defer(() => this.twoFactor.disable(data))
  }

  getTotpUri(data: { password: string }) {
    return defer(() => this.twoFactor.getTotpUri(data))
  }

  verifyTotp(data: { code: string; trustDevice?: boolean }) {
    return defer(() => this.twoFactor.verifyTotp(data))
  }

  sendOtp(data: { trustDevice?: boolean }) {
    return defer(() => this.twoFactor.sendOtp(data))
  }

  verifyOtp(data: { code: string; trustDevice?: boolean }) {
    return defer(() => this.twoFactor.verifyOtp(data))
  }

  generateBackupCodes(data: { password: string }) {
    return defer(() => this.twoFactor.generateBackupCodes(data))
  }

  verifyBackupCode(data: { code: string; disableSession?: boolean; trustDevice?: boolean }) {
    return defer(() => this.twoFactor.verifyBackupCode(data))
  }
}
