export interface Session {
  id: string
  impersonatedBy?: string
  ipAddress?: string | null
  userAgent?: string | null
  updatedAt: Date
  userId: string
  expiresAt: Date
  createdAt: Date
  token: string
}
