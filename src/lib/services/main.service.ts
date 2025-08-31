import { inject, Injectable } from '@angular/core'
import { BETTER_AUTH_CONFIG_TOKEN } from '../providers'
import { BetterFetchError, createAuthClient } from 'better-auth/client'

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private readonly config = inject(BETTER_AUTH_CONFIG_TOKEN)

  readonly authClient = createAuthClient({
    ...this.config,
  })

  mapData<T>(data: { data: T; error: BetterFetchError }): T {
    if (data.error) {
      throw data.error
    }
    return data.data
  }
}
