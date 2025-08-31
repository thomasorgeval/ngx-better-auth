import { User } from 'better-auth/types'

export interface Session {
  id: string
  userId: string
  expiresAt: Date
  createdAt: Date
  updatedAt: Date
  token: string
  ipAddress?: string | null | undefined
  userAgent?: string | null | undefined
}

export interface AuthSession {
  session: Session
  user: User & { role?: string[] | string }
}
