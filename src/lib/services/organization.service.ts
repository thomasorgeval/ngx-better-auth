import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validatePlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly mainService = inject(MainService)

  organization: any

  constructor() {
    const client = this.mainService.authClient as { organization?: any }
    validatePlugin(client, 'organization')
    this.organization = client.organization
  }

  createOrganization(data: {
    name: string
    slug: string
    logo?: string
    metadata?: Record<string, any>
    keepCurrentActiveOrganization?: boolean
  }) {
    return defer(() => this.organization.create(data))
  }

  checkSlug(data: { slug: string }) {
    return defer(() => this.organization.checkSlug(data))
  }

  list() {
    return defer(() => this.organization.list())
  }

  setActive(data: { organizationId?: string | null; organizationSlug?: string }) {
    return defer(() => this.organization.setActive(data))
  }

  getFullOrganization(data: { organizationId?: string; organizationSlug?: string; membersLimit?: number }) {
    return defer(() => this.organization.getFullOrganization(data))
  }

  update(data: {
    data: {
      name?: string
      slug?: string
      logo?: string
      metadata?: Record<string, any>
    }
    organizationId?: string
  }) {
    return defer(() => this.organization.update(data))
  }

  delete(data: { organizationId: string }) {
    return defer(() => this.organization.delete(data))
  }

  inviteMember(data: { email: string; role: string | string[]; organizationId?: string; resend?: boolean; teamId?: string }) {
    return defer(() => this.organization.inviteMember(data))
  }

  acceptInvitation(data: { invitationId: string }) {
    return defer(() => this.organization.acceptInvitation(data))
  }

  cancelInvitation(data: { invitationId: string }) {
    return defer(() => this.organization.cancelInvitation(data))
  }

  rejectInvitation(data: { invitationId: string }) {
    return defer(() => this.organization.rejectInvitation(data))
  }

  getInvitation(data: { id: string }) {
    return defer(() => this.organization.getInvitation(data))
  }

  listInvitations(data: { organizationId?: string }) {
    return defer(() => this.organization.listInvitations(data))
  }

  listUserInvitations() {
    return defer(() => this.organization.listUserInvitations())
  }

  listMembers(
    data: {
      organizationId?: string
      limit?: number
      offset?: number
      sortBy?: string
      sortDirection?: 'asc' | 'desc'
      filterField?: string
      filterOperator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'contains'
      filterValue?: string
    } = {},
  ) {
    return defer(() => this.organization.listMembers(data))
  }

  removeMember(data: { memberIdOrEmail: string; organizationId?: string }) {
    return defer(() => this.organization.removeMember(data))
  }

  updateMemberRoles(data: { memberId: string; role: string | string[]; organizationId?: string }) {
    return defer(() => this.organization.updateMemberRoles(data))
  }

  getActiveMember() {
    return defer(() => this.organization.getActiveMember())
  }

  leave(data: { organizationId?: string }) {
    return defer(() => this.organization.leave(data))
  }

  createTeam(data: { name: string; organizationId?: string }) {
    return defer(() => this.organization.createTeam(data))
  }

  listTeams(data: { organizationId?: string }) {
    return defer(() => this.organization.listTeams(data))
  }

  updateTeam(data: { teamId: string; data: { name?: string; organizationId?: string; createdAt?: Date; updatedAt?: Date } }) {
    return defer(() => this.organization.updateTeam(data))
  }

  removeTeam(data: { teamId: string; organizationId?: string }) {
    return defer(() => this.organization.removeTeam(data))
  }

  setActiveTeam(data: { teamId?: string }) {
    return defer(() => this.organization.setActiveTeam(data))
  }

  listUsersTeams() {
    return defer(() => this.organization.listUsersTeams())
  }

  listTeamMembers(data: { teamId: string }) {
    return defer(() => this.organization.listTeamMembers(data))
  }

  addTeamMember(data: { teamId: string; userId: string }) {
    return defer(() => this.organization.addTeamMember(data))
  }

  removeTeamMember(data: { teamId: string; userId: string }) {
    return defer(() => this.organization.removeTeamMember(data))
  }
}
