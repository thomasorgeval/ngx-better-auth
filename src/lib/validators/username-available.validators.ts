import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { catchError, debounceTime, map, of, switchMap } from 'rxjs'
import { UsernameService } from '../services'

export function usernameAvailableValidator(
  usernameService: UsernameService,
  initialUsername?: string,
): AsyncValidatorFn {
  return (control: AbstractControl): any => {
    const username = control.value?.trim()

    if (!username || username === initialUsername) {
      return of(null)
    }

    return of(username).pipe(
      debounceTime(500),
      switchMap((name) =>
        usernameService.isUsernameAvailable({ username: name }).pipe(
          map((available) => (available ? null : { usernameTaken: true })),
          catchError(() => of(null)),
        ),
      ),
    )
  }
}
