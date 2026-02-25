import 'zone.js'
import 'zone.js/testing'
import { TestBed } from '@angular/core/testing'
import { Router, type UrlTree } from '@angular/router'
import { of } from 'rxjs'
import { AuthService } from '../services'
import { hasRole } from './auth-guard.utils'

describe('hasRole', () => {
  it('allows comma-separated role strings', (done) => {
    const authServiceMock = {
      sessionState$: of({
        user: {
          role: 'admin,finance',
        },
      }),
    }
    const unauthorizedTree = { unauthorized: true } as unknown as UrlTree
    const routerMock = {
      createUrlTree: jasmine.createSpy().and.returnValue(unauthorizedTree),
    }

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    })

    const guard = hasRole(['admin'], ['/unauthorized'])

    TestBed.runInInjectionContext(() => {
      guard().subscribe((result) => {
        expect(result).toBeTrue()
        done()
      })
    })
  })
})
