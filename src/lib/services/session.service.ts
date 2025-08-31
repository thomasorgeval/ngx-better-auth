import { inject, Injectable } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from './main.service'
import { Session2 } from '../models'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  listSessions(): Observable<Session2[]> {
    return defer(() => this.client.listSessions()).pipe(
      map((data) => this.mainService.mapData<Session2[]>(data as any)),
    )
  }

  revokeSession(data: { token: string }): Observable<{ success: boolean }> {
    return defer(() => this.client.revokeSession(data)).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  revokeOtherSessions(): Observable<{ success: boolean }> {
    return defer(() => this.client.revokeOtherSessions()).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }

  revokeAllSessions(): Observable<{ success: boolean }> {
    return defer(() => this.client.revokeSessions()).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
