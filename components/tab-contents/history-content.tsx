'use client'

import { useMemo, useState } from 'react'
import {
  FileWarning,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  Target,
  LayoutList,
  Calendar,
} from 'lucide-react'
import {
  getStudentById,
  getStudentWorkorderHierarchy,
  getWorkorderStats,
  getWorkorderById,
  getAbilityById,
  type WorkorderStats,
} from '@/lib/mock-data'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'
import type { Dimension, DeductionRecord, WorkorderProblem, WorkorderTask } from '@/lib/types'
import { DIMENSIONS } from '@/lib/types'

const STUDENT_ID = 'stu-li'

const DIM_COLORS: Record<Dimension, { bg: string; text: string; dot: string }> = {
  数量: { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' },
  质量: { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' },
  安全: { bg: 'bg-red-50', text: 'text-red-600', dot: 'bg-red-500' },
  规范: { bg: 'bg-purple-50', text: 'text-purple-600', dot: 'bg-purple-500' },
  效率: { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
}

const DIM_LABELS: Record<Dimension, string> = {
  数量: '数量', 质量: '质量', 安全: '安全', 规范: '规范', 效率: '效率',
}

function DeductionBadge({ deduction }: { deduction: DeductionRecord }) {
  const c = DIM_COLORS[deduction.dimension]
  return (
    <div className={cn('flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs', c.bg)}>
      <span className={cn('size-2 shrink-0 rounded-full', c.dot)} />
      <span className="font-medium text-muted-foreground">{DIM_LABELS[deduction.dimension]}</span>
      <span className={cn('font-semibold', c.text)}>-{deduction.points}分</span>
      <span className="text-muted-foreground">{deduction.name}</span>
    </div>
  )
}

function TaskCard({ task }: { task: WorkorderTask }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-semibold hover:bg-muted/50"
      >
        {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        {task.name}
        <Badge variant="outline" className="text-[10px]">{task.category}</Badge>
      </button>
      {open && (
        <div className="space-y-2 border-t px-3 py-2">
          {task.problems.map((prob) => (
            <ProblemRow key={prob.id} problem={prob} />
          ))}
        </div>
      )}
    </div>
  )
}

function ProblemRow({ problem }: { problem: WorkorderProblem }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border bg-muted/30">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        <span className="text-muted-foreground">{problem.type}：</span>
        <span className="font-medium">{problem.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {problem.deductions.length} 项扣分
        </span>
      </button>
      {open && (
        <div className="space-y-1 border-t px-3 py-1.5">
          {problem.deductions.map((d) => (
            <DeductionBadge key={d.id} deduction={d} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatsPanel({ stats }: { stats: WorkorderStats }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <LayoutList className="size-4" /> 按任务分类统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.byCategory.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{c.name}</span>
              <span>
                <span className="font-semibold">{c.count}次</span>
                <span className="ml-2 text-red-500">-{c.deduction}分</span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertCircle className="size-4" /> 按问题类型统计
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.byProblemType.map((c) => (
            <div key={c.name} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{c.name}</span>
              <span>
                <span className="font-semibold">{c.count}次</span>
                <span className="ml-2 text-red-500">-{c.deduction}分</span>
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="size-4" /> 按五维维度汇总
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {DIMENSIONS.map((dim) => {
            const v = stats.byDimension[dim]
            const c = DIM_COLORS[dim]
            return (
              <div key={dim} className="flex items-center gap-2 text-sm">
                <span className={cn('size-2.5 rounded-full', c.dot)} />
                <span className="min-w-10 text-muted-foreground">{dim}</span>
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full', c.dot, 'opacity-50')}
                      style={{
                        width: `${Math.min(100, (v / Math.max(1, ...DIMENSIONS.map((d) => stats.byDimension[d]))) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
                <span className="font-semibold text-red-500">-{v}分</span>
              </div>
            )
          })}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileWarning className="size-4" /> 按扣分项排序
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {stats.byDeductionItem.slice(0, 8).map((item) => {
            const c = DIM_COLORS[item.dimension]
            return (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={cn('size-2 shrink-0 rounded-full', c.dot)} />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
                <span className="shrink-0">
                  <span className="font-semibold">{item.count}次</span>
                  <span className="ml-1.5 text-red-500">-{item.deduction}分</span>
                </span>
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}

export function HistoryContent() {
  const student = getStudentById(STUDENT_ID)
  const hierarchy = useMemo(() => getStudentWorkorderHierarchy(STUDENT_ID), [])
  const stats = useMemo(() => getWorkorderStats(STUDENT_ID), [])
  const [expandedWo, setExpandedWo] = useState<string | null>(
    hierarchy[0]?.workorderId ?? null
  )
  const [startDate, setStartDate] = useState('2026-06-08')
  const [endDate, setEndDate] = useState('2026-07-07')

  if (!student) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">数据接入</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              从全业务工单系统对接获取执行数据，层级展示任务→问题→扣分明细
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="size-4 text-muted-foreground" />
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 h-8 text-xs" />
          <span className="text-xs text-muted-foreground">—</span>
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 h-8 text-xs" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          value={hierarchy.length}
          label="执行记录"
          tone="rose"
          icon={<FileWarning className="size-7" />}
        />
        <StatCard
          value={Object.values(stats.byDimension).reduce((s, v) => s + v, 0)}
          label="累计扣分"
          tone="amber"
          icon={<AlertCircle className="size-7" />}
        />
        <StatCard
          value={stats.byDeductionItem.length}
          label="问题项"
          tone="blue"
          icon={<Target className="size-7" />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">执行记录列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {hierarchy.map((r) => {
              const wo = getWorkorderById(r.workorderId)
              const ability = getAbilityById(r.abilityId)
              const selected = expandedWo === r.workorderId
              return (
                <button
                  key={r.workorderId + r.date}
                  type="button"
                  onClick={() => setExpandedWo(selected ? null : r.workorderId)}
                  className={cn(
                    'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                    selected
                      ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                      : 'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{wo?.name || r.workorderId}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      {r.scoreImpact > 0 ? '+' : ''}{r.scoreImpact}
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{ability?.name || r.abilityId}</span>
                    <span className="font-mono">{r.date}</span>
                  </div>
                </button>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">
              {expandedWo
                ? `${getWorkorderById(expandedWo)?.name || expandedWo} · 任务层级明细`
                : '选择记录查看层级明细'}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[600px] overflow-auto">
            {expandedWo ? (
              <div className="space-y-3">
                {(() => {
                  const tasks =
                    hierarchy.find((r) => r.workorderId === expandedWo)?.tasks ?? []
                  if (tasks.length === 0) {
                    return (
                      <div className="text-sm text-muted-foreground">
                        该记录暂无层级明细数据
                      </div>
                    )
                  }
                  return tasks.map((task) => <TaskCard key={task.id} task={task} />)
                })()}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                从左侧选择记录查看任务 → 问题 → 扣分项明细
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <StatsPanel stats={stats} />
    </div>
  )
}
