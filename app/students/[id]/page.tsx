'use client'

import { useMemo, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  UserCircle,
  Building2,
  CalendarDays,
  Briefcase,
  ArrowLeft,
  Bell,
  Star,
  StickyNote,
  FileWarning,
  BookOpen,
  Send,
  TrendingUp,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getStudentById,
  getStudentPositions,
  getPositionAbilities,
  getLatestScore,
  getStudentScores,
  getStudentWorkorders,
  getStudentLearningRecords,
  getRecommendations,
  getWorkorderById,
  getAbilityById,
  getCourseById,
} from '@/lib/mock-data'
import { LineChart } from '@/components/charts/line-chart'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

type TeacherNote = { id: string; content: string; createdAt: string }
type TimelineItem =
  | { type: 'workorder'; id: string; date: string; workorderId: string; abilityId: string; scoreImpact: number }
  | { type: 'learning'; id: string; date: string; courseId: string; score?: number }
  | { type: 'note'; id: string; date: string; content: string }

function useQueryLink() {
  const searchParams = useSearchParams()
  return (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }
}

function levelClass(score: number) {
  if (score >= 90) return 'text-emerald-600'
  if (score >= 75) return 'text-blue-600'
  if (score >= 60) return 'text-amber-600'
  return 'text-red-600'
}

function getLast7DaysScores(scores: ReturnType<typeof getStudentScores>) {
  const endDate = '2026-07-07'
  const days: number[] = []
  const labels: string[] = []
  const scoreMap = new Map(scores.map((s) => [s.date, s.score]))
  let lastKnown = 75
  for (let i = 6; i >= 0; i--) {
    const d = new Date(endDate)
    d.setDate(d.getDate() - i)
    const ds = d.toISOString().slice(0, 10)
    labels.push(`${d.getMonth() + 1}/${d.getDate()}`)
    if (scoreMap.has(ds)) lastKnown = scoreMap.get(ds)!
    days.push(lastKnown)
  }
  return { values: days, labels }
}

