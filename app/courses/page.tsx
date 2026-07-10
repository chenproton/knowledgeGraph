'use client'

import { useState } from 'react'
import { LayoutList, Search, BookOpen, FileText, HelpCircle, Target, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
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
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/dashboard-kit'
import type { Course, KnowledgePoint } from '@/lib/types'

function courseTypeIcon(type: Course['type']) {
  switch (type) {
    case 'course':
      return <BookOpen className="size-4" />
    case 'material':
      return <FileText className="size-4" />
    case 'quiz':
      return <HelpCircle className="size-4" />
  }
}

function courseTypeLabel(type: Course['type']) {
  switch (type) {
    case 'course':
      return '课程'
    case 'material':
      return '课件'
    case 'quiz':
      return '测验'
  }
}

export default function CoursesPage() {
  const { courses: initialCourses, knowledgePoints: initialKnowledgePoints } = getMockData()
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>(initialKnowledgePoints)
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(
    () => initialCourses.find((c) => c.type === 'course')?.id ?? null
  )
  const [knowledgeDialogOpen, setKnowledgeDialogOpen] = useState(false)
  const [knowledgeDialogQuery, setKnowledgeDialogQuery] = useState('')

  // 课程（无 parentId 的 course 类型或 material 且无 parentId）
  const parentCourses = courses.filter((c) => c.type === 'course')

  // 获取课程的课件子节点
  const getUnits = (courseId: string) =>
    courses.filter((c) => c.parentId === courseId)

  // 展开的课程ID集合，默认全部展开
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(parentCourses.map((c) => c.id))
  )

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // 搜索过滤：课程名称或课件名称匹配
  const filteredCourses = parentCourses.filter(
    (c) => c.title.includes(query) || (c.type && courseTypeLabel(c.type).includes(query))
  )

  const selected = courses.find((c) => c.id === selectedId)
  const selectedParent = selected?.parentId ? courses.find((c) => c.id === selected.parentId) : null

  const selectedKnowledge = selected
    ? knowledgePoints.filter((k) => selected.knowledgeIds.includes(k.id))
    : []

  function openKnowledgeDialog() {
    setKnowledgeDialogQuery('')
    setKnowledgeDialogOpen(true)
  }

  function toggleKnowledgeForCourse(knowledgeId: string, courseId: string) {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c
        const associated = c.knowledgeIds.includes(knowledgeId)
        return {
          ...c,
          knowledgeIds: associated
            ? c.knowledgeIds.filter((id) => id !== knowledgeId)
            : [...c.knowledgeIds, knowledgeId],
        }
      })
    )
    setKnowledgePoints((prev) =>
      prev.map((k) => {
        if (k.id !== knowledgeId) return k
        const associated = k.courseIds.includes(courseId)
        return {
          ...k,
          courseIds: associated ? k.courseIds.filter((id) => id !== courseId) : [...k.courseIds, courseId],
        }
      })
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="教材课件库" desc="课程下设多层课件，每层课件关联知识点" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <LayoutList className="size-4" /> 资源列表
            </CardTitle>
            <CardDescription>课程 → 课件层级浏览</CardDescription>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索课程或课件名称"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {filteredCourses.map((course) => {
              const expanded = expandedIds.has(course.id)
              const units = getUnits(course.id)

              // 如果搜索有结果但课程名称不匹配，检查课件是否匹配
              const matchedUnits = query
                ? units.filter((u) => u.title.includes(query))
                : units

              return (
                <div key={course.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => toggleExpand(course.id)}
                      className="shrink-0 p-1 text-muted-foreground hover:text-foreground"
                    >
                      {expanded ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronRight className="size-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedId(course.id)
                        setExpandedIds((prev) => {
                          if (!prev.has(course.id)) {
                            const next = new Set(prev)
                            next.add(course.id)
                            return next
                          }
                          return prev
                        })
                      }}
                      className={cn(
                        'flex flex-1 items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                        selectedId === course.id
                          ? 'border border-indigo-300 bg-gradient-to-br from-indigo-50 to-purple-50/60 ring-1 ring-indigo-200'
                          : 'hover:bg-muted'
                      )}
                    >
                      <div className="text-muted-foreground">
                        {courseTypeIcon(course.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{course.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {course.duration} · {units.length} 个课件
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {courseTypeLabel(course.type)}
                      </Badge>
                    </button>
                  </div>
                  {expanded && (
                    <div className="ml-6 space-y-0.5 border-l border-slate-200 pl-3">
                      {(query ? matchedUnits : units).map((unit) => (
                        <button
                          key={unit.id}
                          onClick={() => setSelectedId(unit.id)}
                          className={cn(
                            'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors',
                            selectedId === unit.id
                              ? 'border border-purple-300 bg-gradient-to-br from-purple-50 to-indigo-50/60 ring-1 ring-purple-200'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="text-muted-foreground shrink-0">
                            {courseTypeIcon('material')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="truncate text-[13px]">{unit.title}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {unit.duration}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] shrink-0">
                            课件
                          </Badge>
                        </button>
                      ))}
                      {query && matchedUnits.length === 0 && (
                        <div className="py-1 text-[11px] text-muted-foreground">
                          无匹配课件
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">资源详情</CardTitle>
            <CardDescription>
              {selected?.parentId
                ? `课件 · 所属课程：${selectedParent?.title || selected.parentId}`
                : selected?.type === 'course'
                ? '课程信息与下属课件'
                : '资源基本信息与关联知识点'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50/60 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-md bg-gradient-to-br from-[#5b76e8] to-[#8c6ff0] text-white">
                      {courseTypeIcon(selected.type === 'course' ? 'course' : 'material')}
                    </div>
                    <div>
                      <div className="text-lg font-semibold">{selected.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {courseTypeLabel(selected.type)} · 预计 {selected.duration}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 如果是课程，展示下属课件列表 */}
                {selected.type === 'course' && (() => {
                  const units = getUnits(selected.id)
                  return (
                    <>
                      <Separator />
                      <div>
                        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                          <FileText className="size-4" /> 下属课件 ({units.length} 个)
                        </h3>
                        <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                          {units.length > 0 ? (
                            units.map((unit) => {
                              const unitKnowledge = knowledgePoints.filter(
                                (k) => unit.knowledgeIds.includes(k.id)
                              )
                              return (
                                <div
                                  key={unit.id}
                                  className={cn(
                                    'rounded-md border px-3 py-2',
                                    selectedId === unit.id
                                      ? 'border-purple-300 bg-purple-50/50'
                                      : ''
                                  )}
                                >
                                  <div className="flex items-center justify-between">
                                    <button
                                      onClick={() => setSelectedId(unit.id)}
                                      className="flex items-center gap-2 text-left hover:text-indigo-600"
                                    >
                                      <FileText className="size-3.5 text-purple-500" />
                                      <span className="text-sm font-medium">{unit.title}</span>
                                    </button>
                                    <Badge variant="outline" className="text-[10px]">
                                      {unit.duration}
                                    </Badge>
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap gap-1">
                                    {unitKnowledge.length > 0 ? (
                                      unitKnowledge.map((k) => (
                                        <span
                                          key={k.id}
                                          className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-medium text-amber-600"
                                        >
                                          {k.name}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-[10px] text-muted-foreground">
                                        未关联知识点
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              暂无下属课件
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )
                })()}

                {/* 知识点关联（课件或课程级别的知识点管理） */}
                <Separator />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-medium">
                      <Target className="size-4" /> 关联知识点
                    </h3>
                    <Button
                      size="sm"
                      className="bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm"
                      onClick={openKnowledgeDialog}
                    >
                      管理关联
                    </Button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                    {selectedKnowledge.length > 0 ? (
                      selectedKnowledge.map((k) => (
                        <div
                          key={k.id}
                          className="flex items-center justify-between rounded-md border px-3 py-2"
                        >
                          <div>
                            <div className="text-sm font-medium">{k.name}</div>
                            <div className="text-xs text-muted-foreground">{k.code}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {k.level} 级知识点
                            </Badge>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="size-7 text-destructive"
                              onClick={() =>
                                selected && toggleKnowledgeForCourse(k.id, selected.id)
                              }
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">未关联知识点</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                从左侧选择资源查看详情
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Course-Knowledge Association Dialog */}
      <Dialog open={knowledgeDialogOpen} onOpenChange={setKnowledgeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关联知识点</DialogTitle>
            <DialogDescription>
              为资源「{selected?.title}」勾选需要关联的知识点
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
                      k.name.includes(knowledgeDialogQuery) ||
                      k.code.includes(knowledgeDialogQuery)
                  )
                  .map((k) => {
                    const checked = selected
                      ? selected.knowledgeIds.includes(k.id)
                      : false
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
                            selected && toggleKnowledgeForCourse(k.id, selected.id)
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
