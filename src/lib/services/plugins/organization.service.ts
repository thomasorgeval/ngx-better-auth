import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import type { Organization, Member, Invitation, Team, TeamMember, OrganizationRole } from 'better-auth/plugins/organization'

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

type OrganizationPermission = Record<string, string[]>
type OrganizationRoleData = OrganizationRole & {
  id: string
  organizationId: string
  role: string
  permission: OrganizationPermission
  createdAt: Date
  updatedAt?: Date
  [key: string]: any
}

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
    return defer(() => this.organization.checkSlug(data)).pipe(
      map((data) => this.mainService.mapData<unknown>(data as any)),
    )
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
    return defer(() => this.organization.getFullOrganization({ query: data })).pipe(
      map((data) => this.mainService.mapData<Organization>(data as any)),
    )
  }

  fullOrganizationResource(params: () => FullOrganizationParams): ResourceRef<Organization | undefined> {
    return this.mainService.readResourceWithParams<Organization, FullOrganizationParams>(params, (data) =>
      this.organization.getFullOrganization({ query: data }),
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
    return defer(() => this.organization.getInvitation({ query: data })).pipe(
      map((data) => this.mainService.mapData<InvitationDetails>(data as any)),
    )
  }

  invitationResource(params: () => { id: string }): ResourceRef<InvitationDetails | undefined> {
    return this.mainService.readResourceWithParams<InvitationDetails, { id: string }>(params, (data) =>
      this.organization.getInvitation({ query: data }),
    )
  }

  listInvitations(data: { organizationId?: string }): Observable<Invitation[]> {
    return this.mainService.read<Invitation[]>(() => this.organization.listInvitations({ query: data }))
  }

  invitationsResource(params: () => { organizationId?: string }): ResourceRef<Invitation[] | undefined> {
    return this.mainService.readResourceWithParams<Invitation[], { organizationId?: string }>(params, (data) =>
      this.organization.listInvitations({ query: data }),
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
  ): Observable<{ members: Member[]; total: number }> {
    return this.mainService.read<{ members: Member[]; total: number }>(() =>
      this.organization.listMembers({ query: data }),
    )
  }

  removeMember(data: { memberIdOrEmail: string; organizationId?: string }): Observable<{ member: Member }> {
    return defer(() => this.organization.removeMember(data)).pipe(
      map((data) => this.mainService.mapData<{ member: Member }>(data as any)),
    )
  }

  updateMemberRoles(data: { memberId: string; role: string | string[]; organizationId?: string }): Observable<Member> {
    return defer(() => this.organization.updateMemberRole(data)).pipe(
      map((data) => this.mainService.mapData<Member>(data as any)),
    )
  }

  getActiveMember(): Observable<Member> {
    return this.mainService.read<Member>(() => this.organization.getActiveMember())
  }

  activeMemberResource(): ResourceRef<Member | undefined> {
    return this.mainService.readResource<Member>(() => this.organization.getActiveMember())
  }

  getActiveMemberRole(data?: {
    userId?: string
    organizationId?: string
    organizationSlug?: string
  }): Observable<{ role: string }> {
    return this.mainService.read<{ role: string }>(() =>
      this.organization.getActiveMemberRole(data ? { query: data } : undefined),
    )
  }

  activeMemberRoleResource(
    params: () => { userId?: string; organizationId?: string; organizationSlug?: string } | undefined,
  ): ResourceRef<{ role: string } | undefined> {
    return this.mainService.readResourceWithParams<
      { role: string },
      { userId?: string; organizationId?: string; organizationSlug?: string } | undefined
    >(params, (data) => this.organization.getActiveMemberRole(data ? { query: data } : undefined))
  }

  leave(data: { organizationId?: string }): Observable<void> {
    return defer(() => this.organization.leave(data)).pipe(map((data) => this.mainService.mapData<void>(data as any)))
  }

  hasPermission(data: {
    organizationId?: string
    permission?: OrganizationPermission
    permissions?: OrganizationPermission
  }): Observable<{ success: boolean; error?: string }> {
    return defer(() => this.organization.hasPermission(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean; error?: string }>(data as any)),
    )
  }

  createRole(data: {
    role: string
    permission: OrganizationPermission
    organizationId?: string
    additionalFields?: Record<string, any>
  }): Observable<{ success: boolean; roleData: OrganizationRoleData; statements: Record<string, string[]> }> {
    return defer(() => this.organization.createRole(data)).pipe(
      map((data) =>
        this.mainService.mapData<{
          success: boolean
          roleData: OrganizationRoleData
          statements: Record<string, string[]>
        }>(data as any),
      ),
    )
  }

  deleteRole(data: { organizationId?: string; roleName?: string; roleId?: string }): Observable<{ success: boolean }> {
    return defer(() => this.organization.deleteRole(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  listRoles(data: { organizationId?: string } = {}): Observable<OrganizationRoleData[]> {
    return this.mainService.read<OrganizationRoleData[]>(() => this.organization.listRoles({ query: data }))
  }

  rolesResource(
    params: () => { organizationId?: string } = () => ({}),
  ): ResourceRef<OrganizationRoleData[] | undefined> {
    return this.mainService.readResourceWithParams<OrganizationRoleData[], { organizationId?: string }>(
      params,
      (data) => this.organization.listRoles({ query: data }),
    )
  }

  getRole(data?: { organizationId?: string; roleName?: string; roleId?: string }): Observable<OrganizationRoleData> {
    return this.mainService.read<OrganizationRoleData>(() =>
      this.organization.getRole(data ? { query: data } : undefined),
    )
  }

  updateRole(data: {
    organizationId?: string
    roleName?: string
    roleId?: string
    data: { permission?: OrganizationPermission; roleName?: string; [key: string]: any }
  }): Observable<{ success: boolean; roleData: OrganizationRoleData }> {
    return defer(() => this.organization.updateRole(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean; roleData: OrganizationRoleData }>(data as any)),
    )
  }

  createTeam(data: { name: string; organizationId?: string }): Observable<Team> {
    return defer(() => this.organization.createTeam(data)).pipe(
      map((data) => this.mainService.mapData<Team>(data as any)),
    )
  }

  listTeams(data: { organizationId?: string } = {}): Observable<Team[]> {
    return this.mainService.read<Team[]>(() => this.organization.listTeams({ query: data }))
  }

  teamsResource(params: () => { organizationId?: string } = () => ({})): ResourceRef<Team[] | undefined> {
    return this.mainService.readResourceWithParams<Team[], { organizationId?: string }>(params, (data) =>
      this.organization.listTeams({ query: data }),
    )
  }

  updateTeam(data: {
    teamId: string
    data: { name?: string; organizationId?: string; createdAt?: Date; updatedAt?: Date }
  }): Observable<Team | null> {
    return defer(() => this.organization.updateTeam(data)).pipe(
      map((data) => this.mainService.mapData<Team | null>(data as any)),
    )
  }

  removeTeam(data: { teamId: string; organizationId?: string }): Observable<{ message: string }> {
    return defer(() => this.organization.removeTeam(data)).pipe(
      map((data) => this.mainService.mapData<{ message: string }>(data as any)),
    )
  }

  setActiveTeam(data: { teamId?: string }): Observable<Team | null> {
    return defer(() => this.organization.setActiveTeam(data)).pipe(
      map((data) => this.mainService.mapData<Team | null>(data as any)),
    )
  }

  listUserTeams(): Observable<Team[]> {
    return this.mainService.read<Team[]>(() => this.organization.listUserTeams())
  }

  listUsersTeams(): Observable<Team[]> {
    return this.listUserTeams()
  }

  userTeamsResource(): ResourceRef<Team[] | undefined> {
    return this.mainService.readResource<Team[]>(() => this.organization.listUserTeams())
  }

  listTeamMembers(data: { teamId: string }): Observable<TeamMember[]> {
    return this.mainService.read<TeamMember[]>(() => this.organization.listTeamMembers({ query: data }))
  }

  teamMembersResource(params: () => { teamId: string }): ResourceRef<TeamMember[] | undefined> {
    return this.mainService.readResourceWithParams<TeamMember[], { teamId: string }>(params, (data) =>
      this.organization.listTeamMembers({ query: data }),
    )
  }

  addTeamMember(data: { teamId: string; userId: string }): Observable<TeamMember> {
    return defer(() => this.organization.addTeamMember(data)).pipe(
      map((data) => this.mainService.mapData<TeamMember>(data as any)),
    )
  }

  removeTeamMember(data: { teamId: string; userId: string }): Observable<{ message: string }> {
    return defer(() => this.organization.removeTeamMember(data)).pipe(
      map((data) => this.mainService.mapData<{ message: string }>(data as any)),
    )
  }
}
