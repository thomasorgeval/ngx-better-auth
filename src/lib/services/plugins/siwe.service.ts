import { inject, Injectable } from '@angular/core'
import { defer, filter, map, Observable, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'

export interface SiweNonceResult {
  nonce: string
}

export interface SiweVerifyResult {
  token: string
  success: boolean
  user: {
    id: string
    walletAddress: string
    chainId: number
  }
}

@Injectable({ providedIn: 'root' })
export class SiweService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  siwe: any

  constructor() {
    const client = this.mainService.authClient as { siwe?: any }
    validatePlugin(client, 'siwe')
    this.siwe = client.siwe
  }

  /**
   * Fetches a nonce to be included in the SIWE message.
   */
  getNonce(): Observable<SiweNonceResult> {
    return defer(() => this.siwe.getNonce()).pipe(
      map((res) => this.mainService.mapData<SiweNonceResult>(res as any)),
    )
  }

  /**
   * Verifies a signed SIWE message and signs the user in.
   * On success, waits for the session to be established before emitting.
   * @param data - The signed message and signature
   */
  verifyMessage(data: { message: string; signature: string }): Observable<SiweVerifyResult> {
    return defer(() => this.siwe.verify(data)).pipe(
      map((res) => this.mainService.mapData<SiweVerifyResult>(res as any)),
      switchMap((result) =>
        this.authService.sessionState$.pipe(
          filter((s) => s !== null),
          map(() => result),
        ),
      ),
    )
  }
}
