import { inject, Injectable } from '@angular/core'
import { defer } from 'rxjs'
import { AuthService } from './auth.service'
import { Provider } from '../models'

@Injectable({ providedIn: 'root' })
export class SignInService {
  private readonly authService = inject(AuthService)

  private readonly client = this.authService.authClient

  signInEmail(data: { email: string; password: string; rememberMe?: boolean }) {
    return defer(() => this.client.signIn.email(data))
  }

  signUpEmail(data: { name: string; email: string; password: string }) {
    return defer(() => this.client.signUp.email(data))
  }

  signInProvider(provider: Provider) {
    return defer(() => this.client.signIn.social({ provider }))
  }
}
