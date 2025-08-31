import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validatePlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly mainService = inject(MainService)

  admin: any

  constructor() {
    const client = this.mainService.authClient as { admin?: any }
    validatePlugin(client, 'admin')
    this.admin = client.admin
  }

  setRole(data: { userId: string; role: any }) {
    return defer(() => this.admin.setRole(data))
  }

  setUserPassword(data: { userId: string; newPassword: string }) {
    return defer(() => this.admin.setUserPassword(data))
  }

  banUser(data: { userId: string; banReason?: string; banExpiresIn?: number }) {
    return defer(() => this.admin.banUser(data))
  }

  unbanUser(data: { userId: string }) {
    return defer(() => this.admin.unbanUser(data))
  }

  listUserSessions(data: { userId: string }) {
    return defer(() => this.admin.listUserSessions(data))
  }

  revokeUserSession(data: { sessionToken: string }) {
    return defer(() => this.admin.revokeUserSession(data))
  }

  revokeUserSessions(data: { userId: string }) {
    return defer(() => this.admin.revokeUserSessions(data))
  }

  impersonateUser(data: { userId: string }) {
    return defer(() => this.admin.impersonateUser(data))
  }

  stopImpersonating() {
    return defer(() => this.admin.stopImpersonating())
  }

  removeUser(data: { userId: string }) {
    return defer(() => this.admin.removeUser(data))
  }

  hasPermission(data: { userId?: string; permission?: any; permissions?: any }) {
    return defer(() => this.admin.hasPermission(data))
  }

  checkRolePermission(data: { role: any; permission: any }) {
    return this.admin.checkRolePermission(data)
  }
}
