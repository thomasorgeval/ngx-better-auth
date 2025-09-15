export interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string
  image?: string
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}
