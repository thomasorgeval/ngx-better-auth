import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, type Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export type SsoProviderType = 'oidc' | 'saml' | string

export interface SsoProvider {
  providerId: string
  type: SsoProviderType
  issuer: string
  domain: string
  organizationId: string | null
  domainVerified: boolean
  oidcConfig?: Record<string, unknown>
  samlConfig?: Record<string, unknown>
  spMetadataUrl?: string
  [key: string]: unknown
}

export interface SsoSignInData {
  email?: string
  organizationSlug?: string
  providerId?: string
  domain?: string
  callbackURL: string
  errorCallbackURL?: string
  newUserCallbackURL?: string
  scopes?: string[]
  loginHint?: string
  requestSignUp?: boolean
  providerType?: 'saml' | 'oidc'
}

@Injectable({ providedIn: 'root' })
export class SsoService {
  private readonly mainService = inject(MainService)

  private readonly sso: any

  constructor() {
    const client = this.mainService.authClient as { sso?: any }
    validatePlugin(client, 'sso')
    this.sso = client.sso
  }

  signIn(data: SsoSignInData): Observable<{ url: string; redirect: boolean }> {
    return defer(() => this.mainService.authClient.signIn.sso(data)).pipe(
      map((data) => this.mainService.mapData<{ url: string; redirect: boolean }>(data as any)),
    )
  }

  providers(): Observable<{ providers: SsoProvider[] }> {
    return this.mainService.read<{ providers: SsoProvider[] }>(() => this.sso.providers())
  }

  providersResource(): ResourceRef<{ providers: SsoProvider[] } | undefined> {
    return this.mainService.readResource<{ providers: SsoProvider[] }>(() => this.sso.providers())
  }

  getProvider(data: { providerId: string }): Observable<SsoProvider> {
    return this.mainService.read<SsoProvider>(() => this.sso.getProvider({ query: data }))
  }

  deleteProvider(data: { providerId: string }): Observable<{ success: boolean }> {
    return defer(() => this.sso.deleteProvider(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  requestDomainVerification(data: { providerId: string }): Observable<{ domainVerificationToken: string }> {
    return defer(() => this.sso.requestDomainVerification(data)).pipe(
      map((data) => this.mainService.mapData<{ domainVerificationToken: string }>(data as any)),
    )
  }

  verifyDomain(data: { providerId: string }): Observable<{ success: boolean }> {
    return defer(() => this.sso.verifyDomain(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
