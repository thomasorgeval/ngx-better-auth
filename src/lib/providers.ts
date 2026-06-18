import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core'
import { type BetterAuthClientOptions } from 'better-auth/client'
import { AuthService } from './services'

export const BETTER_AUTH_CONFIG_TOKEN = new InjectionToken<BetterAuthClientOptions>('BETTER_AUTH_CONFIG')

const DEFAULT_CONFIG: Partial<BetterAuthClientOptions> = {}

export function provideBetterAuth(options: BetterAuthClientOptions): EnvironmentProviders {
  const config: BetterAuthClientOptions = { ...DEFAULT_CONFIG, ...options }

  // if baseURL is not a url, it might be because of a proxy in development
  if (!config.baseURL?.startsWith('http')) {
    config.baseURL = window.location.origin
  }

  return makeEnvironmentProviders([{ provide: BETTER_AUTH_CONFIG_TOKEN, useValue: config }, AuthService])
}
