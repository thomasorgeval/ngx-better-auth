import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

@Injectable({ providedIn: 'root' })
export class MagicLinkService {
  private readonly mainService = inject(MainService)

  magicLink: any

  constructor() {
    const client = this.mainService.authClient as { magicLink?: any }
    validatePlugin(client, 'magicLink')
    this.magicLink = client.magicLink
  }

  signIn(data: {
    email: string
    name?: string
    callbackURL?: string
    newUserCallbackURL?: string
    errorCallbackURL?: string
  }) {
    return defer(() => (this.mainService.authClient.signIn as any).magicLink(data))
  }

  verify(data: { token: string; callbackURL?: string }) {
    return defer(() => this.magicLink.verify(data))
  }
}
