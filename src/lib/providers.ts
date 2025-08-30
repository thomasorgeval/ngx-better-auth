import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core'
import { type BetterAuthOptions } from 'better-auth'
import { AuthService } from './services'

export const BETTER_AUTH_CONFIG_TOKEN = new InjectionToken<BetterAuthOptions>('BETTER_AUTH_CONFIG')

const DEFAULT_CONFIG: Partial<BetterAuthOptions> = {}

export function provideBetterAuth(options: BetterAuthOptions): EnvironmentProviders {
  const config: BetterAuthOptions = { ...DEFAULT_CONFIG, ...options }

  // if baseURL is not a url, it might be because of a proxy in development
  if (!config.baseURL?.startsWith('http')) {
    config.baseURL = window.location.origin + config.baseURL
  }

  return makeEnvironmentProviders([{ provide: BETTER_AUTH_CONFIG_TOKEN, useValue: config }, AuthService])
}
