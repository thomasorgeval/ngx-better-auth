import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms'
import { catchError, map, of, switchMap, timer } from 'rxjs'
import { UsernameService } from '../services'

export function usernameAvailableValidator(
  usernameService: UsernameService,
  initialUsername?: string,
): AsyncValidatorFn {
  let lastValidatedUsername: string | null = null
  let lastValidationResult: ValidationErrors | null = null

  return (control: AbstractControl): any => {
    const username = control.value?.trim()

    if (!username || username === initialUsername) {
      lastValidatedUsername = null
      lastValidationResult = null
      return of(null)
    }

    if (username === lastValidatedUsername) {
      return of(lastValidationResult)
    }

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
          map((available) => {
            const result = available ? null : { usernameTaken: true }
            lastValidatedUsername = currentValue
            lastValidationResult = result
            return result
          }),
          catchError(() => of(null)),
        )
      }),
    )
  }
}
