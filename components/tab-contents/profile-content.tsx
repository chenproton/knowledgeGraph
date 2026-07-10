'use client'

import { useMemo, useState } from 'react'

import {
  TrendingDown,
  TrendingUp,
  AlertCircle,
  BookOpen,
  FileWarning,
  CheckCircle2,
  Activity,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  Target,
  Calendar,
} from 'lucide-react'
import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  getStudentById,
  getStudentPositions,
  getPositionAbilities,
  getStudentScores,
  getLatestScore,
  getStudentWorkorders,
  getStudentLearningRecords,
  getWorkorderById,
  getCourseById,
  getEffectivenessReport,
  getDimensionImprovement,
  getStudentWorkorderHierarchy,
  getUnitById,
} from '@/lib/mock-data'
import { LineChart } from '@/components/charts/line-chart'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { type AbilityPoint } from '@/lib/types'
import type { WorkorderTask, WorkorderProblem, DeductionRecord } from '@/lib/types'

const STUDENT_ID = 'stu-li'

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

type Tier = 'exceed' | 'meet' | 'below'
function tierOf(score: number, baseline: number): Tier {
  if (score >= baseline + 5) return 'exceed'
  if (score >= baseline) return 'meet'
  return 'below'
}
const TIER_FILL: Record<Tier, string> = {
  exceed: 'from-[#27b08a] to-[#54cf9d]',
  meet: 'from-[#5b76e8] to-[#8c6ff0]',
  below: 'from-[#e89b3a] to-[#f3c069]',
}
const TIER_TEXT: Record<Tier, string> = {
  exceed: 'text-emerald-600',
  meet: 'text-indigo-600',
  below: 'text-amber-600',
}
const TIER_BADGE: Record<Tier, { label: string; cls: string }> = {
  exceed: { label: '超基准', cls: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
  meet: { label: '达标', cls: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
  below: { label: '未达标', cls: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
}

const TONE = {
  green: { card: 'from-emerald-50 to-white border-emerald-100', text: 'text-emerald-600', glow: 'bg-emerald-300/50' },
  purple: { card: 'from-purple-50 to-white border-purple-100', text: 'text-purple-600', glow: 'bg-purple-300/50' },
  blue: { card: 'from-indigo-50 to-white border-indigo-100', text: 'text-indigo-600', glow: 'bg-indigo-300/50' },
  amber: { card: 'from-amber-50 to-white border-amber-100', text: 'text-amber-600', glow: 'bg-amber-300/50' },
} as const
type Tone = keyof typeof TONE

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border bg-card shadow-sm', className)}>{children}</div>
}

function SectionTitle({
  children,
  extra,
}: {
  children: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
        {children}
      </div>
      {extra ? <span className="text-[11px] font-semibold text-muted-foreground">{extra}</span> : null}
    </div>
  )
}

function StatCard({
  value,
  label,
  tone,
}: {
  value: React.ReactNode
  label: string
  tone: Tone
}) {
  const t = TONE[tone]
  return (
    <div className={cn('relative overflow-hidden rounded-xl border bg-gradient-to-br p-3.5', t.card)}>
      <div className={cn('text-2xl leading-none font-extrabold', t.text)}>{value}</div>
      <div className="mt-1.5 text-[11px] font-medium text-muted-foreground">{label}</div>
      <span className={cn('pointer-events-none absolute -top-4 -right-4 size-14 rounded-full blur-md', t.glow)} />
    </div>
  )
}

function MasteryBar({ score, baseline }: { score: number; baseline: number }) {
  const tier = tierOf(score, baseline)
  return (
    <div className="relative h-5 rounded-md bg-slate-100">
      <div
        className={cn(
          'flex h-full items-center justify-end rounded-md bg-gradient-to-r pr-1.5 text-[10px] font-bold text-white transition-all duration-700',
          TIER_FILL[tier]
        )}
        style={{ width: `${Math.max(clampScore(score), 9)}%` }}
      >
        {score}
      </div>
      <div
        className="absolute -top-1 -bottom-1 z-10 border-l border-dashed border-slate-400"
        style={{ left: `${clampScore(baseline)}%` }}
      >
        <span className="absolute -top-1 left-1/2 size-1.5 -translate-x-1/2 rotate-45 bg-slate-400" />
      </div>
    </div>
  )
}

function AbilityHistoryDialog({
  ability,
  open,
  onOpenChange,
}: {
  ability: AbilityPoint | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const history = useMemo(() => {
    if (!ability) return { chart: [] as Record<string, string | number>[], changes: [] as { date: string; delta: number; title: string; detail: string; kind: 'up' | 'down' }[] }
    const series = getStudentScores(STUDENT_ID, ability.id)
    const chart = series.map((s) => ({
      date: s.date.slice(5),
      掌握度: s.score,
      基准: ability.baseline,
    }))
    const woByDate = new Map<string, ReturnType<typeof getStudentWorkorders>[number]>()
    getStudentWorkorders(STUDENT_ID)
      .filter((r) => r.abilityId === ability.id)
      .forEach((r) => woByDate.set(r.date, r))
    const lrByDate = new Map<string, ReturnType<typeof getStudentLearningRecords>[number]>()
    getStudentLearningRecords(STUDENT_ID).forEach((r) => {
      if (!lrByDate.has(r.date)) lrByDate.set(r.date, r)
    })

    const changes: { date: string; delta: number; title: string; detail: string; kind: 'up' | 'down' }[] = []
    for (let i = 1; i < series.length; i++) {
      const delta = series[i].score - series[i - 1].score
      if (delta === 0) continue
      const date = series[i].date
      const src = series[i].source
      let title = ''
      let detail = ''
      const kind: 'up' | 'down' = delta > 0 ? 'up' : 'down'
      if (delta > 0) {
        if (src === 'learning') {
          const lr = lrByDate.get(date)
          const c = lr ? getCourseById(lr.courseId) : undefined
          title = c ? `完成学习《${c.title}》` : '完成课程学习'
          detail = '学习并通过测评，能力得分提升'
        } else if (src === 'workorder') {
          const wo = woByDate.get(date)
          const w = wo ? getWorkorderById(wo.workorderId) : undefined
          title = w ? `《${w.name}》执行规范` : '执行规范'
          detail = '执行评分评优，能力得分提升'
        } else {
          title = '能力得分提升'
          detail = '来源于学习 / 评分'
        }
      } else {
        if (src === 'workorder') {
          const wo = woByDate.get(date)
          const w = wo ? getWorkorderById(wo.workorderId) : undefined
          title = w ? `《${w.name}》出现问题` : '扣分明细'
          detail = '执行不达标，能力得分扣减'
        } else {
          title = '长时间未学习'
          detail = '较长时间无学习 / 无执行记录，能力得分自然衰减'
        }
      }
      changes.push({ date, delta, title, detail, kind })
    }
    return { chart, changes: changes.reverse() }
  }, [ability])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="h-4 w-1 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
            {ability?.name} · 能力变化历史
          </DialogTitle>
          <DialogDescription>
            该能力单元掌握度随时间的变化曲线，以及每次升降的原因说明
          </DialogDescription>
        </DialogHeader>
        <div className="h-80 rounded-lg border bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-2">
          {history.chart.length > 0 ? (
            <LineChart
              data={history.chart}
              xKey="date"
              series={[
                { key: '掌握度', name: '掌握度', color: '#5b76e8' },
                { key: '基准', name: '岗位基准', color: '#cbd5e1' },
              ]}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">暂无历史数据</div>
          )}
        </div>
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-bold">
            <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
            升降原因明细
          </div>
          <div className="max-h-72 space-y-2 overflow-auto pr-1">
            {history.changes.length === 0 ? (
              <div className="text-sm text-muted-foreground">区间内无得分变化</div>
            ) : (
              history.changes.map((c, idx) => (
                <div
                  key={`${c.date}-${idx}`}
                  className={cn(
                    'flex items-start gap-3 rounded-lg border p-3',
                    c.kind === 'up'
                      ? 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white'
                      : 'border-amber-100 bg-gradient-to-br from-amber-50 to-white'
                  )}
                >
                  <span
                    className={cn(
                      'flex min-w-12 items-center justify-center rounded-md px-2 py-1 text-sm font-extrabold',
                      c.kind === 'up' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    )}
                  >
                    {c.delta > 0 ? '+' : ''}{c.delta}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{c.title}</span>
                      <span className="font-mono text-[11px] whitespace-nowrap text-muted-foreground">{c.date}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground">{c.detail}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function TaskCard({ task }: { task: WorkorderTask }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-lg border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold"
      >
        {open ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
        {task.name}
        <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">{task.category}</span>
      </button>
      {open && (
        <div className="space-y-1.5 border-t px-3 py-2">
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
    <div className="rounded-md border bg-white">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-[11px]"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        <span className="font-medium">{problem.name}</span>
        <span className="ml-auto text-[10px] text-muted-foreground">{problem.deductions.length}项扣分</span>
      </button>
      {open && (
        <div className="flex flex-wrap gap-1 border-t px-2.5 py-1.5">
          {problem.deductions.map((d) => (
            <DeductionBadge key={d.id} deduction={d} />
          ))}
        </div>
      )}
    </div>
  )
}

function DeductionBadge({ deduction }: { deduction: DeductionRecord }) {
  const colors: Record<string, string> = {
    数量: 'bg-blue-50 text-blue-600 border-blue-200',
    质量: 'bg-amber-50 text-amber-600 border-amber-200',
    安全: 'bg-red-50 text-red-600 border-red-200',
    规范: 'bg-purple-50 text-purple-600 border-purple-200',
    效率: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  }
  const cls = colors[deduction.dimension] || 'bg-slate-50 text-slate-600 border-slate-200'
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium', cls)}>
      <span>{deduction.dimension}</span>
      <span>-{deduction.points}分</span>
      <span className="text-muted-foreground">{deduction.name}</span>
    </span>
  )
}

const DIM_LABEL: Record<string, string> = {
  数量: '工作量',
  质量: '质量',
  安全: '风险防范',
  规范: '规范',
  效率: '效率',
}

export function ProfileContent({ onNavigate }: { onNavigate?: (abilityId: string) => void }) {
  const student = getStudentById(STUDENT_ID)
  const positions = getStudentPositions(STUDENT_ID)
  const [historyAbility, setHistoryAbility] = useState<AbilityPoint | null>(null)
  const [selectedWorkorder, setSelectedWorkorder] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('2026-06-08')
  const [endDate, setEndDate] = useState('2026-07-07')

  const abilities = useMemo(
    () => (positions[0] ? getPositionAbilities(positions[0].id) : []),
    [positions]
  )

  const latestScores = useMemo(() => {
    const map: Record<string, number> = {}
    abilities.forEach((ab) => {
      map[ab.id] = getLatestScore(STUDENT_ID, ab.id)?.score ?? 0
    })
    return map
  }, [abilities])

  const overallAvg = useMemo(() => {
    if (abilities.length === 0) return 0
    return Math.round(abilities.reduce((sum, ab) => sum + latestScores[ab.id], 0) / abilities.length)
  }, [abilities, latestScores])

  const metCount = useMemo(
    () => abilities.filter((ab) => latestScores[ab.id] >= ab.baseline).length,
    [abilities, latestScores]
  )
  const belowCount = abilities.length - metCount
  const achieveRate = abilities.length > 0 ? Math.round((metCount / abilities.length) * 100) : 0

  const dates = useMemo(() => {
    const days: string[] = []
    for (let i = 13; i >= 0; i--) {
      const d = new Date('2026-07-07')
      d.setDate(d.getDate() - i)
      days.push(d.toISOString().slice(0, 10))
    }
    return days
  }, [])

  const scoresByAbility = useMemo(() => {
    const map: Record<string, { date: string; score: number }[]> = {}
    abilities.forEach((ab) => {
      map[ab.id] = getStudentScores(STUDENT_ID, ab.id)
    })
    return map
  }, [abilities])

  const lineData = useMemo(() => {
    return dates.map((date) => {
      const record: Record<string, string | number> = { date: date.slice(5) }
      abilities.forEach((ab) => {
        const score = scoresByAbility[ab.id]?.find((s) => s.date === date)?.score
        if (score !== undefined) record[ab.name] = score
      })
      return record
    })
  }, [dates, abilities, scoresByAbility])

  const lineSeries = useMemo(
    () =>
      abilities.map((ab, idx) => ({
        key: ab.name,
        name: ab.name,
        color: ['#5b76e8', '#27b08a', '#e89b3a', '#e8748a', '#8c6ff0', '#39b3c8'][idx % 6],
      })),
    [abilities]
  )

  const effectiveness = useMemo(() => getEffectivenessReport(STUDENT_ID), [])
  const hierarchy = useMemo(() => getStudentWorkorderHierarchy(STUDENT_ID), [])
  const dimensionImprovement = useMemo(() => getDimensionImprovement(STUDENT_ID), [])

  const dimChartData = useMemo(() => {
    return dimensionImprovement.map((d) => ({
      name: DIM_LABEL[d.dimension] || d.dimension,
      学习前: d.beforeScore,
      学习后: d.afterScore,
      delta: d.delta,
    }))
  }, [dimensionImprovement])

  const effectivenessScores = useMemo(() => {
    return effectiveness
      .map((e) => {
        const scores = getStudentScores(STUDENT_ID, e.abilityId)
        const sorted = [...scores].sort((a, b) => a.date.localeCompare(b.date))
        const beforeScore = sorted[0]?.score ?? 0
        const afterScore = sorted[sorted.length - 1]?.score ?? 0
        const unit = getUnitById(e.abilityId)
        const baseline = unit?.baseline ?? 70
        const tierOf = (s: number) => (s >= baseline + 5 ? '超基准' : s >= baseline ? '达标' : '未达标')
        const beforeTier = tierOf(beforeScore)
        const afterTier = tierOf(afterScore)
        const delta = afterScore - beforeScore
        const improved = afterTier !== beforeTier && (afterTier === '达标' || afterTier === '超基准')
          ? 'up' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat'
        return { abilityId: e.abilityId, abilityName: e.abilityName, beforeScore, afterScore, beforeTier, afterTier, delta, baseline, improved, dimensionDeltas: e.dimensionDeltas }
      })
      .sort((a, b) => {
        if (a.improved !== b.improved) return a.improved === 'up' ? -1 : a.improved === 'down' ? 1 : 0
        return b.delta - a.delta
      })
  }, [effectiveness])

  const effectivenessSummary = useMemo(() => {
    const total = effectivenessScores.length
    const up = effectivenessScores.filter((s) => s.improved === 'up').length
    const flat = effectivenessScores.filter((s) => s.improved === 'flat').length
    const down = effectivenessScores.filter((s) => s.improved === 'down').length
    return { total, up, flat, down }
  }, [effectivenessScores])

  if (!student) return null

  return (
    <div className="flex flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">成效分析</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              能力单元掌握度评估，分层对比学习成效与五维得分演变
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
      <div className="grid gap-5 lg:grid-cols-12 h-[630px]">
        <div className="flex flex-col gap-5 lg:col-span-3 min-h-0">
          <Panel className="space-y-3 p-4 shrink-0">
            <SectionTitle>能力概览</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <StatCard value={overallAvg} label="综合均分" tone="blue" />
              <StatCard value={`${achieveRate}%`} label="能力达标率" tone="green" />
              <StatCard value={metCount} label="达标能力单元" tone="purple" />
              <StatCard value={belowCount} label="待提升项" tone="amber" />
            </div>
          </Panel>

          <Panel className="p-4 flex flex-col flex-1 min-h-0">
            <SectionTitle>
              <span className="flex items-center gap-1.5">
                <Target className="size-4 text-indigo-500" /> 我的工单
              </span>
            </SectionTitle>
            <div className="mt-3 space-y-1.5 overflow-y-auto flex-1 min-h-0 pr-1">
              {hierarchy.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无工单记录</div>
              ) : (
                hierarchy.map((r) => {
                  const wo = getWorkorderById(r.workorderId)
                  const selected = selectedWorkorder === r.workorderId + r.date
                  return (
                    <div key={r.workorderId + r.date}>
                      <button
                        type="button"
                        onClick={() => setSelectedWorkorder(selected ? null : r.workorderId + r.date)}
                        className={cn(
                          'w-full rounded-md border px-3 py-2 text-left text-xs transition-colors',
                          selected
                            ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                            : 'hover:bg-muted/50'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            {selected ? <ChevronDown className="size-3.5 shrink-0" /> : <ChevronRight className="size-3.5 shrink-0" />}
                            <span className="truncate font-medium">{wo?.name || r.workorderId}</span>
                          </div>
                          <span className={cn(
                            'font-bold text-[10px]',
                            r.scoreImpact > 0 ? 'text-emerald-600' : 'text-red-500'
                          )}>
                            {r.scoreImpact > 0 ? '+' : ''}{r.scoreImpact}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{r.date}</span>
                        </div>
                      </button>
                      {selected && r.tasks && r.tasks.length > 0 && (
                        <div className="ml-4 mt-1.5 space-y-2 border-l-2 border-indigo-100 pl-3">
                          {r.tasks.map((task) => (
                            <TaskCard key={task.id} task={task} />
                          ))}
                        </div>
                      )}
                      {selected && (!r.tasks || r.tasks.length === 0) && (
                        <div className="ml-4 mt-1.5 border-l-2 border-slate-200 pl-3 py-2 text-[11px] text-muted-foreground">
                          暂无层级明细
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-6 min-h-0">
          <Panel className="p-4 flex flex-col flex-1 min-h-0">
            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
              <SectionTitle>
                <span className="flex items-center gap-1.5">
                  <TrendingDown className="size-4 text-indigo-500" /> 岗位能力模型
                </span>
              </SectionTitle>
            </div>

            <div className="mt-4 space-y-2.5 overflow-y-auto flex-1 min-h-0 pr-1">
              <p className="text-[11px] text-muted-foreground shrink-0">点击任意能力单元查看历史变化与升降原因</p>
              {abilities.map((ability) => {
                const score = latestScores[ability.id] ?? 0
                const tier = tierOf(score, ability.baseline)
                const badge = TIER_BADGE[tier]
                const yesterday = getLatestScore(STUDENT_ID, ability.id, '2026-07-06')?.score ?? score
                const dropped = score < yesterday
                return (
                  <button
                    type="button"
                    key={ability.id}
                    onClick={() => onNavigate?.(ability.id)}
                    className="w-full cursor-pointer rounded-lg border bg-card p-3 text-left transition-colors hover:border-indigo-200 hover:bg-indigo-50/40"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold">{ability.name}</span>
                      <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold', badge.cls)}>
                        {badge.label}
                      </span>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2 text-xs">
                      <span className={cn('text-lg font-extrabold leading-none', TIER_TEXT[tier])}>{score}</span>
                      <span className="text-muted-foreground">/ 基准 {ability.baseline}</span>
                      {dropped && (
                        <span className="ml-auto flex items-center gap-1 text-[11px] font-medium text-red-500">
                          <AlertCircle className="size-3" /> 较昨日 -{yesterday - score}
                        </span>
                      )}
                    </div>
                    <div className="mt-2">
                      <MasteryBar score={score} baseline={ability.baseline} />
                    </div>
                  </button>
                )
              })}
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-5 lg:col-span-3 min-h-0">
          <Panel className="p-4 flex flex-col flex-1 min-h-0">
            <SectionTitle>
              <span className="flex items-center gap-1.5">
                <Activity className="size-4 text-emerald-500" /> 学习成效对比
              </span>
            </SectionTitle>
            <div className="mt-2 grid grid-cols-3 gap-2 shrink-0">
              <div className="rounded-lg bg-emerald-50 px-2 py-1.5 text-center">
                <div className="text-lg font-extrabold text-emerald-600">{effectivenessSummary.total}</div>
                <div className="text-[10px] text-muted-foreground">能力提升</div>
              </div>
              <div className="rounded-lg bg-indigo-50 px-2 py-1.5 text-center">
                <div className="text-lg font-extrabold text-indigo-600">{effectivenessSummary.up}</div>
                <div className="text-[10px] text-muted-foreground">能力下降</div>
              </div>
              <div className="rounded-lg bg-amber-50 px-2 py-1.5 text-center">
                <div className="text-lg font-extrabold text-amber-600">{effectivenessSummary.down}</div>
                <div className="text-[10px] text-muted-foreground">稳定性低</div>
              </div>
            </div>
            <div className="mt-3 space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
              {effectivenessScores.length === 0 ? (
                <div className="text-sm text-muted-foreground">暂无对比数据</div>
              ) : (
                effectivenessScores.map((s) => {
                  const tierColor: Record<string, string> = {
                    '未达标': 'bg-amber-100 text-amber-700',
                    '达标': 'bg-indigo-100 text-indigo-700',
                    '超基准': 'bg-emerald-100 text-emerald-700',
                  }
                  return (
                    <div key={s.abilityId} className="rounded-lg border bg-white p-2.5">
                      <div className="text-xs font-semibold truncate">{s.abilityName}</div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', tierColor[s.beforeTier])}>
                          {s.beforeTier}
                        </span>
                        <ArrowRight className="size-3 text-muted-foreground" />
                        <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', tierColor[s.afterTier])}>
                          {s.afterTier}
                        </span>
                        {s.improved === 'up' && <CheckCircle2 className="size-3.5 text-emerald-500" />}
                        {s.improved === 'down' && <AlertCircle className="size-3.5 text-red-500" />}
                      </div>
                      <div className="mt-1.5 flex items-baseline gap-1 text-[11px]">
                        <span className="font-bold">{s.beforeScore}</span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-bold">{s.afterScore}</span>
                        <span className={cn(
                          'ml-auto text-[10px] font-bold',
                          s.delta > 0 ? 'text-emerald-600' : s.delta < 0 ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          {s.delta > 0 ? '+' : ''}{s.delta}
                        </span>
                      </div>
                      <div className="mt-1 flex gap-0.5">
                        <div
                          className="h-2 rounded-l bg-amber-300"
                          style={{ width: `${Math.max(2, s.beforeScore)}%` }}
                        />
                        <div
                          className={cn(
                            'h-2',
                            s.delta > 0 ? 'bg-emerald-400' : s.delta < 0 ? 'bg-red-400' : 'bg-slate-300',
                            s.afterScore >= 100 ? 'rounded-r' : ''
                          )}
                          style={{ width: `${Math.max(0, s.delta)}%` }}
                        />
                        <div
                          className="h-2 flex-1 rounded-r bg-slate-100"
                        />
                      </div>
                      {s.dimensionDeltas && Object.entries(s.dimensionDeltas).some(([, v]) => v !== 0) && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {Object.entries(s.dimensionDeltas)
                            .filter(([, v]) => v !== 0)
                            .map(([dim, v]) => (
                              <span
                                key={dim}
                                className={cn(
                                  'rounded px-1 py-0.5 text-[10px] font-medium',
                                  v > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                                )}
                              >
                                {(DIM_LABEL[dim] || dim)} {v > 0 ? '↓' : '↑'}{Math.abs(v)}
                              </span>
                            ))}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-4">
          <SectionTitle extra={dimensionImprovement.length > 0 ? '学习前后五维对比' : ''}>
            <span className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-emerald-500" /> 五维能力分值提升
            </span>
          </SectionTitle>
          <div className="mt-3 h-72 rounded-lg bg-gradient-to-br from-emerald-50/40 to-indigo-50/30 p-2">
            {dimensionImprovement.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={dimChartData} barCategoryGap="30%" margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value} 分`, name]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                  <Bar dataKey="学习前" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="学习后" fill="#27b08a" radius={[4, 4, 0, 0]}>
                    {dimChartData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={entry.delta > 0 ? '#27b08a' : entry.delta < 0 ? '#ef4444' : '#94a3b8'}
                      />
                    ))}
                  </Bar>
                </ReBarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-muted-foreground">
                <TrendingUp className="size-8 opacity-30" />
                暂无可对比的五维提升数据
              </div>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {dimensionImprovement.map((d) => (
              <span
                key={d.dimension}
                className={cn(
                  'rounded-md px-2 py-0.5 text-[11px] font-semibold',
                  d.delta > 0 ? 'bg-emerald-50 text-emerald-600' : d.delta < 0 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                )}
              >
                {DIM_LABEL[d.dimension] || d.dimension} {d.delta > 0 ? '+' : ''}{d.delta}
              </span>
            ))}
          </div>
        </Panel>

        <Panel className="p-4">
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <TrendingDown className="size-4 text-indigo-500" /> 得分随时间变化
            </span>
          </SectionTitle>
          <div className="mt-3 h-80 rounded-lg bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-2">
            {lineData.length > 0 ? (
              <LineChart data={lineData} xKey="date" series={lineSeries} />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">暂无数据</div>
            )}
          </div>
        </Panel>
      </div>

      <div className="flex items-center justify-center gap-1 rounded-xl border bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-emerald-500" />
        执行驱动诊断 → 知识图谱关联 → 智能学习推荐 → 成效持续提升闭环
      </div>

      <AbilityHistoryDialog
        ability={historyAbility}
        open={!!historyAbility}
        onOpenChange={(o) => !o && setHistoryAbility(null)}
      />
    </div>
  )
}
