'use client'

import { useMemo, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users,
  Search,
  Eye,
  Briefcase,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpDown,
  FilterX,
} from 'lucide-react'
import {
  getMockData,
  getStudentPositions,
  getPositionAbilities,
  getLatestScore,
  getRecommendations,
} from '@/lib/mock-data'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PageHeader, StatCard } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'
import type { Student } from '@/lib/types'

function linkWithQuery(path: string, searchParams: URLSearchParams) {
  const q = searchParams.toString()
  return q ? `${path}?${q}` : path
}

function getStudentStatus(studentId: string) {
  const positions = getStudentPositions(studentId)
  let hasLow = false
  let hasDrop = false
  positions.forEach((p) => {
    const abilities = getPositionAbilities(p.id)
    abilities.forEach((a) => {
      const scores = [
        getLatestScore(studentId, a.id, '2026-07-07'),
        getLatestScore(studentId, a.id, '2026-07-06'),
      ]
      const today = scores[0]?.score ?? 0
      const yesterday = scores[1]?.score ?? today
      if (today < 60) hasLow = true
      if (today < yesterday) hasDrop = true
    })
  })
  const recs = getRecommendations(studentId)
  if (hasLow) return { status: 'danger' as const, label: '需关注', icon: AlertCircle, color: 'bg-red-500' }
  if (hasDrop || recs.length > 0) return { status: 'warning' as const, label: '预警', icon: AlertTriangle, color: 'bg-amber-500' }
  return { status: 'normal' as const, label: '正常', icon: CheckCircle2, color: 'bg-emerald-500' }
}

function getStudentAverageScore(studentId: string) {
  const positions = getStudentPositions(studentId)
  let total = 0
  let count = 0
  positions.forEach((p) => {
    getPositionAbilities(p.id).forEach((a) => {
      const s = getLatestScore(studentId, a.id)
      if (s) {
        total += s.score
        count++
      }
    })
  })
  return count > 0 ? Math.round(total / count) : 0
}

function StudentsPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { students, positions } = getMockData()

  const [query, setQuery] = useState('')
  const [positionFilter, setPositionFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'danger' | 'warning' | 'normal'>('all')
  const [sortBy, setSortBy] = useState('score-desc')

  const enriched = useMemo(() => {
    return students.map((s) => ({
      ...s,
      status: getStudentStatus(s.id),
      avg: getStudentAverageScore(s.id),
      positions: getStudentPositions(s.id),
      recCount: getRecommendations(s.id).length,
    }))
  }, [students])

  const filtered = useMemo(() => {
    let list = enriched.filter((s) => {
      const matchQuery = s.name.includes(query) || s.department.includes(query)
      const matchPos = positionFilter === 'all' || s.positionIds.includes(positionFilter)
      const matchStatus = statusFilter === 'all' || s.status.status === statusFilter
      return matchQuery && matchPos && matchStatus
    })
    list = [...list].sort((a, b) => {
      if (sortBy === 'score-desc') return b.avg - a.avg
      if (sortBy === 'score-asc') return a.avg - b.avg
      if (sortBy === 'rec-desc') return b.recCount - a.recCount
      return 0
    })
    return list
  }, [enriched, query, positionFilter, statusFilter, sortBy])

  const stats = useMemo(() => {
    return {
      total: enriched.length,
      danger: enriched.filter((s) => s.status.status === 'danger').length,
      warning: enriched.filter((s) => s.status.status === 'warning').length,
      normal: enriched.filter((s) => s.status.status === 'normal').length,
    }
  }, [enriched])

  const hasFilter = query || positionFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'score-desc'
  const clearFilters = () => {
    setQuery('')
    setPositionFilter('all')
    setStatusFilter('all')
    setSortBy('score-desc')
  }

  return (
    <div className="space-y-6">
      <PageHeader title="学员管理" desc="录入学员信息，为学员关联岗位，跟踪能力状态" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard value={stats.total} label="学员总数" tone="blue" icon={<Users className="size-7" />} />
        <StatCard value={stats.danger} label="需关注" tone="rose" icon={<AlertCircle className="size-7" />} />
        <StatCard value={stats.warning} label="预警" tone="amber" icon={<AlertTriangle className="size-7" />} />
        <StatCard value={stats.normal} label="正常" tone="green" icon={<CheckCircle2 className="size-7" />} />
      </div>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                <Input
                  placeholder="搜索姓名或班组"
                  className="pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Select value={positionFilter} onValueChange={(v) => v && setPositionFilter(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="全部岗位" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部岗位</SelectItem>
                  {positions.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v as typeof statusFilter)}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="全部状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部状态</SelectItem>
                  <SelectItem value="danger">需关注</SelectItem>
                  <SelectItem value="warning">预警</SelectItem>
                  <SelectItem value="normal">正常</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v) => v && setSortBy(v)}>
                <SelectTrigger className="w-[160px]">
                  <ArrowUpDown className="size-4" />
                  <SelectValue placeholder="排序" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score-desc">能力均分降序</SelectItem>
                  <SelectItem value="score-asc">能力均分升序</SelectItem>
                  <SelectItem value="rec-desc">推荐数降序</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasFilter && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">共 {filtered.length} 位学员</span>
                <Button variant="ghost" size="sm" className="h-7 gap-1" onClick={clearFilters}>
                  <FilterX className="size-3.5" /> 清空筛选
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">学员列表</CardTitle>
          <CardDescription>共 {filtered.length} 位学员</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>姓名</TableHead>
                  <TableHead>班组</TableHead>
                  <TableHead>关联岗位</TableHead>
                  <TableHead>综合均分</TableHead>
                  <TableHead>推荐计划</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const Icon = s.status.icon
                  return (
                    <TableRow
                      key={s.id}
                      className="cursor-pointer"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('button, a')) return
                        router.push(linkWithQuery(`/students/${s.id}`, searchParams))
                      }}
                    >
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>{s.department}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {s.positions.map((p) => (
                            <Badge key={p.id} variant="outline" className="text-xs">
                              <Briefcase className="mr-1 size-3" />
                              {p.name}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className={cn('font-semibold', s.avg < 60 ? 'text-red-600' : '')}>
                        {s.avg}
                      </TableCell>
                      <TableCell>{s.recCount}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn('size-2.5 rounded-full', s.status.color)} />
                          <Icon className="size-4" />
                          <span className="text-xs">{s.status.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={linkWithQuery(`/students/${s.id}`, searchParams)}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {filtered.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">没有匹配的学员</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
          加载中…
        </div>
      }
    >
      <StudentsPageContent />
    </Suspense>
  )
}
