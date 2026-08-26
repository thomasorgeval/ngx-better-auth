export interface Account {
  id: string
  providerId: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  userId: string
  issuer: string
  scopes: string[]
  [key: string]: any
}
