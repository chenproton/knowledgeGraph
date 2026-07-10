'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  GraduationCap,
  UserCircle,
  BookOpen,
  Network,
  Users,
  ListTree,
  Settings,
  LayoutList,
  History,
  ArrowRight,
  Radar,
  ClipboardCheck,
  Package,
  Layers,
} from 'lucide-react'
import { useDemo } from '@/components/demo-provider'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function useQueryLink() {
  const searchParams = useSearchParams()
  return (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }
}

const ROLE_LABELS: Record<string, string> = {
  student: '学员',
  admin: '培训管理员',
}

const WORKFLOW: {
  role: string
  label: string
  sub: string
  icon: React.ElementType
  card: string
  badge: string
  chip: string
  dot: string
  ring: string
  steps: string[]
}[] = [
  {
    role: 'admin',
    label: '培训管理员',
    sub: '建模与配置',
    icon: Settings,
    card: 'from-indigo-50 to-white border-indigo-100',
    badge: 'from-[#5b76e8] to-[#8c6ff0]',
    chip: 'bg-indigo-100 text-indigo-600',
    dot: 'bg-indigo-500',
    ring: 'ring-indigo-300',
    steps: [
      '工单系统对接：API 同步清洗领域模板与执行数据',
      '能力诊断模型：按岗位-领域-单元建模，配置考核标准',
      '知识点管理：维护多级知识点树并关联能力单元',
      '教材课件库：上传课件并关联知识点',
      '知识图谱：核对岗位→能力领域→能力单元→知识点→课程全链路',
    ],
  },
  {
    role: 'student',
    label: '学员',
    sub: '六环节业务闭环',
    icon: UserCircle,
    card: 'from-emerald-50 to-white border-emerald-100',
    badge: 'from-[#27b08a] to-[#54cf9d]',
    chip: 'bg-emerald-100 text-emerald-600',
    dot: 'bg-emerald-500',
    ring: 'ring-emerald-300',
    steps: [
      '执行数据采集：对接工单系统，获取层级数据',
      '五维能力：扣分项定位五维短板',
      '知识图谱构建：标准图谱高亮薄弱节点',
      '学习资源推荐：70%执行+30%考试综合推荐',
      '学习测评：课件学习与随堂自测',
      '成效评估：对比频次、扣分值与稳定性',
    ],
  },
]

export default function HomePage() {
  const { role } = useDemo()
  const link = useQueryLink()

  const modules: Record<string, { path: string; label: string; icon: React.ElementType; desc: string }[]> = {
    student: [
      { path: '/history', label: '执行数据采集', icon: History, desc: '同步的任务-问题-扣分项明细' },
      { path: '/diagnosis', label: '五维能力', icon: Radar, desc: '基于扣分项分析五维短板' },
      { path: '/knowledge-graph', label: '知识图谱构建', icon: Network, desc: '岗位标准图谱并高亮薄弱节点' },
      { path: '/learning', label: '个性化学习资源推荐', icon: BookOpen, desc: '依据短板获取推荐学习资源' },
      { path: '/assessment', label: '学习测评', icon: ClipboardCheck, desc: '课件学习与随堂自主测试' },
      { path: '/profile', label: '最终学习成效评估', icon: UserCircle, desc: '学习前后对比与技能稳定性成效评估' },
    ],
    admin: [
      { path: '/workorders', label: '工单系统对接', icon: Package, desc: '清洗并保存能力领域数据，支持工单系统 API 对接同步' },
      { path: '/model', label: '能力诊断模型管理', icon: Layers, desc: '按岗位-能力领域-能力单元建模，配置考核标准' },
      { path: '/knowledge-hierarchy', label: '知识点管理', icon: ListTree, desc: '维护多级知识点树' },
      { path: '/courses', label: '教材课件库', icon: LayoutList, desc: '维护课程并关联知识点' },
      { path: '/knowledge-graph', label: '知识图谱', icon: Network, desc: '可视化全链路知识图谱' },
      { path: '/students', label: '学员管理', icon: Users, desc: '查看学员能力状态与指导记录' },
    ],
  }

  const activeModules = modules[role] ?? modules.student

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <GraduationCap className="size-8 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">知识图谱与学习成效分析</h1>
        </div>
        <p className="text-muted-foreground">
          执行驱动诊断 · 知识图谱关联 · 智能学习推荐 · 成效持续提升
        </p>
      </div>

      <div className="flex justify-center">
        <Badge variant="secondary">当前角色：{ROLE_LABELS[role]}</Badge>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">功能入口</h2>
        <div
          className={cn(
            'grid grid-cols-2 gap-3',
            activeModules.length <= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'
          )}
        >
          {activeModules.map((item) => (
            <Card key={item.path} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <item.icon className="size-5 text-primary" />
                  <CardTitle className="text-sm">{item.label}</CardTitle>
                </div>
                <CardDescription className="text-xs">{item.desc}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full gap-2" size="sm">
                  <Link href={link(item.path)}>
                    进入
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold">全业务流程说明</h2>
          <p className="text-sm text-muted-foreground">
            管理员建模配置 → 学员六环节闭环：采集→诊断→图谱→推荐→评测→评估
          </p>
        </div>
        <div className="grid items-stretch gap-4 lg:grid-cols-3">
          {WORKFLOW.map((wf) => {
            const isCurrent = wf.role === role
            return (
              <div
                key={wf.role}
                className={cn(
                  'relative flex flex-col overflow-hidden rounded-xl border bg-gradient-to-br p-4 h-full',
                  wf.card,
                  isCurrent && cn('ring-2 ring-offset-1', wf.ring)
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white',
                      wf.badge
                    )}
                  >
                    <wf.icon className="size-4" />
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold">{wf.label}</span>
                      {isCurrent && (
                        <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold', wf.chip)}>
                          当前
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground">{wf.sub}</div>
                  </div>
                </div>
                <ol className="mt-3 space-y-1.5">
                  {wf.steps.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span
                        className={cn(
                          'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white',
                          wf.dot
                        )}
                      >
                        {i + 1}
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-1 rounded-xl border bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3 text-center text-xs text-muted-foreground">
          学员完成推荐学习并通过测评后，能力单元分数按规则回升，画像与图谱实时更新，形成「诊断 → 学习 → 验证 → 提升」的持续闭环。
        </div>
      </div>
    </div>
  )
}
