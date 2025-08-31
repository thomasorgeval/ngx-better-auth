export interface User {
  id: string
  email: string
  emailVerified: boolean
  name: string | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}
