import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { AuthService } from './auth.service'
import { validateAdminPlugin } from '../utils/validate-plugin'

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly authService = inject(AuthService)

  organization: any

  constructor() {
    const client = this.authService.authClient as { organization?: any }
    validateAdminPlugin(client, 'organization')
    this.organization = client.organization
  }

  createOrganization(data: { name: string; slug: string }) {
    return defer(() => this.organization.create(data))
  }
}
