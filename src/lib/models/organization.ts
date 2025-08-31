export interface Organization {
  id?: string
  name: string
  created: Date
  logo: string
  metadata: Record<string, any>
  slug: string
}

export interface Invitation {
  id?: string
  role?: string | string[]
  email: string
  expiresAt: Date
  inviterId: string
  organizationId: string
  status: InvitationStatus
}

export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'canceled'

export interface Member {
  createdAt: Date
  role: string | string[]
  userId: string
  organizationId: string
  id?: string
}

export interface Member2 extends Omit<Member, 'createdAt'> {}
