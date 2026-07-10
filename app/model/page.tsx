'use client'

import { useMemo, useState } from 'react'
import {
  Briefcase,
  Layers,
  Blocks,
  Plus,
  Search,
  Building2,
  Pencil,
  Trash2,
  BookOpen,
  Package,
  Link2,
  ChevronRight,
} from 'lucide-react'
import { getMockData } from '@/lib/mock-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/dashboard-kit'
import type {
  Position,
  CapabilityDomain,
  CapabilityUnit,
  AssessmentConfig,
  KnowledgePoint,
} from '@/lib/types'

function generateId(prefix: string, items: { id: string }[]) {
  const max = items.reduce((acc, item) => {
    const num = parseInt(item.id.replace(prefix, ''), 10)
    return Number.isNaN(num) ? acc : Math.max(acc, num)
  }, 0)
  return `${prefix}${max + 1}`
}

function generateCode(prefix: string, items: { code: string }[]) {
  const max = items.reduce((acc, item) => {
    const match = item.code.match(/\d+$/)
    return match ? Math.max(acc, parseInt(match[0], 10)) : acc
  }, 0)
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

export default function ModelPage() {
  const {
    positions: initialPositions,
    knowledgePoints: initialKnowledgePoints,
    capabilityDomains: initialDomains,
  } = getMockData()

  const [positions, setPositions] = useState<Position[]>(initialPositions)
  const [domains, setDomains] = useState<CapabilityDomain[]>(initialDomains)
  const [units, setUnits] = useState<CapabilityUnit[]>(getMockData().capabilityUnits)
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>(initialKnowledgePoints)

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(positions[0] ?? null)
  const [selectedDomain, setSelectedDomain] = useState<CapabilityDomain | null>(domains[0] ?? null)
  const [selectedUnit, setSelectedUnit] = useState<CapabilityUnit | null>(units[0] ?? null)

  const [positionQuery, setPositionQuery] = useState('')
  const [domainQuery, setDomainQuery] = useState('')
  const [unitQuery, setUnitQuery] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'position' | 'domain' | 'unit' | null>(null)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [dialogFormKey, setDialogFormKey] = useState(0)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteType, setDeleteType] = useState<'position' | 'domain' | 'unit' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false)
  const [knowledgeDialogQuery, setKnowledgeDialogQuery] = useState('')

  const [posDomainDialogOpen, setPosDomainDialogOpen] = useState(false)
  const [posDomainDialogQuery, setPosDomainDialogQuery] = useState('')

  const [positionForm, setPositionForm] = useState({ name: '', code: '' })
  const [domainForm, setDomainForm] = useState({ name: '', code: '', positionId: '' })
  const [unitForm, setUnitForm] = useState<{
    name: string
    code: string
    domainId: string
  }>({
    name: '',
    code: '',
    domainId: '',
  })

  const filteredPositions = positions.filter(
    (p) => p.name.includes(positionQuery) || p.code.includes(positionQuery)
  )
  const filteredDomains = domains.filter(
    (d) => d.name.includes(domainQuery) || d.code.includes(domainQuery)
  )
  const filteredUnits = units.filter(
    (u) => u.name.includes(unitQuery) || u.code.includes(unitQuery)
  )

  const groupedUnits = useMemo(() => {
    const map = new Map<string, CapabilityUnit[]>()
    filteredUnits.forEach((u) => {
      const domainId = u.domainId
      if (!map.has(domainId)) map.set(domainId, [])
      map.get(domainId)!.push(u)
    })
    // Sort by domain code for consistent ordering
    const sortedDomainIds = Array.from(map.keys()).sort((a, b) => {
      const da = domains.find((d) => d.id === a)
      const db = domains.find((d) => d.id === b)
      return (da?.code ?? '').localeCompare(db?.code ?? '')
    })
    return sortedDomainIds.map((domainId) => ({
      domain: domains.find((d) => d.id === domainId)!,
      units: map.get(domainId)!,
    }))
  }, [filteredUnits, domains])

  const positionDomains = useMemo(
    () => domains.filter((d) => d.positionId === selectedPosition?.id),
    [domains, selectedPosition]
  )

  const domainUnits = useMemo(
    () => (selectedDomain ? units.filter((u) => u.domainId === selectedDomain.id) : []),
    [units, selectedDomain]
  )

  function openCreate(type: 'position' | 'domain' | 'unit') {
    setDialogType(type)
    setDialogMode('create')
    setEditingId(null)
    if (type === 'position') {
      setPositionForm({ name: '', code: generateCode('POS', positions) })
    } else if (type === 'domain') {
      setDomainForm({ name: '', code: generateCode('CD', domains), positionId: positions[0]?.id ?? '' })
    } else {
      setUnitForm({
        name: '',
        code: generateCode('CU', units),
        domainId: domains[0]?.id ?? '',
      })
    }
    setDialogFormKey(k => k + 1)
    setDialogOpen(true)
  }

  function openEdit(type: 'position' | 'domain' | 'unit', item: Position | CapabilityDomain | CapabilityUnit) {
    setDialogType(type)
    setDialogMode('edit')
    setEditingId(item.id)
    if (type === 'position') {
      const p = item as Position
      setPositionForm({ name: p.name, code: p.code })
    } else if (type === 'domain') {
      const d = item as CapabilityDomain
      setDomainForm({ name: d.name, code: d.code, positionId: d.positionId })
    } else {
      const u = item as CapabilityUnit
      setUnitForm({
        name: u.name,
        code: u.code,
        domainId: u.domainId,
      })
    }
    setDialogFormKey(k => k + 1)
    setDialogOpen(true)
  }

  function handleSave() {
    if (!dialogType) return
    if (dialogType === 'position') {
      if (!positionForm.name.trim() || !positionForm.code.trim()) return
      if (dialogMode === 'create') {
        const newPos: Position = { id: generateId('pos', positions), name: positionForm.name.trim(), code: positionForm.code.trim() }
        setPositions((prev) => [...prev, newPos])
        setSelectedPosition(newPos)
      } else if (editingId) {
        setPositions((prev) => prev.map((p) => (p.id === editingId ? { ...p, name: positionForm.name.trim(), code: positionForm.code.trim() } : p)))
      }
    } else if (dialogType === 'domain') {
      if (!domainForm.name.trim() || !domainForm.code.trim() || !domainForm.positionId) return
      if (dialogMode === 'create') {
        const newDomain: CapabilityDomain = {
          id: generateId('cd', domains),
          name: domainForm.name.trim(),
          code: domainForm.code.trim(),
          positionId: domainForm.positionId,
          unitIds: [],
          taskDescription: '',
          standardDuration: '',
          riskDeductionRules: '',
          scoreRules: '',
          type: '计量采集装置新装',
          batchGroup: '',
          creator: '',
          createTime: new Date().toISOString().slice(0, 10),
          version: 1,
        }
        setDomains((prev) => [...prev, newDomain])
        setSelectedDomain(newDomain)
      } else if (editingId) {
        setDomains((prev) => prev.map((d) => (d.id === editingId ? { ...d, name: domainForm.name.trim(), code: domainForm.code.trim(), positionId: domainForm.positionId } : d)))
      }
    } else if (dialogType === 'unit') {
      if (!unitForm.name.trim() || !unitForm.code.trim() || !unitForm.domainId) return
      if (dialogMode === 'create') {
        const newUnit: CapabilityUnit = {
          id: generateId('cu', units),
          name: unitForm.name.trim(),
          code: unitForm.code.trim(),
          domainId: unitForm.domainId,
          knowledgeIds: [],
          baseline: 75,
          assessmentConfig: generateDefaultAssessmentConfig(unitForm.name.trim()),
        }
        setUnits((prev) => [...prev, newUnit])
        setSelectedUnit(newUnit)
      } else if (editingId) {
        setUnits((prev) =>
          prev.map((u) =>
            u.id === editingId
              ? {
                  ...u,
                  name: unitForm.name.trim(),
                  code: unitForm.code.trim(),
                  domainId: unitForm.domainId,
                }
              : u
          )
        )
      }
    }
    setDialogOpen(false)
  }

  function confirmDelete(type: 'position' | 'domain' | 'unit', id: string) {
    setDeleteType(type)
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function handleDelete() {
    if (!deleteType || !deleteId) return
    if (deleteType === 'position') {
      setPositions((prev) => {
        const next = prev.filter((p) => p.id !== deleteId)
        if (selectedPosition?.id === deleteId) setSelectedPosition(next[0] ?? null)
        return next
      })
      setDomains((prev) => prev.filter((d) => d.positionId !== deleteId))
      setUnits((prev) => prev.filter((u) => !domains.find((d) => d.id === u.domainId && d.positionId === deleteId)))
    } else if (deleteType === 'domain') {
      setDomains((prev) => {
        const next = prev.filter((d) => d.id !== deleteId)
        if (selectedDomain?.id === deleteId) setSelectedDomain(next[0] ?? null)
        return next
      })
      setUnits((prev) => prev.filter((u) => u.domainId !== deleteId))
    } else if (deleteType === 'unit') {
      setUnits((prev) => {
        const next = prev.filter((u) => u.id !== deleteId)
        if (selectedUnit?.id === deleteId) setSelectedUnit(next[0] ?? null)
        return next
      })
    }
    setDeleteDialogOpen(false)
  }

  function toggleKnowledgeForUnit(knowledgeId: string, unitId: string) {
    setUnits((prev) =>
      prev.map((u) => {
        if (u.id !== unitId) return u
        const associated = u.knowledgeIds.includes(knowledgeId)
        return {
          ...u,
          knowledgeIds: associated ? u.knowledgeIds.filter((id) => id !== knowledgeId) : [...u.knowledgeIds, knowledgeId],
        }
      })
    )
    setKnowledgePoints((prev) =>
      prev.map((k) => {
        if (k.id !== knowledgeId) return k
        const associated = k.capabilityUnitIds.includes(unitId)
        return {
          ...k,
          capabilityUnitIds: associated ? k.capabilityUnitIds.filter((id) => id !== unitId) : [...k.capabilityUnitIds, unitId],
        }
      })
    )
  }

  function toggleDomainForPosition(domainId: string, positionId: string) {
    setDomains((prev) =>
      prev.map((d) => {
        if (d.id !== domainId) return d
        return { ...d, positionId: d.positionId === positionId ? '' : positionId }
      })
    )
  }

  function generateDefaultAssessmentConfig(workorderName: string): AssessmentConfig {
    return {
      workload: [
        { workorderTaskName: '计量采集装置新装', unit: '设备数/只' },
        { workorderTaskName: '计量采集装置更换', unit: '设备数/只' },
        { workorderTaskName: '计量采集装置拆除', unit: '设备数/只' },
      ],
      quality: [
        { workorderTaskName: workorderName, baseScore: 4, issueType: '接线错误', issueItems: '1.接线错误，扣1.6分；' },
        { workorderTaskName: workorderName, baseScore: 4, issueType: '安装工艺不规范', issueItems: '2.安装工艺不规范，扣0.8分；' },
        { workorderTaskName: workorderName, baseScore: 4, issueType: '表计安装串户', issueItems: '3.表计安装串户，扣1.6分；' },
        { workorderTaskName: workorderName, baseScore: 4, issueType: '新装后采集失败', issueItems: '4.新装后采集失败，扣0.8分；' },
      ],
      efficiency: [{ workorderTaskName: workorderName, processingTime: '3天' }],
      compliance: [
        { workorderTaskName: workorderName, equipmentIssue: 'nan', toolIssue: 'nan' },
        { workorderTaskName: workorderName, equipmentIssue: 'nan', toolIssue: 'nan' },
        { workorderTaskName: workorderName, equipmentIssue: 'nan', toolIssue: 'nan' },
        { workorderTaskName: workorderName, equipmentIssue: 'nan', toolIssue: 'nan' },
      ],
      safety: [
        { workorderTaskName: workorderName, type: '安全问题', level: '安全问题', deduction: '1' },
        { workorderTaskName: workorderName, type: '安全问题', level: '一般违章', deduction: '10' },
        { workorderTaskName: workorderName, type: '安全问题', level: '严重违章', deduction: '扣当月全部积分或100分' },
        { workorderTaskName: workorderName, type: '服务问题', level: '有责诉求', deduction: '3' },
        { workorderTaskName: workorderName, type: '服务问题', level: '三类过错', deduction: '50' },
        { workorderTaskName: workorderName, type: '服务问题', level: '二类过错', deduction: '80' },
        { workorderTaskName: workorderName, type: '服务问题', level: '一类过错', deduction: '100' },
        { workorderTaskName: workorderName, type: '服务问题', level: '4类事件', deduction: '扣当月全部积分或100分' },
        { workorderTaskName: workorderName, type: '廉政问题', level: '廉政问题', deduction: '100' },
      ],
    }
  }

  function renderDialogFields() {
    if (dialogType === 'position') {
      return (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">岗位名称</label>
            <Input value={positionForm.name} onChange={(e) => setPositionForm({ ...positionForm, name: e.target.value })} placeholder="请输入岗位名称" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">岗位编码</label>
            <Input value={positionForm.code} onChange={(e) => setPositionForm({ ...positionForm, code: e.target.value })} placeholder="请输入岗位编码" />
          </div>
        </div>
      )
    }
    if (dialogType === 'domain') {
      return (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium">能力领域名称</label>
            <Input value={domainForm.name} onChange={(e) => setDomainForm({ ...domainForm, name: e.target.value })} placeholder="请输入能力领域名称" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">能力领域编码</label>
            <Input value={domainForm.code} onChange={(e) => setDomainForm({ ...domainForm, code: e.target.value })} placeholder="请输入能力领域编码" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">所属岗位</label>
            <Select value={domainForm.positionId} onValueChange={(v) => setDomainForm({ ...domainForm, positionId: v ?? '' })}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="选择岗位">
                  {positions.find(p => p.id === domainForm.positionId)?.name}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {positions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    }
    return (
      <div className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm font-medium">所属能力领域</label>
          <Select value={unitForm.domainId} onValueChange={(v) => setUnitForm({ ...unitForm, domainId: v ?? '' })}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择能力领域">
                {domains.find(d => d.id === unitForm.domainId)?.name}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {domains.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <label className="text-sm font-medium">能力单元名称</label>
          <Input value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} placeholder="请输入能力单元名称" />
        </div>
      </div>
    )
  }

  function renderAssessmentConfig(config: AssessmentConfig) {
    return (
      <div className="space-y-4">
        {/* 工作量 */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">工作量</h4>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">任务名称</th>
                  <th className="px-3 py-1.5 text-left font-medium">单位</th>
                </tr>
              </thead>
              <tbody>
                {config.workload.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{row.workorderTaskName}</td>
                    <td className="px-3 py-1.5">{row.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 质量标准 */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">质量标准</h4>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">任务名称</th>
                  <th className="px-3 py-1.5 text-right font-medium">基础积分</th>
                  <th className="px-3 py-1.5 text-left font-medium">质量问题类型</th>
                  <th className="px-3 py-1.5 text-left font-medium">质量问题项及扣分值</th>
                </tr>
              </thead>
              <tbody>
                {config.quality.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{row.workorderTaskName}</td>
                    <td className="px-3 py-1.5 text-right">{row.baseScore}</td>
                    <td className="px-3 py-1.5">{row.issueType}</td>
                    <td className="px-3 py-1.5">{row.issueItems}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 效率 */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">效率</h4>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">任务名称</th>
                  <th className="px-3 py-1.5 text-left font-medium">处理效率</th>
                </tr>
              </thead>
              <tbody>
                {config.efficiency.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{row.workorderTaskName}</td>
                    <td className="px-3 py-1.5">{row.processingTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 规范性 */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">规范性</h4>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                  <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">任务名称</th>
                  <th className="px-3 py-1.5 text-right font-medium">设备问题（20%）<br /><span className="font-normal text-muted-foreground">（问题纳入当月评价）</span></th>
                  <th className="px-3 py-1.5 text-right font-medium">工器具问题（20%）<br /><span className="font-normal text-muted-foreground">（应用未使用）</span></th>
                </tr>
              </thead>
              <tbody>
                {config.compliance.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{row.workorderTaskName}</td>
                    <td className="px-3 py-1.5 text-right">{row.equipmentIssue}</td>
                    <td className="px-3 py-1.5 text-right">{row.toolIssue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 安全性 */}
        <div>
          <h4 className="mb-1.5 text-xs font-semibold text-muted-foreground uppercase">安全性</h4>
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-1.5 text-left font-medium">任务名称</th>
                  <th className="px-3 py-1.5 text-left font-medium">类型</th>
                  <th className="px-3 py-1.5 text-left font-medium">问题等级</th>
                  <th className="px-3 py-1.5 text-left font-medium">扣分</th>
                </tr>
              </thead>
              <tbody>
                {config.safety.map((row, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="px-3 py-1.5">{row.workorderTaskName}</td>
                    <td className="px-3 py-1.5">{row.type}</td>
                    <td className="px-3 py-1.5">{row.level}</td>
                    <td className="px-3 py-1.5">{row.deduction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  const selectedUnitDomain = selectedUnit ? domains.find((d) => d.id === selectedUnit.domainId) : null
  const selectedUnitPosition = selectedUnitDomain ? positions.find((p) => p.id === selectedUnitDomain.positionId) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="能力诊断模型管理"
        desc="按岗位 → 能力领域 → 能力单元进行建模，配置五维考核标准，并关联知识点。"
      />

      <Tabs defaultValue="positions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-[500px]">
          <TabsTrigger value="positions" className="gap-2">
            <Briefcase className="size-4" /> 岗位
          </TabsTrigger>
          <TabsTrigger value="domains" className="gap-2">
            <Layers className="size-4" /> 能力领域
          </TabsTrigger>
          <TabsTrigger value="units" className="gap-2">
            <Blocks className="size-4" /> 能力单元
          </TabsTrigger>
        </TabsList>

        {/* 岗位管理 */}
        <TabsContent value="positions" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">岗位列表</CardTitle>
                    <CardDescription>选择岗位查看关联的能力领域</CardDescription>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => openCreate('position')}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索岗位名称或编码"
                    className="pl-9"
                    value={positionQuery}
                    onChange={(e) => setPositionQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredPositions.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPosition(p)}
                    className={cn(
                      'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      selectedPosition?.id === p.id
                        ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.code}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {selectedPosition ? selectedPosition.name : '请选择岗位'}
                    </CardTitle>
                    <CardDescription>该岗位下关联的能力领域</CardDescription>
                  </div>
                  {selectedPosition && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit('position', selectedPosition)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirmDelete('position', selectedPosition.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedPosition ? (
                  <>
                    <div className="flex items-center gap-4 rounded-lg bg-muted/50 p-3 text-sm">
                      <Building2 className="size-5 text-primary" />
                      <div>
                        <div className="font-medium">{selectedPosition.name}</div>
                        <div className="text-muted-foreground">{selectedPosition.code}</div>
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-medium">关联能力领域</h3>
                        <Button size="sm" className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm" onClick={() => { setPosDomainDialogQuery(''); setPosDomainDialogOpen(true) }}>
                          管理关联
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {positionDomains.map((d) => (
                          <div
                            key={d.id}
                            className="flex items-center justify-between rounded-md border px-3 py-2"
                          >
                            <div>
                              <div className="text-sm font-medium">{d.name}</div>
                              <div className="text-xs text-muted-foreground">{d.code}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {units.filter((u) => u.domainId === d.id).length} 个能力单元
                            </Badge>
                          </div>
                        ))}
                        {positionDomains.length === 0 && (
                          <div className="text-sm text-muted-foreground">暂无关联能力领域</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    从左侧选择岗位查看详情
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 能力领域管理 */}
        <TabsContent value="domains" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">能力领域列表</CardTitle>
                    <CardDescription>选择能力领域查看关联的能力单元</CardDescription>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => openCreate('domain')}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索领域名称或编码"
                    className="pl-9"
                    value={domainQuery}
                    onChange={(e) => setDomainQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {filteredDomains.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDomain(d)}
                    className={cn(
                      'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                      selectedDomain?.id === d.id
                        ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                        : 'hover:bg-muted'
                    )}
                  >
                    <div className="font-medium">{d.name}</div>
                    <div className="text-xs text-muted-foreground">{d.code}</div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {selectedDomain ? selectedDomain.name : '请选择能力领域'}
                    </CardTitle>
                    <CardDescription>能力领域关联的岗位与能力单元</CardDescription>
                  </div>
                  {selectedDomain && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit('domain', selectedDomain)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirmDelete('domain', selectedDomain.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDomain ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">所属岗位</div>
                        <div className="font-medium">
                          {positions.find((p) => p.id === selectedDomain.positionId)?.name || '未分配'}
                        </div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">领域编码</div>
                        <div className="font-medium">{selectedDomain.code}</div>
                      </div>
                      {selectedDomain.taskDescription && (
                        <div className="rounded-lg border p-3 sm:col-span-2">
                          <div className="text-xs text-muted-foreground">任务描述</div>
                          <div className="text-sm">{selectedDomain.taskDescription}</div>
                        </div>
                      )}
                    </div>
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-medium">关联能力单元</h3>
                      <div className="space-y-2">
                        {domainUnits.map((u) => (
                          <div key={u.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                            <div>
                              <div className="text-sm font-medium">{u.name}</div>
                              <div className="text-xs text-muted-foreground">{u.code}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">{u.knowledgeIds.length} 知识点</Badge>
                              <Badge variant="outline" className="text-xs">{(u.assessmentConfig.workload.length + u.assessmentConfig.quality.length + u.assessmentConfig.efficiency.length + u.assessmentConfig.compliance.length + u.assessmentConfig.safety.length)} 考核项</Badge>
                            </div>
                          </div>
                        ))}
                        {domainUnits.length === 0 && (
                          <div className="text-sm text-muted-foreground">暂无关联能力单元</div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    从左侧选择能力领域查看详情
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 能力单元管理 */}
        <TabsContent value="units" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">能力单元列表</CardTitle>
                    <CardDescription>选择单元查看详情与配置</CardDescription>
                  </div>
                  <Button size="icon" variant="outline" onClick={() => openCreate('unit')}>
                    <Plus className="size-4" />
                  </Button>
                </div>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                  <Input
                    placeholder="搜索单元名称或编码"
                    className="pl-9"
                    value={unitQuery}
                    onChange={(e) => setUnitQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {groupedUnits.length === 0 && (
                  <div className="py-4 text-center text-sm text-muted-foreground">暂无匹配能力单元</div>
                )}
                {groupedUnits.map(({ domain, units: groupUnits }) => (
                  <div key={domain.id}>
                    <div className="flex items-center gap-1 px-1 py-1.5">
                      <Layers className="size-3 text-muted-foreground" />
                      <span className="text-xs font-medium text-muted-foreground">{domain.name}</span>
                    </div>
                    {groupUnits.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => setSelectedUnit(u)}
                        className={cn(
                          'w-full rounded-md border px-3 py-2 text-left text-sm transition-colors',
                          selectedUnit?.id === u.id
                            ? 'border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                            : 'hover:bg-muted'
                        )}
                      >
                        <div className="font-medium">{u.name}</div>
                        <div className="text-xs text-muted-foreground">{u.code} · {domains.find(d => d.id === u.domainId)?.name || '—'}</div>
                      </button>
                    ))}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {selectedUnit ? selectedUnit.name : '请选择能力单元'}
                    </CardTitle>
                    <CardDescription>考核标准与知识点</CardDescription>
                  </div>
                  {selectedUnit && (
                    <div className="flex gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEdit('unit', selectedUnit)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirmDelete('unit', selectedUnit.id)}>
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedUnit ? (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">所属岗位</div>
                        <div className="font-medium">{selectedUnitPosition?.name || '—'}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">所属能力领域</div>
                        <div className="font-medium">{selectedUnitDomain?.name || '—'}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">能力单元编码</div>
                        <div className="font-medium">{selectedUnit.code}</div>
                      </div>
                      <div className="rounded-lg border p-3">
                        <div className="text-xs text-muted-foreground">考核标准</div>
                        <div className="font-medium">5 项</div>
                      </div>
                    </div>

                    {/* 所属能力领域信息 */}
                    {selectedUnitDomain && (
                      <>
                        <Separator />
                        <div>
                          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                            <Package className="size-4 text-primary" /> 所属能力领域
                          </div>
                          <div className="rounded-lg border p-3">
                            <div className="grid gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">领域名称</span>
                                <span className="font-medium">{selectedUnitDomain.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">领域编码</span>
                                <span className="font-medium">{selectedUnitDomain.code}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">领域类型</span>
                                <Badge variant="outline">{selectedUnitDomain.type}</Badge>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">标准作业时长</span>
                                <span>{selectedUnitDomain.standardDuration || '未设置'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">批次分组</span>
                                <span>{selectedUnitDomain.batchGroup || '未设置'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* 考核标准 */}
                    <Separator />
                    <div>
                      <h3 className="mb-2 text-sm font-medium">考核标准</h3>

                      {renderAssessmentConfig(selectedUnit.assessmentConfig)}
                    </div>

                    {/* 关联知识点 */}
                    <Separator />
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-medium">
                          关联知识点 ({selectedUnit.knowledgeIds.length} 个)
                        </h3>
                        <Button
                          size="sm"
                          className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm"
                          onClick={() => { setKnowledgeDialogQuery(''); setKnowledgeDialogOpen(true) }}
                        >
                          <BookOpen className="size-3.5 mr-1" /> 管理关联
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {knowledgePoints
                          .filter((k) => selectedUnit.knowledgeIds.includes(k.id))
                          .map((k) => (
                            <div
                              key={k.id}
                              className="flex items-center justify-between rounded-md border px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium">{k.name}</div>
                                <div className="text-xs text-muted-foreground">{k.code}</div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{k.level} 级知识点</Badge>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="size-7 text-destructive"
                                  onClick={() => toggleKnowledgeForUnit(k.id, selectedUnit.id)}
                                >
                                  <Trash2 className="size-3.5" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        {knowledgePoints.filter((k) => selectedUnit.knowledgeIds.includes(k.id))
                          .length === 0 && (
                          <div className="text-sm text-muted-foreground">暂无关联知识点</div>
                        )}
                      </div>
                    </div>

                    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                      能力单元本身不存储执行数据，评分来自学生实际执行记录与考核标准配置。
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    从左侧选择能力单元查看详情
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={dialogType === 'unit' ? '!max-w-[500px]' : ''}>
          <DialogHeader>
            <DialogTitle>
              {dialogMode === 'create'
                ? `新建${dialogType === 'position' ? '岗位' : dialogType === 'domain' ? '能力领域' : '能力单元'}`
                : `编辑${dialogType === 'position' ? '岗位' : dialogType === 'domain' ? '能力领域' : '能力单元'}`}
            </DialogTitle>
            <DialogDescription>
              {dialogType === 'position'
                ? '维护岗位名称与编码信息'
                : dialogType === 'domain'
                ? '维护能力领域信息，能力领域挂在岗位下'
                : '配置考核标准'}
            </DialogDescription>
          </DialogHeader>
          <div key={dialogFormKey}>{renderDialogFields()}</div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除后无法恢复，是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Position-Domain Association Dialog */}
      <Dialog open={posDomainDialogOpen} onOpenChange={setPosDomainDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关联能力领域</DialogTitle>
            <DialogDescription>
              为岗位「{selectedPosition?.name}」勾选需要关联的能力领域
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索能力领域"
                className="pl-9"
                value={posDomainDialogQuery}
                onChange={(e) => setPosDomainDialogQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-72 rounded-md border p-2">
              <div className="space-y-1">
                {domains
                  .filter(
                    (d) =>
                      d.name.includes(posDomainDialogQuery) || d.code.includes(posDomainDialogQuery)
                  )
                  .map((d) => {
                    const checked = d.positionId === selectedPosition?.id
                    return (
                      <label
                        key={d.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={checked}
                          onChange={() =>
                            selectedPosition && toggleDomainForPosition(d.id, selectedPosition.id)
                          }
                        />
                        <span className="text-sm">{d.name}</span>
                        <span className="text-xs text-muted-foreground">{d.code}</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {positions.find((p) => p.id === d.positionId)?.name || '未分配'}
                        </Badge>
                      </label>
                    )
                  })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button onClick={() => setPosDomainDialogOpen(false)}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Knowledge Point Association Dialog */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关联知识点</DialogTitle>
            <DialogDescription>
              为能力单元「{selectedUnit?.name}」勾选需要关联的知识点
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索知识点"
                className="pl-9"
                value={knowledgeDialogQuery}
                onChange={(e) => setKnowledgeDialogQuery(e.target.value)}
              />
            </div>
            <ScrollArea className="h-72 rounded-md border p-2">
              <div className="space-y-1">
                {knowledgePoints
                  .filter(
                    (k) =>
                      k.name.includes(knowledgeDialogQuery) || k.code.includes(knowledgeDialogQuery)
                  )
                  .map((k) => {
                    const checked = selectedUnit ? selectedUnit.knowledgeIds.includes(k.id) : false
                    return (
                      <label
                        key={k.id}
                        className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={checked}
                          onChange={() =>
                            selectedUnit && toggleKnowledgeForUnit(k.id, selectedUnit.id)
                          }
                        />
                        <span className="text-sm">{k.name}</span>
                        <span className="text-xs text-muted-foreground">{k.code}</span>
                        <Badge variant="outline" className="ml-auto text-[10px]">
                          {k.level} 级
                        </Badge>
                      </label>
                    )
                  })}
              </div>
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button onClick={() => setKnowledgeDialogOpen(false)}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
