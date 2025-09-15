import { AbstractControl, AsyncValidatorFn } from '@angular/forms'
import { catchError, map, of, switchMap, timer } from 'rxjs'
import { UsernameService } from '../services'

export function usernameAvailableValidator(
  usernameService: UsernameService,
  initialUsername?: string,
): AsyncValidatorFn {
  let lastValidationValue: string | null = null

  return (control: AbstractControl): any => {
    const username = control.value?.trim()

    if (!username || username === initialUsername) {
      lastValidationValue = null
      return of(null)
    }

    // If the value is the same as the last one we checked, don't check again
    if (username === lastValidationValue) {
      return of(null)
    }

    lastValidationValue = username

    return timer(500).pipe(
      switchMap(() => {
        const currentValue = control.value?.trim()

        // If the value has changed since the timer started, don't validate
        if (currentValue !== username) {
          return of(null)
        }

        if (!currentValue || currentValue === initialUsername) {
          return of(null)
        }

        return usernameService.isUsernameAvailable({ username: currentValue }).pipe(
          map((available) => (available ? null : { usernameTaken: true })),
          catchError(() => of(null)),
        )
      }),
    )
  }
}
