export interface Account {
  id: string
  provider: string
  createdAt: Date
  updatedAt: Date
  accountId: string
  scopes: string[]
}
