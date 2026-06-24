import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, type Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export interface ScimProviderConnection {
  id: string
  providerId: string
  organizationId: string | null
}

@Injectable({ providedIn: 'root' })
export class ScimService {
  private readonly mainService = inject(MainService)

  private readonly scim: any

  constructor() {
    const client = this.mainService.authClient as { scim?: any }
    validatePlugin(client, 'scim')
    this.scim = client.scim
  }

  /** Returns a provisioning secret. Display it once and avoid storing it in browser state or logs. */
  generateToken(data: { providerId: string; organizationId?: string }): Observable<{ scimToken: string }> {
    return defer(() => this.scim.generateToken(data)).pipe(
      map((data) => this.mainService.mapData<{ scimToken: string }>(data as any)),
    )
  }

  listProviderConnections(): Observable<{ providers: ScimProviderConnection[] }> {
    return this.mainService.read<{ providers: ScimProviderConnection[] }>(() => this.scim.listProviderConnections())
  }

  providerConnectionsResource(): ResourceRef<{ providers: ScimProviderConnection[] } | undefined> {
    return this.mainService.readResource<{ providers: ScimProviderConnection[] }>(() =>
      this.scim.listProviderConnections(),
    )
  }

  getProviderConnection(data: { providerId: string }): Observable<ScimProviderConnection> {
    return this.mainService.read<ScimProviderConnection>(() => this.scim.getProviderConnection({ query: data }))
  }

  deleteProviderConnection(data: { providerId: string }): Observable<{ success: boolean }> {
    return defer(() => this.scim.deleteProviderConnection(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
