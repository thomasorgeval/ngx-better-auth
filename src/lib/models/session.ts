export interface Session {
  userId: string
  expiresAt: Date
  createdAt: Date
  token: string
}

export interface Session2 extends Session {
  id: string
  impersonatedBy?: string
  ipAddress?: string | null
  userAgent?: string | null
}

export interface Session3 extends Session2 {
  updatedAt: Date
}
