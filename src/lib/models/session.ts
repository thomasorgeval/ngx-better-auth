import { Session, User } from 'better-auth/types'

export interface AuthSession {
  session: Session
  user: User & { role?: string[] | string }
}
