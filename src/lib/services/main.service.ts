import { inject, Injectable, Injector, resource, type ResourceRef } from '@angular/core'
import { BETTER_AUTH_CONFIG_TOKEN } from '../providers'
import { BetterFetchError, createAuthClient } from 'better-auth/client'
import { defer, map, type Observable } from 'rxjs'

type BetterAuthResponse<T> = { data: T; error: BetterFetchError }

@Injectable({
  providedIn: 'root',
})
export class MainService {
  private readonly config = inject(BETTER_AUTH_CONFIG_TOKEN)
  private readonly injector = inject(Injector)

  readonly authClient: any = createAuthClient({
    ...this.config,
  })

  readonly url = `${this.config.baseURL}${this.config.basePath || '/api/auth'}`

  mapData<T>(data: { data: T; error: BetterFetchError }): T {
    if (data.error) {
      throw data.error
    }
    return data.data
  }

  read<T>(loader: () => Promise<BetterAuthResponse<T>>): Observable<T> {
    return defer(loader).pipe(map((data) => this.mapData<T>(data)))
  }

  readResource<T>(loader: () => Promise<BetterAuthResponse<T>>): ResourceRef<T | undefined> {
    return resource({
      injector: this.injector,
      loader: async () => this.mapData<T>(await loader()),
    })
  }

  readResourceWithParams<T, R>(
    params: () => R,
    loader: (params: R) => Promise<BetterAuthResponse<T>>,
  ): ResourceRef<T | undefined> {
    return resource({
      injector: this.injector,
      params,
      loader: async ({ params }) => this.mapData<T>(await loader(params)),
    })
  }
}
