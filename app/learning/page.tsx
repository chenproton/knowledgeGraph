'use client'

import { useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  BookOpen,
  FileText,
  HelpCircle,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  FileWarning,
  Network,
  GitBranch,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getPositionAbilities,
  getLatestScore,
  getPositionGraph,
  getAbilityWorkorders,
  getStudentWorkorders,
  getLearningPath,
  getCourseDescription,
  getCourseById,
} from '@/lib/mock-data'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GraphDetailStack, type NodeLite } from '@/components/graph-node-detail'
import { useDemo } from '@/components/demo-provider'
import { cn } from '@/lib/utils'
import type { AbilityPoint, Course, Dimension } from '@/lib/types'
import { DIMENSIONS } from '@/lib/types'

const KnowledgeGraphView = dynamic(
  () => import('@/components/knowledge-graph-view').then((mod) => mod.KnowledgeGraphView),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        图谱加载中…
      </div>
    ),
  }
)

const KnowledgeGraphD3View = dynamic(
  () => import('@/components/knowledge-graph-d3-view').then((mod) => mod.KnowledgeGraphD3View),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">
        图谱加载中…
      </div>
    ),
  }
)

const STUDENT_ID = 'stu-li'

const DIMENSION_LABELS: Record<Dimension, { label: string; color: string }> = {
  '数量': { label: '工作量', color: 'bg-blue-50 text-blue-600' },
  '质量': { label: '工单质量', color: 'bg-amber-50 text-amber-600' },
  '安全': { label: '安全性', color: 'bg-red-50 text-red-600' },
  '规范': { label: '规范性', color: 'bg-purple-50 text-purple-600' },
  '效率': { label: '效率', color: 'bg-emerald-50 text-emerald-600' },
}

function useQueryLink() {
  const searchParams = useSearchParams()
  return (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }
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

function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border bg-card shadow-sm', className)}>{children}</div>
}

function SectionTitle({ children, extra }: { children: React.ReactNode; extra?: React.ReactNode }) {
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

function MasteryBar({ score, baseline }: { score: number; baseline: number }) {
  const tier = tierOf(score, baseline)
  const c = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <div className="relative h-4 rounded-md bg-slate-100">
      <div
        className={cn(
          'flex h-full items-center justify-end rounded-md bg-gradient-to-r pr-1.5 text-[9px] font-bold text-white transition-all duration-700',
          TIER_FILL[tier]
        )}
        style={{ width: `${Math.max(c, 9)}%` }}
      >
        {score}
      </div>
      <div
        className="absolute -top-1 -bottom-1 z-10 border-l border-dashed border-slate-400"
        style={{ left: `${Math.max(0, Math.min(100, baseline))}%` }}
      />
    </div>
  )
}

const COURSE_STYLE: Record<Course['type'], { label: string; icon: React.ReactNode; chip: string }> = {
  course: {
    label: '视频',
    icon: <Play className="size-3.5" />,
    chip: 'bg-indigo-50 text-indigo-600',
  },
  material: {
    label: '课件',
    icon: <FileText className="size-3.5" />,
    chip: 'bg-purple-50 text-purple-600',
  },
  quiz: {
    label: '试题',
    icon: <HelpCircle className="size-3.5" />,
    chip: 'bg-amber-50 text-amber-600',
  },
}

function CourseCard({ course, onOpenNode }: { course: Course; onOpenNode?: (n: NodeLite) => void }) {
  const style = COURSE_STYLE[course.type]
  const desc = course.description || getCourseDescription(course.id)

  const handleStart = () => {
    window.open(`https://lms.example.com/course/${course.id}`, '_blank')
    toast.info('已打开学习平台', { description: course.title })
  }

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <button
          type="button"
          onClick={() => onOpenNode?.({ id: course.id, type: 'course', label: course.title })}
          className="flex min-w-0 items-center gap-2 text-left"
        >
          <span
            className={cn(
              'flex size-6 shrink-0 items-center justify-center rounded-md',
              style.chip
            )}
          >
            {style.icon}
          </span>
          <span className={cn('truncate text-sm font-semibold', onOpenNode && 'hover:underline')}>
            {course.title}
          </span>
        </button>
        <span className={cn('shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold', style.chip)}>
          {style.label}
        </span>
      </div>
      <div className="mt-1.5 text-xs text-muted-foreground">{desc ? `${desc}` : `预计 ${course.duration}`}</div>
      <div className="mt-2.5 flex gap-2">
        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleStart}>
          <ExternalLink className="mr-1 size-3" /> 学习
        </Button>
      </div>
    </div>
  )
}

