import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { MainService } from './main.service'
import { Session } from '../models'

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly mainService = inject(MainService)

  private readonly client = this.mainService.authClient

  listSessions(): Observable<Session[]> {
    return this.mainService.read<Session[]>(() => this.client.listSessions())
  }

  sessionsResource(): ResourceRef<Session[] | undefined> {
    return this.mainService.readResource<Session[]>(() => this.client.listSessions())
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
