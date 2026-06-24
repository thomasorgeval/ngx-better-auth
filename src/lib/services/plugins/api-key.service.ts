import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, type Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export interface ApiKey {
  id: string
  configId: string
  name: string | null
  start: string | null
  prefix: string | null
  referenceId: string
  enabled: boolean
  rateLimitEnabled: boolean
  rateLimitTimeWindow: number | null
  rateLimitMax: number | null
  requestCount: number
  remaining: number | null
  refillAmount: number | null
  refillInterval: number | null
  lastRefillAt: Date | string | null
  lastRequest: Date | string | null
  expiresAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
  metadata: Record<string, unknown> | null
  permissions: Record<string, string[]> | null
}

export interface ApiKeyCreateData {
  configId?: string
  name?: string
  expiresIn?: number | null
  prefix?: string
  remaining?: number | null
  metadata?: unknown
  refillAmount?: number
  refillInterval?: number
  rateLimitTimeWindow?: number
  rateLimitMax?: number
  rateLimitEnabled?: boolean
  permissions?: Record<string, string[]>
  userId?: string
  organizationId?: string
}

export interface ApiKeyUpdateData extends Omit<Partial<ApiKeyCreateData>, 'prefix' | 'organizationId' | 'permissions'> {
  keyId: string
  enabled?: boolean
  permissions?: Record<string, string[]> | null
}

export interface ApiKeyListData {
  configId?: string
  organizationId?: string
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
}

export interface ApiKeyListResult {
  apiKeys: ApiKey[]
  total: number
  limit?: number
  offset?: number
}

@Injectable({ providedIn: 'root' })
export class ApiKeyService {
  private readonly mainService = inject(MainService)

  private readonly apiKey: any

  constructor() {
    const client = this.mainService.authClient as { apiKey?: any }
    validatePlugin(client, 'apiKey')
    this.apiKey = client.apiKey
  }

  create(data: ApiKeyCreateData = {}): Observable<ApiKey & { key: string }> {
    return defer(() => this.apiKey.create(data)).pipe(
      map((data) => this.mainService.mapData<ApiKey & { key: string }>(data as any)),
    )
  }

  get(data: { id: string; configId?: string }): Observable<ApiKey> {
    return this.mainService.read<ApiKey>(() => this.apiKey.get({ query: data }))
  }

  update(data: ApiKeyUpdateData): Observable<ApiKey> {
    return defer(() => this.apiKey.update(data)).pipe(map((data) => this.mainService.mapData<ApiKey>(data as any)))
  }

  delete(data: { keyId: string; configId?: string }): Observable<{ success: boolean }> {
    return defer(() => this.apiKey.delete(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  list(data?: ApiKeyListData): Observable<ApiKeyListResult> {
    return this.mainService.read<ApiKeyListResult>(() => this.apiKey.list({ query: data ?? {} }))
  }

  listResource(params: () => ApiKeyListData | undefined): ResourceRef<ApiKeyListResult | undefined> {
    return this.mainService.readResourceWithParams<ApiKeyListResult, ApiKeyListData | undefined>(params, (data) =>
      this.apiKey.list({ query: data ?? {} }),
    )
  }

  deleteAllExpired(): Observable<{ success: boolean; error: unknown }> {
    return defer(() => this.apiKey.deleteAllExpiredApiKeys()).pipe(
      map((data) => this.mainService.mapData<{ success: boolean; error: unknown }>(data as any)),
    )
  }
}
