import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validatePlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class OneTapService {
  private readonly mainService = inject(MainService)

  oneTap: any

  constructor() {
    const client = this.mainService.authClient as { oneTap?: any }
    validatePlugin(client, 'oneTap')
    this.oneTap = client.oneTap
  }

  signIn(data?: {
    fetchOptions?: {
      onSuccess: () => void
    }
    callbackURL?: string
    onPromptNotification?: (notification: any) => void
  }) {
    return defer(() => this.oneTap(data))
  }
}
