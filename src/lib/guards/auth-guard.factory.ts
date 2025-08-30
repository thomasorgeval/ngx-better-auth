import { CanActivateFn, UrlTree } from '@angular/router'
import { Observable } from 'rxjs'

export function canActivate(
  pipe: () => Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree,
): {
  canActivate: [CanActivateFn]
} {
  return {
    canActivate: [() => pipe()],
  }
}