function AbilityDetail({
  ability,
  studentId,
  startDate,
  endDate,
  onOpenNode,
}: {
  ability: AbilityPoint
  studentId: string
  startDate: string
  endDate: string
  onOpenNode?: (n: NodeLite) => void
}) {
  const workorders = getAbilityWorkorders(ability.id)
  const latest = getLatestScore(studentId, ability.id)
  const score = latest?.score ?? 0
  const tier = tierOf(score, ability.baseline)
  const badge = TIER_BADGE[tier]
  const qualified = score >= ability.baseline

  const allRecords = useMemo(
    () => getStudentWorkorders(studentId).filter((r) => r.date >= startDate && r.date <= endDate),
    [studentId, startDate, endDate]
  )
  const [activeDomainId, setActiveDomainId] = useState(workorders[0]?.id ?? '')

  useEffect(() => {
    if (!workorders.find((w) => w.id === activeDomainId)) {
      setActiveDomainId(workorders[0]?.id ?? '')
    }
  }, [workorders, activeDomainId])

  const domainRecords = useMemo(
    () => allRecords.filter((r) => r.workorderId === activeDomainId).sort((a, b) => b.date.localeCompare(a.date)),
    [allRecords, activeDomainId]
  )

  const domainAverages = useMemo(() => {
    if (domainRecords.length === 0) return null
    const sums: Record<Dimension, number> = { '数量': 0, '质量': 0, '安全': 0, '规范': 0, '效率': 0 }
    domainRecords.forEach((r) => {
      DIMENSIONS.forEach((d) => {
        sums[d] += r.dimensionScore[d] ?? 0
      })
    })
    const avgs = {} as Record<Dimension, number>
    DIMENSIONS.forEach((d) => {
      avgs[d] = Math.round(sums[d] / domainRecords.length)
    })
    return avgs
  }, [domainRecords])

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50/60 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="text-base font-bold">{ability.name}</div>
          <span className={cn('rounded-md px-2 py-0.5 text-[10px] font-bold', badge.cls)}>
            {badge.label}
          </span>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{ability.description}</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className={cn('text-3xl font-extrabold leading-none', TIER_TEXT[tier])}>{score}</span>
          <span className="text-xs text-muted-foreground">/ 基准 {ability.baseline}</span>
        </div>
        <div className="mt-2.5">
          <MasteryBar score={score} baseline={ability.baseline} />
        </div>
      </div>

      {workorders.length > 0 && (
        <div>
          <SectionTitle>
            <span className="flex items-center gap-1.5">
              <FileWarning className="size-4 text-rose-500" /> 五维评分数据
            </span>
          </SectionTitle>
          <div className="mt-2.5 space-y-3">
            {workorders.length > 1 && (
              <Tabs value={activeDomainId} onValueChange={setActiveDomainId}>
                <TabsList className="w-full">
                  {workorders.map((w) => (
                    <TabsTrigger key={w.id} value={w.id} className="flex-1 text-xs">
                      {w.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            )}
            <div className="text-sm font-medium">
              {workorders.find((w) => w.id === activeDomainId)?.name || activeDomainId}
            </div>
            {domainAverages ? (
              <div className="space-y-2">
                {DIMENSIONS.map((d) => {
                  const dim = DIMENSION_LABELS[d]
                  const val = domainAverages[d]
                  return (
                    <div key={d} className="flex items-center gap-2">
                      <span className={cn('rounded px-1.5 py-0.5 text-[11px] font-medium shrink-0', dim.color)}>
                        {dim.label}
                      </span>
                      <div className="relative flex-1 h-4 rounded-md bg-slate-100 overflow-hidden">
                        <div
                          className="absolute inset-y-0 left-0 rounded-md bg-gradient-to-r from-indigo-400 to-indigo-500 transition-all"
                          style={{ width: `${val}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold w-8 text-right">{val}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">暂无执行记录</span>
            )}

            {domainRecords.length > 0 && (
              <div className="rounded-lg border bg-muted/30 p-2">
                <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">历史记录</div>
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="text-muted-foreground">
                      <th className="pb-1 text-left font-medium">日期</th>
                      {DIMENSIONS.map((d) => (
                        <th key={d} className="pb-1 text-right font-medium">{DIMENSION_LABELS[d].label.slice(0, 2)}</th>
                      ))}
                      <th className="pb-1 text-right font-medium">影响</th>
                    </tr>
                  </thead>
                  <tbody>
                    {domainRecords.slice(0, 10).map((r) => (
                      <tr key={`${r.workorderId}-${r.date}`} className="border-t border-dashed">
                        <td className="py-0.5 font-mono">{r.date.slice(5)}</td>
                        {DIMENSIONS.map((d) => (
                          <td key={d} className="py-0.5 text-right">{r.dimensionScore[d] ?? '-'}</td>
                        ))}
                        <td className={cn('py-0.5 text-right font-semibold', r.scoreImpact > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                          {r.scoreImpact > 0 ? '+' : ''}{r.scoreImpact}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div>
        <SectionTitle>
          <span className="flex items-center gap-1.5">
            <AlertCircle className="size-4 text-indigo-500" /> 学习建议
          </span>
        </SectionTitle>
        <div
          className={cn(
            'mt-2.5 rounded-lg border p-3 text-sm',
            qualified
              ? 'border-emerald-100 bg-gradient-to-br from-emerald-50 to-white text-emerald-700'
              : 'border-amber-100 bg-gradient-to-br from-amber-50 to-white text-amber-700'
          )}
        >
          {qualified ? (
            <p>该能力单元已达到基准要求，建议定期复习关联课程以保持水平。</p>
          ) : (
            <p>
              该能力单元掌握度低于基准要求 {ability.baseline}
              ，建议优先学习下方推荐资源，提升后在实际执行中验证成效。
            </p>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>
          <span className="flex items-center gap-1.5">
            <BookOpen className="size-4 text-emerald-500" /> 推荐学习资源
          </span>
        </SectionTitle>
        <p className="mt-1.5 text-xs text-muted-foreground">
          AI 数字讲师为您规划专属学习路径：装表接电专题提升
        </p>
        <div className="mt-4 space-y-5">
          {getLearningPath().map((group) => {
            const groupCourses = group.courseIds
              .map((cid) => getCourseById(cid))
              .filter((c): c is Course => c !== undefined)
            if (groupCourses.length === 0) return null
            return (
              <div key={group.id}>
                <h3 className="text-sm font-bold text-indigo-700">{group.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{group.intro}</p>
                <div className="mt-2.5 space-y-2">
                  {groupCourses.map((course) => (
                    <CourseCard key={course.id} course={course} onOpenNode={onOpenNode} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function LearningPage() {
  const { role } = useDemo()
  const link = useQueryLink()
  const [viewMode, setViewMode] = useState<'static' | 'force'>('static')
  const [startDate, setStartDate] = useState('2026-06-08')
  const [endDate, setEndDate] = useState('2026-07-07')

  const abilities = useMemo(() => {
    const list = getPositionAbilities('pos1')
    return [...list].sort((a, b) => {
      const sa = getLatestScore(STUDENT_ID, a.id)?.score ?? 0
      const sb = getLatestScore(STUDENT_ID, b.id)?.score ?? 0
      const ta = tierOf(sa, a.baseline)
      const tb = tierOf(sb, b.baseline)
      const order = { below: 0, meet: 1, exceed: 2 }
      if (order[ta] !== order[tb]) return order[ta] - order[tb]
      return sa - sb
    })
  }, [])
  const [selectedAbilityId, setSelectedAbilityId] = useState(abilities[0]?.id)

  useEffect(() => {
    setSelectedAbilityId(abilities[0]?.id)
  }, [abilities])

  const selectedAbility = abilities.find((a) => a.id === selectedAbilityId)
  const graph = useMemo(() => getPositionGraph('pos1'), [])
  const [detailNode, setDetailNode] = useState<NodeLite | null>(null)

  return (
    <div className="flex h-full flex-col gap-5">
      <div className="min-h-0 flex-1 grid overflow-hidden rounded-xl border bg-card shadow-sm lg:grid-cols-12">
        {/* Card header */}
        <div className="lg:col-span-12 flex flex-wrap items-end justify-between gap-3 border-b px-5 py-3">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">学习推荐</h1>
              <p className="mt-0.5 text-xs text-muted-foreground">
                基于岗位能力单元掌握情况，定位短板并推荐学习资源
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 h-8 text-xs" />
              <span className="text-xs text-muted-foreground">—</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 h-8 text-xs" />
            </div>
            <div className="flex items-center rounded-lg border bg-muted/60 p-0.5">
              <button
                onClick={() => setViewMode('static')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  viewMode === 'static'
                    ? 'bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Network className="size-3.5" />静态
              </button>
              <button
                onClick={() => setViewMode('force')}
                className={cn(
                  'inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors',
                  viewMode === 'force'
                    ? 'bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <GitBranch className="size-3.5" />力矩
              </button>
            </div>
          </div>
        </div>

        {/* Left: ability list */}
        <div className="flex flex-col min-h-0 border-r lg:col-span-3">
          <div className="shrink-0 px-3 pt-2 pb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Target className="size-3.5" /> 能力单元列表
            </div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
            {abilities.map((ability) => {
              const latest = getLatestScore(STUDENT_ID, ability.id)
              const score = latest?.score ?? 0
              const tier = tierOf(score, ability.baseline)
              const badge = TIER_BADGE[tier]
              const selected = selectedAbilityId === ability.id
              return (
                <button
                  key={ability.id}
                  onClick={() => setSelectedAbilityId(ability.id)}
                  className={cn(
                    'w-full rounded-lg border p-3 text-left transition-colors',
                    selected
                      ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                      : 'bg-card hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold">{ability.name}</span>
                    <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-bold', badge.cls)}>
                      {badge.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className={cn('text-lg font-extrabold leading-none', TIER_TEXT[tier])}>
                      {score}
                    </span>
                    <span className="text-[11px] text-muted-foreground">/ {ability.baseline}</span>
                    <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                      {latest?.date || '-'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <MasteryBar score={score} baseline={ability.baseline} />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Center: ability graph */}
        <div className="flex flex-col min-h-0 overflow-hidden lg:col-span-5">
          <div className="shrink-0 px-3 pt-2 pb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Network className="size-3.5" /> 能力图谱
            </div>
          </div>
          <div className="min-h-0 flex-1 bg-gradient-to-br from-indigo-50/40 to-purple-50/20 p-3">
            {viewMode === 'static' ? (
              <KnowledgeGraphView nodes={graph.nodes} edges={graph.edges} compact className="h-full max-h-[560px]" />
            ) : (
              <KnowledgeGraphD3View nodes={graph.nodes} edges={graph.edges} compact className="h-full max-h-[560px]" />
            )}
          </div>
        </div>

        {/* Right: evaluation */}
        <div className="flex flex-col min-h-0 border-l lg:col-span-4">
          <div className="shrink-0 px-3 pt-2 pb-1">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <BookOpen className="size-3.5" /> 评价结果及建议
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {selectedAbility ? (
              <AbilityDetail ability={selectedAbility} studentId={STUDENT_ID} startDate={startDate} endDate={endDate} onOpenNode={setDetailNode} />
            ) : (
              <div className="text-sm text-muted-foreground">请选择左侧能力单元查看详情</div>
            )}
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-1 rounded-xl border bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-3 text-center text-sm text-muted-foreground">
        <CheckCircle2 className="size-4 text-emerald-500" />
        完成推荐课程并通过测评后，能力单元分数将按规则回升。可在
        <Link href={link('/profile')} className="mx-1 font-semibold text-indigo-600 hover:underline">
          能力画像
        </Link>
        中查看变化。
      </div>

      <GraphDetailStack rootNode={detailNode} onClose={() => setDetailNode(null)} role={role} />
    </div>
  )
}
