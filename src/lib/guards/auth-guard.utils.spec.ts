import { TestBed } from '@angular/core/testing'
import { Router, type UrlTree } from '@angular/router'
import { firstValueFrom, Observable, of } from 'rxjs'
import { OrganizationService } from '../services/plugins/organization.service'
import { hasOrganizationRole } from './auth-guard.utils'

declare const describe: (description: string, specDefinitions: () => void) => void
declare const beforeEach: (action: () => void) => void
declare const it: (expectation: string, assertion: () => void | Promise<void>) => void
declare const expect: (actual: unknown) => {
  toBe(expected: unknown): void
  toEqual(expected: unknown): void
}

describe('hasOrganizationRole', () => {
  let redirectTree: UrlTree
  let createdCommands: string[] | undefined

  beforeEach(() => {
    TestBed.resetTestingModule()
    redirectTree = {} as UrlTree
    createdCommands = undefined
  })

  async function runGuard(member$: Observable<unknown>, redirectTo?: string[] | UrlTree) {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: OrganizationService,
          useValue: {
            getActiveMember: () => member$,
          },
        },
        {
          provide: Router,
          useValue: {
            createUrlTree: (commands: string[]) => {
              createdCommands = commands
              return redirectTree
            },
          },
        },
      ],
    })

    const guard = redirectTo
      ? hasOrganizationRole(['owner', 'admin'], redirectTo)
      : hasOrganizationRole(['owner', 'admin'])

    return firstValueFrom(TestBed.runInInjectionContext(() => guard()))
  }

  it('allows active organization owners', async () => {
    const result = await runGuard(of({ role: 'owner' }))

    expect(result).toBe(true)
  })

  it('allows active organization admins', async () => {
    const result = await runGuard(of({ role: 'admin' }))

    expect(result).toBe(true)
  })

  it('rejects active organization members without an allowed role', async () => {
    const result = await runGuard(of({ role: 'member' }))

    expect(result).toBe(redirectTree)
  })

  it('rejects when there is no active organization member', async () => {
    const result = await runGuard(of(null))

    expect(result).toBe(redirectTree)
  })

  it('uses the provided redirect target', async () => {
    const result = await runGuard(of({ role: 'member' }), ['/'])

    expect(result).toBe(redirectTree)
    expect(createdCommands).toEqual(['/'])
  })

  it('uses the provided UrlTree redirect target', async () => {
    const urlTree = {} as UrlTree
    const result = await runGuard(of({ role: 'member' }), urlTree)

    expect(result).toBe(urlTree)
    expect(createdCommands).toBe(undefined)
  })

  it('allows members with any matching role when Better Auth returns role arrays', async () => {
    const result = await runGuard(of({ role: ['member', 'admin'] }))

    expect(result).toBe(true)
  })
})
