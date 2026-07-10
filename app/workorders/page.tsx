'use client'

import { useMemo, useState } from 'react'
import {
  Search,
  Package,
  Layers,
  RefreshCw,
  Settings2,
  Eye,
  Calendar,
  User,
} from 'lucide-react'
import { toast } from 'sonner'
import { getMockData } from '@/lib/mock-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PageHeader, StatCard } from '@/components/dashboard-kit'
import type { WorkorderSyncRecord, CapabilityDomain, AssessmentConfig } from '@/lib/types'

type DomainType = '计量采集装置新装' | '计量采集装置更换' | '计量采集装置拆除' | '计量采集装置普查'

const TYPE_COLORS: Record<DomainType, string> = {
  '计量采集装置新装': 'bg-green-100 text-green-700 border-green-200',
  '计量采集装置更换': 'bg-blue-100 text-blue-700 border-blue-200',
  '计量采集装置拆除': 'bg-orange-100 text-orange-700 border-orange-200',
  '计量采集装置普查': 'bg-purple-100 text-purple-700 border-purple-200',
}

const DIM_COLORS: Record<string, { bg: string; text: string }> = {
  '数量': { bg: 'bg-blue-50', text: 'text-blue-600' },
  '质量': { bg: 'bg-amber-50', text: 'text-amber-600' },
  '安全': { bg: 'bg-red-50', text: 'text-red-600' },
  '规范': { bg: 'bg-purple-50', text: 'text-purple-600' },
  '效率': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
}

