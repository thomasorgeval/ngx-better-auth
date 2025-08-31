import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from './main.service'
import { validatePlugin } from '../utils/validate-plugin'
import { Passkey } from '../models'

@Injectable({ providedIn: 'root' })
export class PasskeyService {
  private readonly mainService = inject(MainService)

  passkey: any

  constructor() {
    const client = this.mainService.authClient as { passkey?: any }
    validatePlugin(client, 'passkey')
    this.passkey = client.passkey
  }

  addPasskey(data: {
    name?: string
    authenticatorAttachment?: AuthenticatorAttachment
  }): Observable<{ passkey: Passkey }> {
    return defer(() => this.passkey.addPasskey(data)).pipe(
      map((data) => this.mainService.mapData<{ passkey: Passkey }>(data as any)),
    )
  }

  signIn(data: { email: string; autoFill?: boolean; callbackURL?: string }): Observable<unknown> {
    return defer(() => (this.mainService.authClient.signIn as any).passkey(data))
  }

  listUserPasskeys(): Observable<Passkey[]> {
    return defer(() => this.passkey.listUserPasskeys()).pipe(
      map((data) => this.mainService.mapData<Passkey[]>(data as any)),
    )
  }

  deletePasskey(data: { id: string }): Observable<{ status: boolean }> {
    return defer(() => this.passkey.deletePasskey(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }

  updatePasskey(data: { id: string; name: string }): Observable<{ passkey: Passkey }> {
    return defer(() => this.passkey.updatePasskey(data)).pipe(
      map((data) => this.mainService.mapData<{ passkey: Passkey }>(data as any)),
    )
  }
}
