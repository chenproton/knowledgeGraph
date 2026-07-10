'use client'

import { useState, useMemo } from 'react'
import nextDynamic from 'next/dynamic'
import { useSearchParams } from 'next/navigation'
import { useDemo } from '@/components/demo-provider'
import { getStudentGraph, getMockData, getWeakAbilities, getStudentWorkorders } from '@/lib/mock-data'
import { Network, GitBranch, Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'

export const dynamic = 'force-dynamic'

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

export default function KnowledgeGraphPage() {
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

  if (role === 'student') {
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
      <div className="flex flex-col h-full gap-3 overflow-hidden">
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
            <div>
              <h1 className="text-2xl font-bold tracking-tight">知识图谱</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-32 h-8 text-xs" />
              <span className="text-xs text-muted-foreground">—</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-32 h-8 text-xs" />
            </div>
            <ViewToggle mode={viewMode} onChange={setViewMode} />
          </div>
        </div>
        {viewMode === 'static' ? (
          <KnowledgeGraphView {...sp} />
        ) : (
          <KnowledgeGraphD3View {...sp} />
        )}
      </div>
    )
  }

  const mock = getMockData()
  const { positions, knowledgePoints, courses, capabilityDomains, capabilityUnits } = mock
  const graphNodes = [
    ...positions.map((p) => ({ id: p.id, label: p.name, type: 'position' as const })),
    ...capabilityDomains.map((d) => ({ id: d.id, label: d.name, type: 'domain' as const })),
    ...capabilityUnits.map((u) => ({ id: u.id, label: u.name, type: 'unit' as const })),
    ...knowledgePoints.map((k) => ({
      id: k.id,
      label: k.name,
      type: 'knowledge' as const,
      level: k.level,
    })),
    ...courses.map((c) => ({ id: c.id, label: c.title, type: 'course' as const })),
  ]
  const graphEdges = [
    ...capabilityDomains.map((d) => ({ source: d.positionId, target: d.id })),
    ...capabilityUnits.map((u) => ({ source: u.domainId, target: u.id })),
    ...capabilityUnits.flatMap((u) => u.knowledgeIds.map((kId) => ({ source: u.id, target: kId }))),
    ...knowledgePoints.flatMap((k) => k.courseIds.map((id) => ({ source: k.id, target: id }))),
    ...courses
      .filter((c) => c.parentId)
      .flatMap((c) => {
        const parentKps = knowledgePoints.filter((k) => k.courseIds.includes(c.parentId!))
        return parentKps.map((k) => ({ source: k.id, target: c.id }))
      }),
  ]

  const sharedProps = {
    nodes: graphNodes,
    edges: graphEdges,
    compact: true,
    className: 'flex-1 min-h-0',
    toolbarSlot: <ViewToggle mode={viewMode} onChange={setViewMode} />,
    nodeLabels: { domain: '能力领域', unit: '能力单元' },
    role,
  }

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden">
      {viewMode === 'static' ? (
        <KnowledgeGraphView {...sharedProps} title="知识图谱" description="岗位→能力领域→能力单元→知识点→教材课件的完整关联网络" />
      ) : (
        <KnowledgeGraphD3View {...sharedProps} title="知识图谱" description="岗位→能力领域→能力单元→知识点→教材课件的完整关联网络" />
      )}
    </div>
  )
}
