'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  UserCircle,
  BookOpen,
  Network,
  ListTree,
  Users,
  GraduationCap,
  Settings,
  LayoutList,
  History,
  Radar,
  ClipboardCheck,
  Package,
  Layers,
  Home,
} from 'lucide-react'
import { useDemo } from '@/components/demo-provider'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/types'

type MenuItem = { path: string; label: string; icon: React.ReactNode }
type MenuGroup = { role: Role; label: string; items: MenuItem[] }

const MENU_GROUPS: MenuGroup[] = [
  {
    role: 'student',
    label: '学员',
    items: [
      { path: '/home', label: 'AI 工作台', icon: <Home className="size-4" /> },
      { path: '/history', label: '数据接入', icon: <History className="size-4" /> },
      { path: '/diagnosis', label: '五维能力', icon: <Radar className="size-4" /> },
      { path: '/knowledge-graph', label: '知识图谱', icon: <Network className="size-4" /> },
      { path: '/learning', label: '学习推荐', icon: <BookOpen className="size-4" /> },
      { path: '/assessment', label: '学习评测', icon: <ClipboardCheck className="size-4" /> },
      { path: '/profile', label: '成效分析', icon: <UserCircle className="size-4" /> },
    ],
  },
  {
    role: 'admin',
    label: '培训管理员',
    items: [
      { path: '/workorders', label: '工单系统对接', icon: <Package className="size-4" /> },
      { path: '/model', label: '能力诊断模型管理', icon: <Layers className="size-4" /> },
      { path: '/knowledge-hierarchy', label: '知识点管理', icon: <ListTree className="size-4" /> },
      { path: '/courses', label: '教材课件库', icon: <LayoutList className="size-4" /> },
      { path: '/knowledge-graph', label: '知识图谱库', icon: <Network className="size-4" /> },
      { path: '/students', label: '学员管理', icon: <Users className="size-4" /> },
    ],
  },
]

const ROUTE_LABELS: Record<string, string> = {
  '/home': 'AI 工作台',
  '/history': '数据接入',
  '/diagnosis': '五维能力',
  '/knowledge-graph': '知识图谱库',
  '/learning': '学习推荐',
  '/assessment': '学习评测',
  '/profile': '成效分析',
  '/students': '学员管理',
  '/courses': '教材课件库',
  '/workorders': '工单系统对接',
  '/model': '能力诊断模型管理',
  '/knowledge-hierarchy': '知识点管理',
}

function linkWithRole(path: string, searchParams: URLSearchParams, role: Role) {
  const params = new URLSearchParams(searchParams.toString())
  params.set('role', role)
  return `${path}?${params.toString()}`
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { role } = useDemo()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentLabel =
    Object.keys(ROUTE_LABELS)
      .filter((p) => pathname === p || pathname.startsWith(`${p}/`))
      .sort((a, b) => b.length - a.length)[0] ?? ''
  const crumb = currentLabel ? ROUTE_LABELS[currentLabel] : '概览'
  const roleLabel = MENU_GROUPS.find((g) => g.role === role)?.label ?? ''

  // 学员首页使用独立侧边栏，隐藏系统导航
  if (pathname === '/home' && role === 'student') {
    return <div className="flex h-screen bg-background">{children}</div>
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 flex w-50 flex-col border-r bg-card">
        <Link
          href={linkWithRole('/', searchParams, role)}
          className="flex items-center gap-2 border-b px-4 py-3"
        >
          <GraduationCap className="size-5 text-primary" />
          <span className="font-mono text-xs font-semibold tracking-tight">知识图谱与学习成效分析</span>
        </Link>

        <nav className="flex-1 space-y-4 overflow-y-auto px-2 py-3">
          {MENU_GROUPS.map((group) => (
            <div key={group.role} className="space-y-0.5">
              <div className="px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {group.label}
              </div>
              {group.items.map((item) => {
                const active =
                  role === group.role &&
                  (pathname === item.path || pathname.startsWith(`${item.path}/`))
                return (
                  <Link
                    key={`${group.role}-${item.path}`}
                    href={linkWithRole(item.path, searchParams, group.role)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-sm px-3 py-2 text-sm font-medium transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      <main className="flex flex-1 flex-col pl-50">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center gap-2 font-mono text-xs tracking-tight text-muted-foreground">
            <Link
              href={linkWithRole(role === 'student' ? '/home' : '/', searchParams, role)}
              className="hover:text-foreground"
            >
               AI 工作台
            </Link>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-foreground">{crumb}</span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            {roleLabel}
          </span>
        </header>
        <div className="blueprint-grid min-h-0 flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  )
}
