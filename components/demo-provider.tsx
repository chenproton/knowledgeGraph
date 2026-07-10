'use client'

import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useSearchParams, usePathname, useRouter } from 'next/navigation'
import type { Role } from '@/lib/types'

type DemoContextValue = {
  role: Role
  setRole: (role: Role) => void
}

const DemoContext = createContext<DemoContextValue | null>(null)

export function DemoProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const role: Role = (searchParams.get('role') as Role) || 'student'

  const setRole = useCallback(
    (r: Role) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('role', r)
      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <DemoContext.Provider value={{ role, setRole }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemo must be used within DemoProvider')
  return ctx
}
