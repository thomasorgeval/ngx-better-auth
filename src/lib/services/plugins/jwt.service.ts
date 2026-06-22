import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from '../main.service'

export interface JsonWebKeySet {
  keys: Record<string, any>[]
}

@Injectable({ providedIn: 'root' })
export class JwtService {
  private readonly mainService = inject(MainService)

  jwks(): Observable<JsonWebKeySet> {
    return defer(() => this.mainService.authClient.jwks()).pipe(
      map((data) => this.mainService.mapData<JsonWebKeySet>(data as any)),
    )
  }

  token(): Observable<{ token: string }> {
    return defer(() => this.mainService.authClient.token()).pipe(
      map((data) => this.mainService.mapData<{ token: string }>(data as any)),
    )
  }
}
