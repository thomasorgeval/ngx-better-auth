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
   * Fetches a nonce for the given wallet address to be included in the SIWE message.
   * @param data - The wallet address and optional chain ID
   */
  getNonce(data: { walletAddress: string; chainId?: number }): Observable<SiweNonceResult> {
    return defer(() => this.siwe.getSiweNonce(data)).pipe(
      map((res) => this.mainService.mapData<SiweNonceResult>(res as any)),
    )
  }

  /**
   * Verifies a signed SIWE message and signs the user in.
   * On success, waits for the session to be established before emitting.
   * @param data - The signed message, signature, wallet address, optional chain ID and optional email
   */
  verifyMessage(data: {
    message: string
    signature: string
    walletAddress: string
    chainId?: number
    email?: string
  }): Observable<SiweVerifyResult> {
    return defer(() => this.siwe.verifySiweMessage(data)).pipe(
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
