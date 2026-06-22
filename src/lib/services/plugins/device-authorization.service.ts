import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  verification_uri_complete: string
  expires_in: number
  interval: number
}

export interface DeviceTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

export interface DeviceVerificationResponse {
  user_code: string
  status: string
}

@Injectable({ providedIn: 'root' })
export class DeviceAuthorizationService {
  private readonly mainService = inject(MainService)

  private readonly device: any

  constructor() {
    const client = this.mainService.authClient as { device?: any }
    validatePlugin(client, 'device')
    this.device = client.device
  }

  code(data: { client_id: string; user_id?: string; scope?: string }): Observable<DeviceCodeResponse> {
    return defer(() => this.device.code(data)).pipe(
      map((data) => this.mainService.mapData<DeviceCodeResponse>(data as any)),
    )
  }

  token(data: {
    grant_type: 'urn:ietf:params:oauth:grant-type:device_code'
    device_code: string
    client_id: string
  }): Observable<DeviceTokenResponse> {
    return defer(() => this.device.token(data)).pipe(
      map((data) => this.mainService.mapData<DeviceTokenResponse>(data as any)),
    )
  }

  verify(data: { user_code: string }): Observable<DeviceVerificationResponse> {
    return defer(() => this.device({ query: data })).pipe(
      map((data) => this.mainService.mapData<DeviceVerificationResponse>(data as any)),
    )
  }

  approve(data: { userCode: string }): Observable<{ success: boolean }> {
    return defer(() => this.device.approve(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  deny(data: { userCode: string }): Observable<{ success: boolean }> {
    return defer(() => this.device.deny(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
