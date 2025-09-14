import { ExtractPluginIds, PluginKeys, PluginsMap, UnionToIntersection } from './plugin'
import { BetterAuthPlugin } from 'better-auth'

type MergePlugins<P extends PluginKeys[]> = UnionToIntersection<PluginsMap[P[number]]['user']>

interface UserBase {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export type User<P extends BetterAuthPlugin[]> = UserBase & MergePlugins<ExtractPluginIds<P>>
