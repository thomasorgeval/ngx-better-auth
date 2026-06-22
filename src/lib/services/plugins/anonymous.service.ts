import { inject, Injectable } from '@angular/core'
import { defer, filter, map, Observable, switchMap } from 'rxjs'
import { validatePlugin } from '../../utils/validate-plugin'
import { Session, User } from '../../models'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'

@Injectable({ providedIn: 'root' })
export class AnonymousService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  constructor() {
    validatePlugin(this.mainService.authClient, 'deleteAnonymousUser')
  }

  signIn(): Observable<{ user: User; session: Session }> {
    return defer(() => this.mainService.authClient.signIn.anonymous()).pipe(
      map((data) => this.mainService.mapData<{ token: string; user: User }>(data as any)),
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  deleteAnonymousUser() {
    return defer(() => this.mainService.authClient.deleteAnonymousUser()).pipe(
      map((data) => this.mainService.mapData<{ success: boolean }>(data as any)),
    )
  }
}
