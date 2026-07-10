'use client'

import { useState, useMemo } from 'react'
import nextDynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useDemo } from '@/components/demo-provider'
import { getStudentGraph, getWeakAbilities, getStudentWorkorders } from '@/lib/mock-data'
import { Network, GitBranch, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'

const KnowledgeGraphView = nextDynamic(
  () => import('@/components/knowledge-graph-view').then((mod) => mod.KnowledgeGraphView),
  { ssr: false, loading: () => <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">图谱加载中…</div> }
)

const KnowledgeGraphD3View = nextDynamic(
  () => import('@/components/knowledge-graph-d3-view').then((mod) => mod.KnowledgeGraphD3View),
  { ssr: false, loading: () => <div className="flex h-96 items-center justify-center text-sm text-muted-foreground">图谱加载中…</div> }
)

const STUDENT_ID = 'stu-li'

function ViewToggle({ mode, onChange }: { mode: 'static' | 'force'; onChange: (m: 'static' | 'force') => void }) {
  return (
    <div className="flex items-center rounded-lg border bg-muted/60 p-0.5">
      <button
        onClick={() => onChange('static')}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'static' ? 'bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <Network className="size-3.5" />静态
      </button>
      <button
        onClick={() => onChange('force')}
        className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'force' ? 'bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <GitBranch className="size-3.5" />力矩
      </button>
    </div>
  )
}

export function KnowledgeGraphContent() {
  const { role } = useDemo()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'static' | 'force'>('force')
  const [startDate, setStartDate] = useState('2026-06-08')
  const [endDate, setEndDate] = useState('2026-07-07')

  const weakParam = searchParams.get('weak')
  const allRecords = useMemo(() => getStudentWorkorders(STUDENT_ID), [])
  const filteredRecords = useMemo(
    () => allRecords.filter((r) => r.date >= startDate && r.date <= endDate),
    [allRecords, startDate, endDate]
  )

  const defaultWeak = getWeakAbilities(STUDENT_ID)
    .filter((w) => filteredRecords.some((r) => r.abilityId === w.abilityId))
    .slice(0, 4)
    .map((w) => w.abilityId)
  const highlightIds = weakParam
    ? weakParam.split(',').filter(Boolean)
    : defaultWeak
  const highlightNodeIds = highlightIds.length > 0 ? new Set(highlightIds) : undefined

  const { nodes, edges } = getStudentGraph(STUDENT_ID)
  const desc = highlightNodeIds
    ? '标准岗位知识图谱，红色高亮为该员工的薄弱能力单元，实现个性化展示'
    : '基于您关联的岗位生成的岗位→能力领域→能力单元→知识点→教材课件关联网络'
  const sp = {
    nodes,
    edges,
    compact: true,
    className: 'flex-1 min-h-0',
    highlightNodeIds,
    role,
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">知识图谱</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
          </div>
        </div>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>
      {viewMode === 'static' ? (
        <KnowledgeGraphView {...sp} />
      ) : (
        <KnowledgeGraphD3View {...sp} />
      )}
    </div>
  )
}