export default function StudentDetailPage() {
  const params = useParams()
  const studentId = params.id as string
  const student = getStudentById(studentId)
  const link = useQueryLink()
  const router = useRouter()
  const [note, setNote] = useState('')
  const [notes, setNotes] = useState<TeacherNote[]>([])
  const [following, setFollowing] = useState(false)

  if (!student) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">学员不存在</h1>
        <Button asChild variant="outline">
          <Link href={link('/students')}>
            <ArrowLeft className="mr-1 size-4" /> 返回列表
          </Link>
        </Button>
      </div>
    )
  }

  const positions = getStudentPositions(studentId)
  const abilityRows = useMemo(() => {
    const rows: {
      positionName: string
      abilityName: string
      latest: number
      yesterday: number
      trend: number[]
      trendLabels: string[]
    }[] = []
    positions.forEach((position) => {
      getPositionAbilities(position.id).forEach((ability) => {
        const scores = getStudentScores(studentId, ability.id)
        const latest = getLatestScore(studentId, ability.id)?.score ?? 0
        const yesterday = getLatestScore(studentId, ability.id, '2026-07-06')?.score ?? latest
        const { values, labels } = getLast7DaysScores(scores)
        rows.push({
          positionName: position.name,
          abilityName: ability.name,
          latest,
          yesterday,
          trend: values,
          trendLabels: labels,
        })
      })
    })
    return rows
  }, [studentId, positions])

  const trendChartData = useMemo(() => {
    const labels = abilityRows[0]?.trendLabels ?? []
    return labels.map((label, idx) => {
      const record: Record<string, string | number> = { date: label }
      abilityRows.forEach((row) => {
        record[row.abilityName] = row.trend[idx] ?? 0
      })
      return record
    })
  }, [abilityRows])

  const trendChartSeries = useMemo(
    () =>
      abilityRows.map((row) => ({
        key: row.abilityName,
        name: row.abilityName,
        color: row.latest >= 80 ? '#22c55e' : row.latest >= 60 ? '#f59e0b' : '#ef4444',
      })),
    [abilityRows]
  )

  const workorderRecords = useMemo(() => getStudentWorkorders(studentId), [studentId])
  const learningRecords = useMemo(() => getStudentLearningRecords(studentId), [studentId])
  const recommendations = useMemo(() => getRecommendations(studentId), [studentId])

  const timelineItems = useMemo<TimelineItem[]>(() => {
    const wo = workorderRecords.map((r) => ({
      type: 'workorder' as const,
      id: `wo-${r.workorderId}-${r.date}`,
      date: r.date,
      workorderId: r.workorderId,
      abilityId: r.abilityId,
      scoreImpact: r.scoreImpact,
    }))
    const lr = learningRecords.map((r) => ({
      type: 'learning' as const,
      id: `lr-${r.courseId}-${r.date}`,
      date: r.date,
      courseId: r.courseId,
      score: r.score,
    }))
    const ns = notes.map((n) => ({ type: 'note' as const, id: n.id, date: n.createdAt, content: n.content }))
    return [...wo, ...lr, ...ns].sort((a, b) => b.date.localeCompare(a.date))
  }, [workorderRecords, learningRecords, notes])

  const overallAvg = useMemo(() => {
    if (abilityRows.length === 0) return 0
    return Math.round(abilityRows.reduce((sum, r) => sum + r.latest, 0) / abilityRows.length)
  }, [abilityRows])

  const handleNotify = () => {
    toast.success('已模拟发送站内消息', { description: `通知已发送给 ${student.name}` })
  }
  const handleFollow = () => {
    setFollowing((prev) => !prev)
    toast.success(following ? '已取消关注' : '已关注该学员')
  }
  const handleAddNote = () => {
    if (!note.trim()) return
    const newNote: TeacherNote = { id: `n-${Date.now()}`, content: note.trim(), createdAt: '2026-07-07' }
    setNotes((prev) => [newNote, ...prev])
    setNote('')
    toast.success('指导备注已添加')
  }

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <UserCircle className="size-6 text-indigo-500" /> {student.name} 的画像详情
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">管理员视角 · 岗位能力轨迹与指导记录</p>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={link('/students')}>
            <ArrowLeft className="mr-1 size-4" /> 返回列表
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="bg-gradient-to-br from-[#5b76e8] to-[#8c6ff0] text-xl text-white">
                  {student.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-lg font-semibold">{student.name}</div>
                <div className="text-sm text-muted-foreground">{student.department}</div>
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Building2 className="size-4" /> 部门：{student.department}
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4" /> 入职：{student.joinDate}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="size-4" /> 岗位：
                <div className="flex flex-wrap gap-1">
                  {positions.map((p) => (
                    <Badge key={p.id} variant="outline" className="font-normal">
                      {p.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-purple-50/60 p-3">
              <div>
                <div className="text-xs text-muted-foreground">综合均分</div>
                <div className={cn('text-2xl font-bold', levelClass(overallAvg))}>{overallAvg}</div>
              </div>
              <Badge variant={overallAvg < 60 ? 'destructive' : 'default'}>
                {overallAvg < 60 ? '需关注' : overallAvg >= 90 ? '优秀' : '正常'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5" /> 近 7 天能力趋势
            </CardTitle>
            <CardDescription>各能力单元每日得分变化</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {trendChartData.length > 0 ? (
                <LineChart data={trendChartData} xKey="date" series={trendChartSeries} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">暂无能力单元数据</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" /> 能力单元分数表
          </CardTitle>
          <CardDescription>岗位、能力单元、最近分数、昨日分数与 7 天趋势</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>岗位</TableHead>
                  <TableHead>能力单元</TableHead>
                  <TableHead>最近分数</TableHead>
                  <TableHead>昨日分数</TableHead>
                  <TableHead>变化</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {abilityRows.map((row) => {
                  const diff = row.latest - row.yesterday
                  return (
                    <TableRow key={`${row.positionName}-${row.abilityName}`}>
                      <TableCell className="text-muted-foreground">{row.positionName}</TableCell>
                      <TableCell className="font-medium">{row.abilityName}</TableCell>
                      <TableCell className={cn('font-semibold', levelClass(row.latest))}>{row.latest}</TableCell>
                      <TableCell className={cn('font-semibold', levelClass(row.yesterday))}>{row.yesterday}</TableCell>
                      <TableCell>
                        {diff > 0 ? (
                          <span className="text-emerald-600">+{diff}</span>
                        ) : diff < 0 ? (
                          <span className="text-red-600">{diff}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileWarning className="size-5" /> 执行记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workorderRecords.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">近期无执行记录</div>
            ) : (
              <Accordion className="w-full">
                {workorderRecords.map((r) => {
                  const wo = getWorkorderById(r.workorderId)
                  const ability = getAbilityById(r.abilityId)
                  return (
                    <AccordionItem key={`${r.workorderId}-${r.date}`} value={`${r.workorderId}-${r.date}`}>
                      <AccordionTrigger>
                        <div className="flex flex-1 items-center justify-between pr-2 text-left">
                          <div className="text-sm font-medium">{wo?.name || r.workorderId}</div>
                          <Badge variant="destructive" className="mr-2 text-xs">
                            {r.scoreImpact > 0 ? '+' : ''}{r.scoreImpact} 分
                          </Badge>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-1 pl-2 text-sm text-muted-foreground">
                          <div>关联能力单元：{ability?.name || r.abilityId}</div>
                          <div>日期：{r.date}</div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  )
                })}
              </Accordion>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="size-5" /> 学习记录
            </CardTitle>
          </CardHeader>
          <CardContent>
            {learningRecords.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground">暂无学习记录</div>
            ) : (
              <div className="space-y-3">
                {learningRecords.map((r) => {
                  const course = getCourseById(r.courseId)
                  return (
                    <div key={`${r.courseId}-${r.date}`} className="flex items-start gap-3 rounded-lg border p-3">
                      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <BookOpen className="size-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{course?.title || r.courseId}</div>
                        <div className="text-xs text-muted-foreground">{r.date}</div>
                      </div>
                      {r.score !== undefined && <Badge variant="outline">得分 {r.score}</Badge>}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5" /> 当前推荐计划
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">暂无推荐计划</div>
          ) : (
            <div className="space-y-3">
              {recommendations.map((rec) => {
                const ability = getAbilityById(rec.abilityId)
                return (
                  <div key={rec.id} className="rounded-lg border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium">{ability?.name || rec.abilityId}</span>
                      <Badge variant="destructive" className="text-xs">分数下降</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    <div className="mt-2 text-xs text-muted-foreground">推荐 {rec.courseIds.length} 门课程</div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="size-5" /> 综合时间轴
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timelineItems.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">暂无记录</div>
          ) : (
            <div className="space-y-4">
              {timelineItems.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full',
                      item.type === 'learning' && 'bg-blue-100 text-blue-600',
                      item.type === 'note' && 'bg-amber-100 text-amber-600',
                      item.type === 'workorder' && 'bg-red-100 text-red-600'
                    )}
                  >
                    {item.type === 'learning' && <BookOpen className="size-4" />}
                    {item.type === 'note' && <StickyNote className="size-4" />}
                    {item.type === 'workorder' && <FileWarning className="size-4" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="text-xs text-muted-foreground">{item.date}</div>
                    {item.type === 'learning' && (
                      <div className="text-sm">
                        完成学习：{getCourseById(item.courseId)?.title || item.courseId}
                        {item.score !== undefined && <Badge variant="outline" className="ml-2">得分 {item.score}</Badge>}
                      </div>
                    )}
                    {item.type === 'note' && (
                      <div className="rounded-md border-l-4 border-primary bg-muted/30 p-2 text-sm">{item.content}</div>
                    )}
                    {item.type === 'workorder' && (
                      <div className="text-sm">
                        领域：{getWorkorderById(item.workorderId)?.name || item.workorderId} · 关联能力单元：
                        {getAbilityById(item.abilityId)?.name || item.abilityId} · 影响
                        {item.scoreImpact > 0 ? '+' : ''}{item.scoreImpact} 分
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 p-3 backdrop-blur sm:p-4">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <StickyNote className="size-4" /> 管理员操作区
          </div>
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Input
              placeholder="输入指导备注，回车添加"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
              className="sm:max-w-xs"
            />
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleNotify}>
                <Bell className="mr-1 size-4" /> 通知学员
              </Button>
              <Button variant={following ? 'default' : 'outline'} onClick={handleFollow}>
                <Star className={cn('mr-1 size-4', following && 'fill-current')} />
                {following ? '已关注' : '关注学员'}
              </Button>
              <Button onClick={handleAddNote}>
                <Send className="mr-1 size-4" /> 添加备注
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