export default function WorkordersPage() {
  const mockData = getMockData()
  const capabilityDomains = mockData.capabilityDomains
  const capabilityUnits = mockData.capabilityUnits
  const knowledgePoints = mockData.knowledgePoints

  const [query, setQuery] = useState('')
  const [syncHint, setSyncHint] = useState('')
  const [syncRecords, setSyncRecords] = useState<WorkorderSyncRecord[]>(() =>
    getMockData().workorderRecords.map((r, i) => ({
      id: `sync-${i}`,
      domainId: r.workorderId,
      date: r.date,
      studentName: '李四',
      department: '计量二班',
      dimensionScores: r.dimensionScore,
      status: (['正常', '异常', '待审核'] as const)[i % 3],
    }))
  )
  const [detailDomain, setDetailDomain] = useState<CapabilityDomain | null>(null)
  const [kpDialogOpen, setKpDialogOpen] = useState(false)
  const [detailTab, setDetailTab] = useState('detail')

  const filtered = useMemo(
    () => capabilityDomains.filter(
      (d) => d.name.includes(query) || d.code.includes(query) || d.type.includes(query) || d.batchGroup.includes(query)
    ),
    [capabilityDomains, query]
  )

  const stats = useMemo(() => ({
    total: capabilityDomains.length,
    install: capabilityDomains.filter((d) => d.type === '计量采集装置新装').length,
    replace: capabilityDomains.filter((d) => d.type === '计量采集装置更换').length,
    remove: capabilityDomains.filter((d) => d.type === '计量采集装置拆除').length,
    survey: capabilityDomains.filter((d) => d.type === '计量采集装置普查').length,
  }), [capabilityDomains])

  const domainSyncRecords = useMemo(
    () => detailDomain ? syncRecords.filter((r) => r.domainId === detailDomain.id) : [],
    [syncRecords, detailDomain]
  )

  const domainSyncStats = useMemo(() => {
    if (domainSyncRecords.length === 0) return null
    const sums: Record<string, number> = {}
    domainSyncRecords.forEach((r) => {
      Object.entries(r.dimensionScores).forEach(([k, v]) => {
        sums[k] = (sums[k] || 0) + v
      })
    })
    const avg: Record<string, number> = {}
    Object.entries(sums).forEach(([k, v]) => {
      avg[k] = Math.round(v / domainSyncRecords.length)
    })
    return avg
  }, [domainSyncRecords])

  function handleSync() {
    setSyncHint('正在同步数据...')
    window.setTimeout(() => {
      const records = getMockData().workorderRecords
      const transformed: WorkorderSyncRecord[] = records.map((r, i) => ({
        id: `sync-${i}`,
        domainId: r.workorderId,
        date: r.date,
        studentName: '李四',
        department: '计量二班',
        dimensionScores: r.dimensionScore,
        status: (['正常', '异常', '待审核'] as const)[i % 3],
      }))
      setSyncRecords(transformed)
      setSyncHint(`已同步 ${transformed.length} 条工单执行记录`)
      window.setTimeout(() => setSyncHint(''), 3000)
    }, 800)
  }

  const associatedKPIds = useMemo(() => {
    if (!detailDomain) return new Set<string>()
    return new Set(
      capabilityUnits
        .filter((u) => detailDomain.unitIds.includes(u.id))
        .flatMap((u) => u.knowledgeIds)
    )
  }, [detailDomain, capabilityUnits])

  const domainAssessmentConfig = useMemo(() => {
    if (!detailDomain) return null
    const firstUnit = capabilityUnits.find((u) => detailDomain.unitIds.includes(u.id))
    return firstUnit?.assessmentConfig ?? null
  }, [detailDomain, capabilityUnits])

  const allKnowledgePoints = useMemo(() => knowledgePoints, [knowledgePoints])
  const [kpSelections, setKpSelections] = useState<Set<string>>(new Set())

  function openKpDialog() {
    setKpSelections(new Set(associatedKPIds))
    setKpDialogOpen(true)
  }

  function toggleKp(kpId: string) {
    const next = new Set(kpSelections)
    if (next.has(kpId)) next.delete(kpId)
    else next.add(kpId)
    setKpSelections(next)
  }

  function saveKpAssociations() {
    const toAdd: string[] = []
    const toRemove: string[] = []
    allKnowledgePoints.forEach((kp) => {
      if (kpSelections.has(kp.id) && !associatedKPIds.has(kp.id)) toAdd.push(kp.id)
      if (!kpSelections.has(kp.id) && associatedKPIds.has(kp.id)) toRemove.push(kp.id)
    })
    detailDomain?.unitIds.forEach((uid) => {
      const unit = capabilityUnits.find((u) => u.id === uid)
      if (unit) {
        unit.knowledgeIds = unit.knowledgeIds.filter((id) => !toRemove.includes(id))
        unit.knowledgeIds = Array.from(new Set([...unit.knowledgeIds, ...toAdd]))
      }
    })
    toast.success('知识点关联已更新')
    setKpDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="工单系统对接"
        desc="能力领域数据（对接工单系统）。能力领域通过一键同步从工单系统拉取最新数据。"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard value={stats.total} label="能力领域总数" tone="blue" icon={<Package className="size-7" />} />
        <StatCard value={stats.install} label="新装" tone="green" icon={<Layers className="size-7" />} />
        <StatCard value={stats.replace} label="更换" tone="cyan" icon={<RefreshCw className="size-7" />} />
        <StatCard value={stats.remove} label="拆除" tone="amber" icon={<Layers className="size-7" />} />
        <StatCard value={stats.survey} label="普查" tone="purple" icon={<Layers className="size-7" />} />
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索名称、编码、类型、批次"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="shrink-0 gap-2" onClick={handleSync}>
                <RefreshCw className={`size-4 ${syncHint ? 'animate-spin' : ''}`} />
                同步
              </Button>
            </div>
            {syncHint && <span className="text-xs text-muted-foreground">{syncHint}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">同步工单列表</CardTitle>
          <CardDescription>共 {filtered.length} 个工单</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>编码</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>批次</TableHead>
                  <TableHead>作业时长</TableHead>
                  <TableHead>关联单元</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((d) => (
                  <TableRow key={d.id} className="cursor-pointer" onClick={() => setDetailDomain(d)}>
                    <TableCell className="font-medium">{d.name}</TableCell>
                    <TableCell className="font-mono text-xs">{d.code}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn('text-[10px]', TYPE_COLORS[d.type])}>
                        {d.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{d.batchGroup || '-'}</TableCell>
                    <TableCell className="text-xs">{d.standardDuration}</TableCell>
                    <TableCell className="text-xs">{d.unitIds.length} 个</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setDetailDomain(d) }}>
                        <Eye className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">没有匹配的能力领域</div>
          )}
        </CardContent>
      </Card>

      {/* 详情弹窗 */}
      <Dialog open={!!detailDomain} onOpenChange={(o) => { if (!o) { setDetailDomain(null); setDetailTab('detail') } }}>
        <DialogContent className="max-w-xl sm:max-w-xl max-h-[85vh]">
          <DialogHeader>
            <div className="flex items-start justify-between gap-2">
              <div>
                <DialogTitle>{detailDomain?.name}</DialogTitle>
                <DialogDescription>{detailDomain?.code}</DialogDescription>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 gap-1" onClick={openKpDialog}>
                <Settings2 className="size-3.5" /> 管理关联
              </Button>
            </div>
          </DialogHeader>
          {detailDomain && (
            <Tabs value={detailTab} onValueChange={setDetailTab}>
              <TabsList className="w-full">
                <TabsTrigger value="detail" className="flex-1">详情</TabsTrigger>
                <TabsTrigger value="syncData" className="flex-1">同步数据</TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 max-h-[60vh]">
              <TabsContent value="detail" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">编码</div>
                  <div className="font-medium text-right">{detailDomain.code}</div>
                  <div className="text-muted-foreground">类型</div>
                  <div className="text-right">
                    <Badge variant="outline" className={cn(TYPE_COLORS[detailDomain.type])}>{detailDomain.type}</Badge>
                  </div>
                  <div className="text-muted-foreground">批次分组</div>
                  <div className="font-medium text-right">{detailDomain.batchGroup || '未设置'}</div>
                  <div className="text-muted-foreground">标准作业时长</div>
                  <div className="font-medium text-right">{detailDomain.standardDuration}</div>
                  <div className="text-muted-foreground">创建人</div>
                  <div className="font-medium text-right">{detailDomain.creator}</div>
                  <div className="text-muted-foreground">创建时间</div>
                  <div className="font-medium text-right">{detailDomain.createTime}</div>
                  <div className="text-muted-foreground">版本</div>
                  <div className="font-medium text-right">v{detailDomain.version}</div>
                </div>

                <Separator />

                <div>
                  <div className="mb-1.5 text-sm font-medium">关联能力单元</div>
                  <div className="flex flex-wrap gap-1">
                    {detailDomain.unitIds.map((uid) => {
                      const unit = capabilityUnits.find((u) => u.id === uid)
                      return unit ? (
                        <Badge key={uid} variant="secondary" className="text-xs">
                          {unit.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </div>

                <Separator />

                <div>
                  <div className="mb-1.5 text-sm font-medium">任务描述</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{detailDomain.taskDescription}</p>
                </div>

                <Separator />

                {domainAssessmentConfig && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">考核标准</div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">工作量</h4>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-1 text-left font-medium">任务名称</th>
                                <th className="px-2 py-1 text-left font-medium">单位</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domainAssessmentConfig.workload.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-2 py-1">{row.workorderTaskName}</td>
                                  <td className="px-2 py-1">{row.unit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">质量标准</h4>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-1 text-left font-medium">任务名称</th>
                                <th className="px-2 py-1 text-right font-medium">基础积分</th>
                                <th className="px-2 py-1 text-left font-medium">质量问题类型</th>
                                <th className="px-2 py-1 text-left font-medium">质量问题项及扣分值</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domainAssessmentConfig.quality.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-2 py-1">{row.workorderTaskName}</td>
                                  <td className="px-2 py-1 text-right">{row.baseScore}</td>
                                  <td className="px-2 py-1">{row.issueType}</td>
                                  <td className="px-2 py-1">{row.issueItems}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">效率</h4>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-1 text-left font-medium">任务名称</th>
                                <th className="px-2 py-1 text-left font-medium">处理效率</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domainAssessmentConfig.efficiency.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-2 py-1">{row.workorderTaskName}</td>
                                  <td className="px-2 py-1">{row.processingTime}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">规范性</h4>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-1 text-left font-medium">任务名称</th>
                                <th className="px-2 py-1 text-right font-medium">设备问题（20%）</th>
                                <th className="px-2 py-1 text-right font-medium">工器具问题（20%）</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domainAssessmentConfig.compliance.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-2 py-1">{row.workorderTaskName}</td>
                                  <td className="px-2 py-1 text-right">{row.equipmentIssue}</td>
                                  <td className="px-2 py-1 text-right">{row.toolIssue}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      <div>
                        <h4 className="mb-1 text-xs font-semibold text-muted-foreground uppercase">安全性</h4>
                        <div className="overflow-x-auto rounded-lg border">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b bg-muted/50">
                                <th className="px-2 py-1 text-left font-medium">任务名称</th>
                                <th className="px-2 py-1 text-left font-medium">类型</th>
                                <th className="px-2 py-1 text-left font-medium">问题等级</th>
                                <th className="px-2 py-1 text-left font-medium">扣分</th>
                              </tr>
                            </thead>
                            <tbody>
                              {domainAssessmentConfig.safety.map((row, i) => (
                                <tr key={i} className="border-b last:border-0">
                                  <td className="px-2 py-1">{row.workorderTaskName}</td>
                                  <td className="px-2 py-1">{row.type}</td>
                                  <td className="px-2 py-1">{row.level}</td>
                                  <td className="px-2 py-1">{row.deduction}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm font-medium">关联知识点</span>
                    <Button size="sm" variant="ghost" className="h-auto gap-1 px-2 py-0.5 text-[11px]" onClick={openKpDialog}>
                      <Settings2 className="size-3" /> 管理
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {associatedKPIds.size === 0 ? (
                      <span className="text-xs text-muted-foreground">暂未关联知识点</span>
                    ) : (
                      Array.from(associatedKPIds).map((kpId) => {
                        const kp = knowledgePoints.find((k) => k.id === kpId)
                        return kp ? (
                          <Badge key={kpId} variant="secondary" className="text-xs">
                            {kp.name}
                          </Badge>
                        ) : null
                      })
                    )}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="syncData" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">共 {domainSyncRecords.length} 条执行记录</span>
                  {domainSyncStats && (
                    <div className="flex gap-2">
                      {Object.entries(domainSyncStats).map(([k, v]) => (
                        <Badge key={k} variant="outline" className={cn('text-[10px]', DIM_COLORS[k]?.bg, DIM_COLORS[k]?.text)}>
                          {k} {v}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="overflow-auto rounded-md border max-h-72">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="px-2 py-1.5 text-left font-medium">日期</th>
                        <th className="px-2 py-1.5 text-left font-medium">学员</th>
                        <th className="px-2 py-1.5 text-left font-medium">班组</th>
                        {['数量', '质量', '安全', '规范', '效率'].map((d) => (
                          <th key={d} className="px-2 py-1.5 text-right font-medium">{d}</th>
                        ))}
                        <th className="px-2 py-1.5 text-right font-medium">状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {domainSyncRecords.map((r, i) => (
                        <tr key={i} className="border-b last:border-0">
                          <td className="px-2 py-1 font-mono">{r.date}</td>
                          <td className="px-2 py-1">{r.studentName}</td>
                          <td className="px-2 py-1">{r.department}</td>
                          {['数量', '质量', '安全', '规范', '效率'].map((d) => (
                            <td key={d} className="px-2 py-1 text-right font-medium">{r.dimensionScores[d] ?? '-'}</td>
                          ))}
                          <td className="px-2 py-1 text-right">{r.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {domainSyncRecords.length === 0 && (
                  <div className="py-8 text-center text-sm text-muted-foreground">暂无同步数据，请先点击「同步」按钮</div>
                )}
              </TabsContent>
              </ScrollArea>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* 知识关联弹窗 */}
      <Dialog open={kpDialogOpen} onOpenChange={setKpDialogOpen}>
        <DialogContent className="max-w-xl sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>管理关联知识点</DialogTitle>
            <DialogDescription>
              {detailDomain?.name} - 勾选要关联的知识点，取消勾选则解除关联
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            <div className="space-y-1 pr-4">
              {allKnowledgePoints.map((kp) => {
                const sel = kpSelections.has(kp.id)
                return (
                  <button
                    key={kp.id}
                    type="button"
                    onClick={() => toggleKp(kp.id)}
                    className={cn(
                      'flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors',
                      sel ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-muted'
                    )}
                  >
                    <span className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold transition-colors',
                      sel ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-muted-foreground/30'
                    )}>
                      {sel ? '✓' : ''}
                    </span>
                    <span className="text-sm">{kp.name}</span>
                    <span className="ml-auto font-mono text-[11px] text-muted-foreground">{kp.code}</span>
                  </button>
                )
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setKpDialogOpen(false)}>取消</Button>
            <Button onClick={saveKpAssociations}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
