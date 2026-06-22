import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { Session, User } from '../../models'
import { MainService } from '../main.service'

@Injectable({ providedIn: 'root' })
export class OneTimeTokenService {
  private readonly mainService = inject(MainService)

  private readonly oneTimeToken: any

  constructor() {
    const client = this.mainService.authClient as { oneTimeToken?: any }
    validatePlugin(client, 'oneTimeToken')
    this.oneTimeToken = client.oneTimeToken
  }

  generate(): Observable<{ token: string }> {
    return this.mainService.read<{ token: string }>(() => this.oneTimeToken.generate())
  }

  verify(data: { token: string }): Observable<{ session: Session; user: User }> {
    return defer(() => this.oneTimeToken.verify(data)).pipe(
      map((data) => this.mainService.mapData<{ session: Session; user: User }>(data as any)),
    )
  }
}
