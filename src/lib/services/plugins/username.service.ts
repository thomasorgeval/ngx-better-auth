import { inject, Injectable } from '@angular/core'
import { defer, filter, map, Observable, switchMap } from 'rxjs'
import { MainService } from '../main.service'
import { AuthService } from '../auth.service'
import { isEmail } from '../../utils/email.util'
import { Session, User } from '../../models'
import { HttpClient } from '@angular/common/http'

@Injectable({ providedIn: 'root' })
export class UsernameService {
  private readonly http = inject(HttpClient)

  private readonly mainService = inject(MainService)
  private readonly authService = inject(AuthService)

  username = this.mainService.authClient

  /**
   * pass either email or username to sign in. Needs username plugin enabled to use username.
   * @param data : { email?: string; username?: string; password: string; rememberMe?: boolean }
   */
  signIn(data: { login: string; password: string; rememberMe?: boolean }): Observable<{
    user: User
    session: Session
  }> {
    if (isEmail(data.login)) {
      return this.authService.signInEmail({ email: data.login, password: data.password, rememberMe: data.rememberMe })
    } else {
      return this.signInUsername({ username: data.login, password: data.password, rememberMe: data.rememberMe })
    }
  }

  signInUsername(data: { username: string; password: string; rememberMe?: boolean }): Observable<{
    user: User
    session: Session
  }> {
    return defer(() => (this.username as any).signIn.username(data)).pipe(
      switchMap(() => this.authService.sessionState$.pipe(filter((s) => s !== null))),
    )
  }

  isUsernameAvailable(data: { username: string }): Observable<boolean> {
    return this.http
      .post<{ available: boolean }>(`${this.mainService.url}/is-username-available`, data)
      .pipe(map((res) => res.available))
  }
}
