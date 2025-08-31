import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { validateAdminPlugin } from '../utils/validate-plugin'
import { MainService } from './main.service'

@Injectable({ providedIn: 'root' })
export class OrganizationService {
  private readonly mainService = inject(MainService)

  organization: any

  constructor() {
    const client = this.mainService.authClient as { organization?: any }
    validateAdminPlugin(client, 'organization')
    this.organization = client.organization
  }

  createOrganization(data: { name: string; slug: string }) {
    return defer(() => this.organization.create(data))
  }
}
