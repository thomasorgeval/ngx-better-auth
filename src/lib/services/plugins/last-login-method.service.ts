import { inject, Injectable } from '@angular/core'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

@Injectable({ providedIn: 'root' })
export class LastLoginMethodService {
  private readonly mainService = inject(MainService)

  constructor() {
    validatePlugin(this.mainService.authClient, 'getLastUsedLoginMethod')
  }

  getLastUsedLoginMethod(): string | null {
    return this.mainService.authClient.getLastUsedLoginMethod()
  }

  clearLastUsedLoginMethod(): void {
    this.mainService.authClient.clearLastUsedLoginMethod()
  }

  isLastUsedLoginMethod(method: string): boolean {
    return this.mainService.authClient.isLastUsedLoginMethod(method)
  }
}
