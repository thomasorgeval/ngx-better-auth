import { BetterAuthPlugin } from 'better-auth'

export interface PluginUsername {
  user: {
    username: string
    displayUsername: string
  }
}

export interface PluginTwoFactor {
  user: {
    twoFactorEnabled: boolean
  }
}

export interface PluginAdmin {
  user: {
    roles: string | string[]
  }
}

export type PluginsMap = {
  usernameClient: PluginUsername
  twoFactorClient: PluginTwoFactor
  adminClient: PluginAdmin
}

export type PluginKeys = keyof PluginsMap

export type UnionToIntersection<U> = (U extends any ? (x: U) => void : never) extends (x: infer I) => void ? I : never

export type ExtractPluginIds<T extends readonly BetterAuthPlugin[]> = {
  [K in keyof T]: T[K] extends { id: infer Id } ? (Id extends PluginKeys ? Id : never) : never
}[number]
