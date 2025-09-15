export interface Session {
  id: string
  impersonatedBy?: string
  ipAddress?: string
  userAgent?: string
  updatedAt: Date
  userId: string
  expiresAt: Date
  createdAt: Date
  token: string
  [key: string]: any
}
