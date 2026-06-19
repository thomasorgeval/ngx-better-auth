import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import type { Organization, Member, Invitation } from 'better-auth/plugins/organization'

type FullOrganizationParams = {
  organizationId?: string
  organizationSlug?: string
  membersLimit?: number
}

type InvitationDetails = {
  organizationName: string
  organizationSlug: string
  inviterEmail: string
} & Invitation

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly mainService = inject(MainService)

  organization: any

  constructor() {
    const client = this.mainService.authClient as { organization?: any }
    validatePlugin(client, 'organization')
    this.organization = client.organization
  }

  create(data: {
    name: string
    slug: string
    logo?: string
    metadata?: Record<string, any>
    keepCurrentActiveOrganization?: boolean
  }): Observable<Organization> {
    return defer(() => this.organization.create(data)).pipe(
      map((data) => this.mainService.mapData<Organization>(data as any)),
    )
  }

  checkSlug(data: { slug: string }): Observable<unknown> {
    return defer(() => this.organization.checkSlug(data))
  }

  list(): Observable<Organization[]> {
    return this.mainService.read<Organization[]>(() => this.organization.list())
  }

  organizationsResource(): ResourceRef<Organization[] | undefined> {
    return this.mainService.readResource<Organization[]>(() => this.organization.list())
  }

  setActive(data: { organizationId?: string; organizationSlug?: string }): Observable<Organization> {
    return defer(() => this.organization.setActive(data)).pipe(
      map((data) => this.mainService.mapData<Organization>(data as any)),
    )
  }

  getFullOrganization(data: FullOrganizationParams): Observable<Organization> {
    return defer(() => this.organization.getFullOrganization(data)).pipe(
      map((data) => this.mainService.mapData<Organization>(data as any)),
    )
  }

  fullOrganizationResource(params: () => FullOrganizationParams): ResourceRef<Organization | undefined> {
    return this.mainService.readResourceWithParams<Organization, FullOrganizationParams>(params, (data) =>
      this.organization.getFullOrganization(data),
    )
  }

  update(data: {
    data: {
      name?: string
      slug?: string
      logo?: string
      metadata?: Record<string, any>
    }
    organizationId?: string
  }): Observable<Organization> {
    return defer(() => this.organization.update(data)).pipe(
      map((data) => this.mainService.mapData<Organization>(data as any)),
    )
  }

  delete(data: { organizationId: string }): Observable<void> {
    return defer(() => this.organization.delete(data)).pipe(map((data) => this.mainService.mapData<void>(data as any)))
  }

  inviteMember(data: {
    email: string
    role: string | string[]
    organizationId?: string
    resend?: boolean
    teamId?: string
  }): Observable<Invitation> {
    return defer(() => this.organization.inviteMember(data)).pipe(
      map((data) => this.mainService.mapData<Invitation>(data as any)),
    )
  }

  acceptInvitation(data: { invitationId: string }): Observable<{ invitation: Invitation; member: Member }> {
    return defer(() => this.organization.acceptInvitation(data)).pipe(
      map((data) => this.mainService.mapData<{ invitation: Invitation; member: Member }>(data as any)),
    )
  }

  cancelInvitation(data: { invitationId: string }): Observable<void> {
    return defer(() => this.organization.cancelInvitation(data)).pipe(
      map((data) => this.mainService.mapData<void>(data as any)),
    )
  }

  rejectInvitation(data: { invitationId: string }): Observable<{ invitation: Invitation; member: null }> {
    return defer(() => this.organization.rejectInvitation(data)).pipe(
      map((data) => this.mainService.mapData<{ invitation: Invitation; member: null }>(data as any)),
    )
  }

  getInvitation(data: { id: string }): Observable<InvitationDetails> {
    return defer(() => this.organization.getInvitation(data)).pipe(
      map((data) => this.mainService.mapData<InvitationDetails>(data as any)),
    )
  }

  invitationResource(params: () => { id: string }): ResourceRef<InvitationDetails | undefined> {
    return this.mainService.readResourceWithParams<InvitationDetails, { id: string }>(params, (data) =>
      this.organization.getInvitation(data),
    )
  }

  listInvitations(data: { organizationId?: string }): Observable<Invitation[]> {
    return this.mainService.read<Invitation[]>(() => this.organization.listInvitations(data))
  }

  invitationsResource(params: () => { organizationId?: string }): ResourceRef<Invitation[] | undefined> {
    return this.mainService.readResourceWithParams<Invitation[], { organizationId?: string }>(params, (data) =>
      this.organization.listInvitations(data),
    )
  }

  listUserInvitations(): Observable<Invitation[]> {
    return this.mainService.read<Invitation[]>(() => this.organization.listUserInvitations())
  }

  userInvitationsResource(): ResourceRef<Invitation[] | undefined> {
    return this.mainService.readResource<Invitation[]>(() => this.organization.listUserInvitations())
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

  removeMember(data: { memberIdOrEmail: string; organizationId?: string }): Observable<{ member: Member }> {
    return defer(() => this.organization.removeMember(data)).pipe(
      map((data) => this.mainService.mapData<{ member: Member }>(data as any)),
    )
  }

  updateMemberRoles(data: { memberId: string; role: string | string[]; organizationId?: string }) {
    return defer(() => this.organization.updateMemberRoles(data))
  }

  getActiveMember(): Observable<Member> {
    return this.mainService.read<Member>(() => this.organization.getActiveMember())
  }

  activeMemberResource(): ResourceRef<Member | undefined> {
    return this.mainService.readResource<Member>(() => this.organization.getActiveMember())
  }

  leave(data: { organizationId?: string }): Observable<void> {
    return defer(() => this.organization.leave(data)).pipe(map((data) => this.mainService.mapData<void>(data as any)))
  }

  createTeam(data: { name: string; organizationId?: string }) {
    return defer(() => this.organization.createTeam(data))
  }

  listTeams(data: { organizationId?: string }) {
    return defer(() => this.organization.listTeams(data))
  }

  updateTeam(data: {
    teamId: string
    data: { name?: string; organizationId?: string; createdAt?: Date; updatedAt?: Date }
  }) {
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
