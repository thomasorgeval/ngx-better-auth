import { inject, Injectable, type ResourceRef } from '@angular/core'
import type { OpenAPISchema } from 'better-auth/plugins'
import { MainService } from '../main.service'

@Injectable({ providedIn: 'root' })
export class OpenApiService {
  private readonly mainService = inject(MainService)

  schema() {
    return this.mainService.read<OpenAPISchema>(() =>
      this.mainService.authClient.$fetch('/open-api/generate-schema', { method: 'GET' }),
    )
  }

  schemaResource(): ResourceRef<OpenAPISchema | undefined> {
    return this.mainService.readResource<OpenAPISchema>(() =>
      this.mainService.authClient.$fetch('/open-api/generate-schema', { method: 'GET' }),
    )
  }

  referenceUrl(path = '/reference'): string {
    return `${this.mainService.url}${path.startsWith('/') ? path : `/${path}`}`
  }
}
