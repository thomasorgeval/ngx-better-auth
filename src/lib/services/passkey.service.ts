import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { MainService } from './main.service'
import { validatePlugin } from '../utils/validate-plugin'

@Injectable({ providedIn: 'root' })
export class PasskeyService {
  private readonly mainService = inject(MainService)

  passkey: any

  constructor() {
    const client = this.mainService.authClient as { passkey?: any }
    validatePlugin(client, 'passkey')
    this.passkey = client.passkey
  }

  addPasskey(data: { name?: string; authenticatorAttachment?: 'platform' | 'cross-platform' }) {
    return defer(() => this.passkey.addPasskey(data))
  }

  listUserPasskeys() {
    return defer(() => this.passkey.listUserPasskeys())
  }

  deletePasskey(data: { id: string }) {
    return defer(() => this.passkey.deletePasskey(data))
  }

  updatePasskey(data: { id: string; name: string }) {
    return defer(() => this.passkey.updatePasskey(data))
  }
}
