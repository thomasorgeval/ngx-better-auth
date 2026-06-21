import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, type Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'

export type StripeCustomerType = 'user' | 'organization'

export interface Subscription {
  id: string
  plan: string
  referenceId?: string
  customerId?: string
  status?: string
  periodStart?: Date | string
  periodEnd?: Date | string
  cancelAtPeriodEnd?: boolean
  seats?: number
  [key: string]: unknown
}

export interface StripeUpgradeData {
  plan: string
  annual?: boolean
  referenceId?: string
  subscriptionId?: string
  metadata?: Record<string, unknown>
  customerType?: StripeCustomerType
  seats?: number
  locale?: string
  successUrl: string
  cancelUrl: string
  returnUrl?: string
  disableRedirect?: boolean
  scheduleAtPeriodEnd?: boolean
}

export interface StripeListData {
  referenceId?: string
  customerType?: StripeCustomerType
}

export interface StripeCancelData {
  referenceId?: string
  customerType?: StripeCustomerType
  subscriptionId: string
  returnUrl: string
}

export interface StripeRestoreData {
  referenceId?: string
  customerType?: StripeCustomerType
  subscriptionId: string
}

export interface StripeBillingPortalData {
  referenceId?: string
  customerType?: StripeCustomerType
  locale?: string
  returnUrl?: string
  disableRedirect?: boolean
}

export interface StripeUpgradeResult {
  url?: string
  redirect: boolean
}

export interface StripeBillingPortalResult {
  url?: string
  redirect?: boolean
}

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly mainService = inject(MainService)

  subscription: any

  constructor() {
    const client = this.mainService.authClient as { subscription?: any }
    validatePlugin(client, 'subscription')
    this.subscription = client.subscription
  }

  upgrade(data: StripeUpgradeData): Observable<StripeUpgradeResult> {
    return defer(() => this.subscription.upgrade(data)).pipe(
      map((data) => this.mainService.mapData<StripeUpgradeResult>(data as any)),
    )
  }

  list(data?: StripeListData): Observable<Subscription[]> {
    return this.mainService.read<Subscription[]>(() => this.subscription.list({ query: data ?? {} }))
  }

  listResource(params: () => StripeListData | undefined): ResourceRef<Subscription[] | undefined> {
    return this.mainService.readResourceWithParams<Subscription[], StripeListData | undefined>(params, (data) =>
      this.subscription.list({ query: data ?? {} }),
    )
  }

  cancel(data: StripeCancelData): Observable<unknown> {
    return defer(() => this.subscription.cancel(data)).pipe(
      map((data) => this.mainService.mapData<unknown>(data as any)),
    )
  }

  restore(data: StripeRestoreData): Observable<unknown> {
    return defer(() => this.subscription.restore(data)).pipe(
      map((data) => this.mainService.mapData<unknown>(data as any)),
    )
  }

  billingPortal(data: StripeBillingPortalData): Observable<StripeBillingPortalResult> {
    return defer(() => this.subscription.billingPortal(data)).pipe(
      map((data) => this.mainService.mapData<StripeBillingPortalResult>(data as any)),
    )
  }
}
