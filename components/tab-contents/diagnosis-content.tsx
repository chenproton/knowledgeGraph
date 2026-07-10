'use client'

import { useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Radar as RadarIcon,
  Target,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileWarning,
  Send,
  ArrowRight,
  Calendar,
} from 'lucide-react'
import {
  getStudentById,
  getDimensionBreakdown,
  getWeakAbilities,
  getStudentWorkorders,
  type WeakAbility,
  type DimensionDetail,
} from '@/lib/mock-data'
import { RadarChart } from '@/components/charts/radar-chart'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'
import { DIMENSIONS, type Dimension } from '@/lib/types'

const STUDENT_ID = 'stu-li'

const DIM_COLORS: Record<Dimension, { bg: string; text: string; fill: string; bar: string }> = {
  数量: { bg: 'bg-blue-50 border-blue-100', text: 'text-blue-600', fill: 'bg-blue-500', bar: 'bg-blue-400' },
  质量: { bg: 'bg-amber-50 border-amber-100', text: 'text-amber-600', fill: 'bg-amber-500', bar: 'bg-amber-400' },
  安全: { bg: 'bg-red-50 border-red-100', text: 'text-red-600', fill: 'bg-red-500', bar: 'bg-red-400' },
  规范: { bg: 'bg-purple-50 border-purple-100', text: 'text-purple-600', fill: 'bg-purple-500', bar: 'bg-purple-400' },
  效率: { bg: 'bg-emerald-50 border-emerald-100', text: 'text-emerald-600', fill: 'bg-emerald-500', bar: 'bg-emerald-400' },
}

