import { inject, Injectable, type ResourceRef } from '@angular/core'
import { defer, map, Observable } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { Session, User } from '../../models'
import { MainService } from '../main.service'

export interface DeviceSession {
  session: Session
  user: User
}

@Injectable({ providedIn: 'root' })
export class MultiSessionService {
  private readonly mainService = inject(MainService)

  private readonly multiSession: any

  constructor() {
    const client = this.mainService.authClient as { multiSession?: any }
    validatePlugin(client, 'multiSession')
    this.multiSession = client.multiSession
  }

  listDeviceSessions(): Observable<DeviceSession[]> {
    return this.mainService.read<DeviceSession[]>(() => this.multiSession.listDeviceSessions())
  }

  deviceSessionsResource(): ResourceRef<DeviceSession[] | undefined> {
    return this.mainService.readResource<DeviceSession[]>(() => this.multiSession.listDeviceSessions())
  }

  setActive(data: { sessionToken: string }): Observable<{ user: User; session: Session }> {
    return defer(() => this.multiSession.setActive(data)).pipe(
      map((data) => this.mainService.mapData<{ user: User; session: Session }>(data as any)),
    )
  }

  revoke(data: { sessionToken: string }): Observable<{ status: boolean }> {
    return defer(() => this.multiSession.revoke(data)).pipe(
      map((data) => this.mainService.mapData<{ status: boolean }>(data as any)),
    )
  }
}
