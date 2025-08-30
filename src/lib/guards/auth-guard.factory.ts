import { CanActivateFn } from '@angular/router'

export function canActivate(pipe: () => boolean | import('@angular/router').UrlTree): { canActivate: [CanActivateFn] } {
  return {
    canActivate: [() => pipe()],
  }
}
