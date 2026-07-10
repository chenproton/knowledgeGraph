'use client'

import { useMemo } from 'react'
import { ShieldCheck, CheckCircle2, AlertCircle, BookOpen, Target } from 'lucide-react'
import { getMockData, getPositionDomains, getUnitKnowledge, getUnitCourses } from '@/lib/mock-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PageHeader } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'

export default function CoveragePage() {
  const { positions, capabilityDomains, capabilityUnits, knowledgePoints, courses } = getMockData()

  const stats = useMemo(() => {
    const domainCovered = capabilityDomains.filter((d) => d.unitIds.length > 0).length
    const unitCovered = capabilityUnits.filter((u) =>
      knowledgePoints.some((k) => k.capabilityUnitIds.includes(u.id))
    ).length
    const knowledgeCovered = knowledgePoints.filter((k) => k.courseIds.length > 0).length
    return {
      domainTotal: capabilityDomains.length,
      domainCovered,
      domainRate: Math.round((domainCovered / (capabilityDomains.length || 1)) * 100),
      unitTotal: capabilityUnits.length,
      unitCovered,
      unitRate: Math.round((unitCovered / (capabilityUnits.length || 1)) * 100),
      knowledgeTotal: knowledgePoints.length,
      knowledgeCovered,
      knowledgeRate: Math.round((knowledgeCovered / (knowledgePoints.length || 1)) * 100),
      courseTotal: courses.length,
    }
  }, [capabilityDomains, capabilityUnits, knowledgePoints, courses])

  const positionCoverage = useMemo(() => {
    return positions.map((p) => {
      const posDomains = getPositionDomains(p.id)
      const covered = posDomains.filter((d) => d.unitIds.length > 0).length
      return {
        ...p,
        total: posDomains.length,
        covered,
        rate: Math.round((covered / (posDomains.length || 1)) * 100),
      }
    })
  }, [positions])

  const uncoveredDomains = useMemo(
    () => capabilityDomains.filter((d) => d.unitIds.length === 0),
    [capabilityDomains]
  )

  const uncoveredUnits = useMemo(
    () => capabilityUnits.filter((u) => !knowledgePoints.some((k) => k.capabilityUnitIds.includes(u.id))),
    [capabilityUnits, knowledgePoints]
  )

  return (
    <div className="space-y-6">
      <PageHeader title="覆盖分析" desc="监控能力领域、能力单元、知识点、教材课件的覆盖关系" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative overflow-hidden rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className={cn('text-2xl font-extrabold leading-none', stats.domainRate < 60 ? 'text-rose-600' : 'text-indigo-600')}>{stats.domainRate}%</div>
              <div className="mt-2 text-xs font-medium text-muted-foreground">能力领域覆盖率</div>
            </div>
            <ShieldCheck className="relative z-10 size-7 text-indigo-500" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{stats.domainCovered} / {stats.domainTotal}</p>
          <span className="pointer-events-none absolute -top-5 -right-5 size-16 rounded-full bg-indigo-300/50 blur-md" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className={cn('text-2xl font-extrabold leading-none', stats.unitRate < 60 ? 'text-rose-600' : 'text-purple-600')}>{stats.unitRate}%</div>
              <div className="mt-2 text-xs font-medium text-muted-foreground">能力单元覆盖率</div>
            </div>
            <Target className="relative z-10 size-7 text-purple-500" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{stats.unitCovered} / {stats.unitTotal}</p>
          <span className="pointer-events-none absolute -top-5 -right-5 size-16 rounded-full bg-purple-300/50 blur-md" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className={cn('text-2xl font-extrabold leading-none', stats.knowledgeRate < 60 ? 'text-rose-600' : 'text-emerald-600')}>{stats.knowledgeRate}%</div>
              <div className="mt-2 text-xs font-medium text-muted-foreground">知识点教材覆盖率</div>
            </div>
            <BookOpen className="relative z-10 size-7 text-emerald-500" />
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{stats.knowledgeCovered} / {stats.knowledgeTotal}</p>
          <span className="pointer-events-none absolute -top-5 -right-5 size-16 rounded-full bg-emerald-300/50 blur-md" />
        </div>
        <div className="relative overflow-hidden rounded-xl border border-cyan-100 bg-gradient-to-br from-cyan-50 to-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-2xl font-extrabold leading-none text-cyan-600">{stats.courseTotal}</div>
              <div className="mt-2 text-xs font-medium text-muted-foreground">教材课件总数</div>
            </div>
            <CheckCircle2 className="relative z-10 size-7 text-cyan-500" />
          </div>
          <span className="pointer-events-none absolute -top-5 -right-5 size-16 rounded-full bg-cyan-300/50 blur-md" />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">各岗位能力领域覆盖率</CardTitle>
            <CardDescription>按岗位统计能力领域与能力单元的关联情况</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {positionCoverage.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{p.name}</span>
                    <span className={cn('font-semibold', p.rate < 60 ? 'text-red-600' : 'text-emerald-600')}>
                      {p.rate}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', p.rate < 60 ? 'from-[#e89b3a] to-[#f3c069]' : 'from-[#27b08a] to-[#54cf9d]')}
                      style={{ width: `${p.rate}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    已覆盖 {p.covered} / {p.total} 个能力领域
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">未覆盖问题</CardTitle>
            <CardDescription>需要补充关联的能力领域和能力单元</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="mb-2 text-sm font-medium">未关联能力单元的能力领域</h3>
              {uncoveredDomains.length > 0 ? (
                <div className="space-y-2">
                  {uncoveredDomains.map((d) => (
                    <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="text-sm">{d.name}</div>
                      <Badge variant="destructive" className="text-xs">待补充</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">全部能力领域已关联能力单元</div>
              )}
            </div>
            <div>
              <h3 className="mb-2 text-sm font-medium">未关联知识点的能力单元</h3>
              {uncoveredUnits.length > 0 ? (
                <div className="space-y-2">
                  {uncoveredUnits.map((u) => (
                    <div key={u.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                      <div className="text-sm">{u.name}</div>
                      <Badge variant="destructive" className="text-xs">待补充</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">全部能力单元已关联知识点</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">全链路覆盖明细</CardTitle>
          <CardDescription>岗位 → 能力领域 → 能力单元 → 知识点 → 教材课件</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>岗位</TableHead>
                  <TableHead>能力领域数</TableHead>
                  <TableHead>能力单元数</TableHead>
                  <TableHead>知识点数</TableHead>
                  <TableHead>教材课件数</TableHead>
                  <TableHead>覆盖状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {positions.map((p) => {
                  const posDomains = getPositionDomains(p.id)
                  const posUnitIds = Array.from(
                    new Set(posDomains.flatMap((d) => d.unitIds))
                  )
                  const posKnowledge = knowledgePoints.filter((k) =>
                    k.capabilityUnitIds.some((id) => posUnitIds.includes(id))
                  )
                  const posCourses = courses.filter((c) =>
                    c.knowledgeIds.some((id) => posKnowledge.map((k) => k.id).includes(id))
                  )
                  const ok = posDomains.length > 0 && posUnitIds.length > 0 && posKnowledge.length > 0 && posCourses.length > 0
                  return (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium">{p.name}</TableCell>
                      <TableCell>{posDomains.length}</TableCell>
                      <TableCell>{posUnitIds.length}</TableCell>
                      <TableCell>{posKnowledge.length}</TableCell>
                      <TableCell>{posCourses.length}</TableCell>
                      <TableCell>
                        {ok ? (
                          <Badge variant="default" className="gap-1 text-xs">
                            <CheckCircle2 className="size-3" /> 完整
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1 text-xs">
                            <AlertCircle className="size-3" /> 缺失
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