function useQueryLink() {
  const searchParams = useSearchParams()
  return (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

function DimensionPanel({ detail }: { detail: DimensionDetail }) {
  const [open, setOpen] = useState(detail.totalDeduction > 0)
  const c = DIM_COLORS[detail.dimension]
  return (
    <div className={cn('rounded-xl border p-4', c.bg)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
          <span className="font-semibold">{detail.dimension}</span>
          <Badge variant="outline" className="text-xs">
            {detail.score} 分
          </Badge>
        </div>
        <span className={cn('text-sm font-bold', c.text)}>-{detail.totalDeduction}分</span>
      </button>
      {open && detail.items.length > 0 && (
        <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto border-t pt-3 pr-1">
          {detail.items.map((item, idx) => (
            <div
              key={`${detail.dimension}-${idx}`}
              className="flex items-center justify-between rounded-md border bg-white/60 px-3 py-1.5 text-xs"
            >
              <div className="min-w-0 flex-1">
                <span className="font-medium text-muted-foreground">{item.problemType}</span>
                <span className="mx-1 text-muted-foreground/50">|</span>
                <span>{item.problem}</span>
                <span className="ml-1 inline-flex items-center gap-1 text-[10px]">
                  <span className={cn('size-1.5 rounded-full', c.fill)} />
                  {item.deductionName}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{item.workorderName}</span>
                <span className="text-[10px] text-muted-foreground">{item.date}</span>
                <span className={cn('font-bold', c.text)}>-{item.points}</span>
              </div>
            </div>
          ))}
        </div>
      )}
      {open && detail.items.length === 0 && (
        <div className="mt-3 border-t pt-3 text-xs text-muted-foreground">
          该维度暂无扣分记录
        </div>
      )}
    </div>
  )
}

function WeakAbilityCard({
  ability,
  link,
}: {
  ability: WeakAbility
  link: (path: string) => string
}) {
  const router = useRouter()
  const handleExport = () => {
    const weakIds = getWeakAbilities(STUDENT_ID)
      .slice(0, 5)
      .map((w) => w.abilityId)
      .join(',')
    router.push(link(`/knowledge-graph?weak=${weakIds}`))
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-orange-100 bg-gradient-to-br from-orange-50 to-white p-3">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold">{ability.abilityName}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>累计扣分 {ability.totalDeduction}</span>
          <span>| {ability.count} 次</span>
        </div>
      </div>
      <Button size="sm" variant="outline" className="shrink-0 gap-1 text-xs" onClick={handleExport}>
        <Send className="size-3" /> 导入图谱
      </Button>
    </div>
  )
}

export function DiagnosisContent() {
  const link = useQueryLink()
  const student = getStudentById(STUDENT_ID)
  const [startDate, setStartDate] = useState('2026-06-08')
  const [endDate, setEndDate] = useState('2026-07-07')

  const allRecords = useMemo(() => getStudentWorkorders(STUDENT_ID), [])

  const filteredRecords = useMemo(
    () => allRecords.filter((r) => r.date >= startDate && r.date <= endDate),
    [allRecords, startDate, endDate]
  )

  const filteredRecordIds = useMemo(() => new Set(filteredRecords.map((r) => r.workorderId + r.date)), [filteredRecords])

  const breakdown = useMemo(() => {
    const full = getDimensionBreakdown(STUDENT_ID)
    return full.map((dim) => ({
      ...dim,
      items: dim.items.filter((item) => filteredRecordIds.has(item.workorderName + item.date)),
      totalDeduction: dim.items.filter((item) => filteredRecordIds.has(item.workorderName + item.date)).reduce((s, i) => s + i.points, 0),
    }))
  }, [filteredRecordIds])

  const weakAbilities = useMemo(() => {
    const all = getWeakAbilities(STUDENT_ID)
    return all.filter((w) => filteredRecords.some((r) => r.abilityId === w.abilityId))
  }, [filteredRecords])

  if (!student) return null

  const radarData = DIMENSIONS.map((dim) => {
    const d = breakdown.find((b) => b.dimension === dim)
    return { dimension: dim, value: d?.score ?? 100 }
  })

  const totalDeduction = breakdown.reduce((s, d) => s + d.totalDeduction, 0)
  const weakCount = weakAbilities.filter((w) => w.totalDeduction >= 6).length

  return (
    <div className="flex flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#e89b3a] to-[#f3c069]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">五维能力</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              基于扣分项数据，逆向分析五维排名短板并定位薄弱能力单元
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
        <StatCard value={totalDeduction} label="累计扣分" tone="rose" icon={<AlertCircle className="size-7" />} />
        <StatCard value={weakCount} label="薄弱能力单元" tone="amber" icon={<Target className="size-7" />} />
        <StatCard
          value={clampScore(100 - totalDeduction / 3)}
          label="综合健康分"
          tone="blue"
          icon={<RadarIcon className="size-7" />}
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-12">
        <Card className="lg:col-span-5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <RadarIcon className="size-4" /> 五维负向雷达
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <RadarChart data={radarData} />
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              百分制负向计分：扣分越多，分值越低
            </p>
          </CardContent>
        </Card>

        <div className="space-y-3 lg:col-span-4">
          {breakdown.map((detail) => (
            <DimensionPanel key={detail.dimension} detail={detail} />
          ))}
        </div>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="size-4" /> 薄弱能力单元（准备导入图谱）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {weakAbilities.length === 0 ? (
              <div className="text-sm text-muted-foreground">暂无能力短板</div>
            ) : (
              weakAbilities.slice(0, 10).map((w) => (
                <WeakAbilityCard key={w.abilityId} ability={w} link={link} />
              ))
            )}
            <div className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-indigo-50/60 to-purple-50/40 p-2.5 text-center text-[11px] text-muted-foreground">
              <ArrowRight className="size-3 shrink-0" />
              点击「导入图谱」将在标准知识图谱上高亮标注对应薄弱能力单元
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-center gap-1 rounded-xl border bg-gradient-to-r from-amber-50/60 to-orange-50/40 p-3 text-center text-sm text-muted-foreground">
        <FileWarning className="size-4 text-amber-500" />
        薄弱能力单元的锁定依托具体扣分项的明细数据，而非五维雷达图的整体分值
      </div>
    </div>
  )
}
