import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { MainService } from '../main.service'
import { Session, User } from '../../models'

type ListUsersParams = {
  searchValue?: string
  searchField?: 'email' | 'name'
  searchOperator?: 'contains' | 'start_with' | 'end_with'
  limit?: number
  offset?: number
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  filterField?: string
  filterValue?: string | number | boolean
  filterOperator?: 'eq' | 'ne' | 'lt' | 'lte' | 'gt' | 'gte'
}

type ListUsersResult = { users: User[]; total: number; limit: number; offset: number }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly mainService = inject(MainService)

  admin: any

  constructor() {
    const client = this.mainService.authClient as { admin?: any }
    validatePlugin(client, 'admin')
    this.admin = client.admin
  }

  setRole(data: { userId: string; role: string | string[] }): Observable<{ user: User }> {
    return defer(() => this.admin.setRole(data)).pipe(
      map((data) => this.mainService.mapData<{ user: User }>(data as any)),
    )
  }

  getUser(data: { id: string }): Observable<User> {
    return this.mainService.read<User>(() => this.admin.getUser({ query: data }))
  }

  createUser(data: {
    email: string
    password: string
    name: string
    role?: string | string[]
    data?: Record<string, any>
  }): Observable<{ user: User }> {
    return defer(() => this.admin.createUser(data)).pipe(
      map((data) => this.mainService.mapData<{ user: User }>(data as any)),
    )
  }

  updateUser(data: { userId: string; data: Partial<User> }): Observable<{ user: User }> {
    return defer(() => this.admin.updateUser(data)).pipe(
      map((data: any) => this.mainService.mapData<{ user: User }>(data)),
    )
  }

  listUsers(data: ListUsersParams): Observable<ListUsersResult> {
    return this.mainService.read<ListUsersResult>(() => this.admin.listUsers(data))
  }

  usersResource(params: () => ListUsersParams): ResourceRef<ListUsersResult | undefined> {
    return this.mainService.readResourceWithParams<ListUsersResult, ListUsersParams>(params, (data) =>
      this.admin.listUsers(data),
    )
  }

  listUserSessions(data: { userId: string }): Observable<{ sessions: Session[] }> {
    return this.mainService.read<{ sessions: Session[] }>(() => this.admin.listUserSessions(data))
  }

  userSessionsResource(params: () => { userId: string }): ResourceRef<{ sessions: Session[] } | undefined> {
    return this.mainService.readResourceWithParams<{ sessions: Session[] }, { userId: string }>(params, (data) =>
      this.admin.listUserSessions(data),
    )
  }

  unbanUser(data: { userId: string }): Observable<{ user: User }> {
    return defer(() => this.admin.unbanUser(data)).pipe(
      map((data: any) => this.mainService.mapData<{ user: User }>(data)),
    )
  }

  banUser(data: { userId: string; banReason?: string; banExpiresIn?: number }): Observable<{ user: User }> {
    return defer(() => this.admin.banUser(data)).pipe(
      map((data: any) => this.mainService.mapData<{ user: User }>(data)),
    )
  }

  impersonateUser(data: { userId: string }): Observable<{ session: Session; user: User }> {
    return defer(() => this.admin.impersonateUser(data)).pipe(
      map((data: any) => this.mainService.mapData<{ session: Session; user: User }>(data)),
    )
  }

  stopImpersonating(): Observable<unknown> {
    return defer(() => this.admin.stopImpersonating())
  }

  revokeUserSession(data: { sessionToken: string }): Observable<{ success: boolean }> {
    return defer(() => this.admin.revokeUserSession(data)).pipe(
      map((data: any) => this.mainService.mapData<{ success: boolean }>(data)),
    )
  }

  revokeUserSessions(data: { userId: string }): Observable<{ success: boolean }> {
    return defer(() => this.admin.revokeUserSessions(data)).pipe(
      map((data: any) => this.mainService.mapData<{ success: boolean }>(data)),
    )
  }

  removeUser(data: { userId: string }): Observable<{ success: boolean }> {
    return defer(() => this.admin.removeUser(data)).pipe(
      map((data: any) => this.mainService.mapData<{ success: boolean }>(data)),
    )
  }

  setUserPassword(data: { userId: string; newPassword: string }): Observable<{ success: boolean }> {
    return defer(() => this.admin.setUserPassword(data)).pipe(
      map((data: any) => this.mainService.mapData<{ success: boolean }>(data)),
    )
  }

  hasPermission(data: { userId?: string; permissions: Record<string, string[]> }) {
    return defer(() => this.admin.hasPermission(data))
  }

  checkRolePermission(data: { role: string; permissions: Record<string, string[]> }) {
    return defer(() => this.admin.checkRolePermission(data))
  }
}
