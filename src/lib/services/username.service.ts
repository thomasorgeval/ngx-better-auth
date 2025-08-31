import { inject, Injectable } from '@angular/core'
import { defer, filter, Observable, switchMap } from 'rxjs'
import { MainService } from './main.service'
import { Session2, User } from '../models'
import { AuthService } from './auth.service'
import { isEmail } from '../utils/email.util'

@Injectable({ providedIn: 'root' })
export class UsernameService {
  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  username = this.mainService.authClient

  /**
   * pass either email or username to sign in. Needs username plugin enabled to use username.
   * @param data : { email?: string; username?: string; password: string; rememberMe?: boolean }
   */
  signIn(data: { login: string; password: string; rememberMe?: boolean }): Observable<{
    user: User
    session: Session2
  }> {
    if (isEmail(data.login)) {
      return this.authService.signInEmail({ email: data.login, password: data.password, rememberMe: data.rememberMe })
    } else {
      return this.signInUsername({ username: data.login, password: data.password, rememberMe: data.rememberMe })
    }
  }

  signInUsername(data: { username: string; password: string; rememberMe?: boolean }): Observable<{
    user: User
    session: Session2
  }> {
    return defer(() => (this.username as any).signIn.username(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  isUsernameAvailable(data: { username: string }): Observable<unknown> {
    return defer(() => (this.username as any).isUsernameAvailable(data))
  }
}
