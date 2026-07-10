'use client'

import { useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ListTree,
  Search,
  BookOpen,
  Target,
  ChevronRight,
  Plus,
  Upload,
  Play,
  Pencil,
  Trash2,
} from 'lucide-react'
import {
  getMockData,
  getKnowledgeTree,
  getAbilityById,
  getCourseById,
} from '@/lib/mock-data'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PageHeader } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'
import type { KnowledgePoint } from '@/lib/types'

function useQueryLink() {
  const searchParams = useSearchParams()
  return (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }
}

function KnowledgeTreeNode({
  node,
  level,
  selectedId,
  onSelect,
}: {
  node: KnowledgePoint & { children?: KnowledgePoint[] }
  level: number
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  const hasChildren = node.children && node.children.length > 0
  return (
    <div className="select-none">
      <button
        onClick={() => onSelect(node.id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          selectedId === node.id ? 'bg-primary text-primary-foreground' : 'hover:bg-muted',
          level > 0 && 'ml-4 border-l pl-4'
        )}
        style={{ marginLeft: level > 0 ? `${level * 16}px` : undefined }}
      >
        {hasChildren && <ChevronRight className="size-3.5" />}
        <span className="font-medium">{node.name}</span>
        <Badge
          variant={selectedId === node.id ? 'secondary' : 'outline'}
          className="ml-auto text-[10px]"
        >
          {node.level} 级
        </Badge>
      </button>
      {hasChildren && (
        <div className="mt-1 space-y-1">
          {node.children!.map((child) => (
            <KnowledgeTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function getKnowledgeTreeFromFlat(flat: KnowledgePoint[]): (KnowledgePoint & { children?: KnowledgePoint[] })[] {
  const map = new Map<string, KnowledgePoint & { children?: KnowledgePoint[] }>()
  flat.forEach((k) => map.set(k.id, { ...k }))
  const roots: (KnowledgePoint & { children?: KnowledgePoint[] })[] = []
  flat.forEach((k) => {
    if (k.parentId) {
      const parent = map.get(k.parentId)
      if (parent) {
        parent.children = parent.children || []
        parent.children.push(map.get(k.id)!)
      }
    } else {
      roots.push(map.get(k.id)!)
    }
  })
  return roots
}

export default function KnowledgeHierarchyPage() {
  const { capabilityUnits, courses } = getMockData()
  const initialTree = getKnowledgeTree()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialTree[0]?.id ?? null)
  const [knowledgePoints, setKnowledgePoints] = useState<KnowledgePoint[]>(
    initialTree.flatMap((root) => {
      const flatten = (k: KnowledgePoint & { children?: KnowledgePoint[] }): KnowledgePoint[] => [
        k,
        ...(k.children?.flatMap(flatten) ?? []),
      ]
      return flatten(root)
    })
  )

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [bulkSimDialogOpen, setBulkSimDialogOpen] = useState(false)
  const [bulkSimCount, setBulkSimCount] = useState(5)

  const [kpForm, setKpForm] = useState({
    name: '',
    code: '',
    level: 1,
    parentId: '',
    abilityIds: [] as string[],
    courseIds: [] as string[],
  })

  function generateKpId() {
    const max = knowledgePoints.reduce((acc, k) => {
      const num = parseInt(k.id.replace('k-', '').replace(/-/g, ''), 10)
      return Number.isNaN(num) ? acc : Math.max(acc, num)
    }, 0)
    return `k-${max + 1}`
  }

  function generateKpCode(level: number, parentCode?: string): string {
    const level1 = knowledgePoints.filter((k) => k.level === 1)
    const existing = knowledgePoints.map((k) => k.code)
    if (level === 1) {
      const max = level1.reduce((acc, k) => {
        const m = k.code.match(/KN-(\d+)/)
        return m ? Math.max(acc, parseInt(m[1], 10)) : acc
      }, 0)
      const code = `KN-${String(max + 1).padStart(2, '0')}`
      return existing.includes(code) ? generateKpCode(level) : code
    }
    if (parentCode) {
      const parent = knowledgePoints.find((k) => k.code === parentCode)
      if (parent) {
        const siblings = knowledgePoints.filter((k) => k.parentId === parent.id)
        const max = siblings.reduce((acc, k) => {
          const m = k.code.match(/-(\d+)$/)
          return m ? Math.max(acc, parseInt(m[1], 10)) : acc
        }, 0)
        return `${parentCode}-${max + 1}`
      }
    }
    const max = level1.reduce((acc, k) => {
      const m = k.code.match(/KN-(\d+)/)
      return m ? Math.max(acc, parseInt(m[1], 10)) : acc
    }, 0)
    return `KN-${String(max + 1).padStart(2, '0')}-1`
  }

  function openCreateKp() {
    setDialogMode('create')
    setEditingId(null)
    setKpForm({ name: '', code: generateKpCode(1), level: 1, parentId: '', abilityIds: [], courseIds: [] })
    setDialogOpen(true)
  }

  function openEditKp(kp: KnowledgePoint) {
    setDialogMode('edit')
    setEditingId(kp.id)
    setKpForm({
      name: kp.name,
      code: kp.code,
      level: kp.level,
      parentId: kp.parentId || '',
      abilityIds: [...kp.abilityIds],
      courseIds: [...kp.courseIds],
    })
    setDialogOpen(true)
  }

  function handleSaveKp() {
    if (!kpForm.name.trim() || !kpForm.code.trim()) return
    if (dialogMode === 'create') {
      const newKp: KnowledgePoint = {
        id: generateKpId(),
        name: kpForm.name.trim(),
        code: kpForm.code.trim(),
        level: kpForm.level,
        parentId: kpForm.level === 2 && kpForm.parentId ? kpForm.parentId : undefined,
        abilityIds: kpForm.abilityIds,
        capabilityUnitIds: kpForm.abilityIds,
        courseIds: kpForm.courseIds,
      }
      setKnowledgePoints((prev) => [...prev, newKp])
    } else if (editingId) {
      setKnowledgePoints((prev) =>
        prev.map((k) =>
          k.id === editingId
            ? {
                ...k,
                name: kpForm.name.trim(),
                code: kpForm.code.trim(),
                level: kpForm.level,
                parentId: kpForm.level === 2 && kpForm.parentId ? kpForm.parentId : undefined,
                abilityIds: kpForm.abilityIds,
                capabilityUnitIds: kpForm.abilityIds,
                courseIds: kpForm.courseIds,
              }
            : k
        )
      )
    }
    setDialogOpen(false)
  }

  function confirmDeleteKp(id: string) {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  function handleDeleteKp() {
    if (!deleteId) return
    setKnowledgePoints((prev) => {
      const idsToRemove = new Set<string>([deleteId])
      prev.forEach((k) => {
        if (k.parentId === deleteId) idsToRemove.add(k.id)
      })
      const next = prev.filter((k) => !idsToRemove.has(k.id))
      if (selectedId && idsToRemove.has(selectedId)) setSelectedId(next[0]?.id ?? null)
      return next
    })
    setDeleteDialogOpen(false)
  }

  function handleBulkImport() {
    const lines = bulkText.trim().split('\n').filter(Boolean)
    const newKps: KnowledgePoint[] = []
    lines.forEach((line) => {
      const parts = line.split(',').map((s) => s.trim())
      if (parts.length < 2) return
      const [name, code, levelStr, parentCode] = parts
      const level = levelStr === '2' ? 2 : 1
      let parentId: string | undefined
      if (level === 2 && parentCode) {
        const parent = knowledgePoints.find((k) => k.code === parentCode) || newKps.find((k) => k.code === parentCode)
        if (parent) parentId = parent.id
      }
      newKps.push({
        id: `k-import-${Date.now()}-${newKps.length}`,
        name,
        code,
        level,
        parentId,
        abilityIds: [],
        capabilityUnitIds: [],
        courseIds: [],
      })
    })
    setKnowledgePoints((prev) => [...prev, ...newKps])
    setBulkText('')
    setBulkDialogOpen(false)
  }

  function handleBulkSim() {
    const newKps: KnowledgePoint[] = []
    const maxCode = knowledgePoints.reduce((acc, k) => {
      const m = k.code.match(/KN-(\d+)/)
      return m ? Math.max(acc, parseInt(m[1], 10)) : acc
    }, 0)
    for (let i = 0; i < bulkSimCount; i++) {
      const code = `KN-${String(maxCode + i + 1).padStart(2, '0')}`
      newKps.push({
        id: `k-sim-${Date.now()}-${i}`,
        name: `模拟知识点 ${code}`,
        code,
        level: 1,
        abilityIds: [],
        capabilityUnitIds: [],
        courseIds: [],
      })
    }
    setKnowledgePoints((prev) => [...prev, ...newKps])
    setBulkSimDialogOpen(false)
  }

  function toggleAbilityForKp(abilityId: string) {
    setKpForm((prev) => ({
      ...prev,
      abilityIds: prev.abilityIds.includes(abilityId)
        ? prev.abilityIds.filter((id) => id !== abilityId)
        : [...prev.abilityIds, abilityId],
    }))
  }

  function toggleCourseForKp(courseId: string) {
    setKpForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
    }))
  }

  const tree = useMemo(
    () => getKnowledgeTreeFromFlat(knowledgePoints),
    [knowledgePoints]
  )

  const flatKnowledge = useMemo(
    () =>
      tree.flatMap((root) => {
        const flatten = (k: KnowledgePoint & { children?: KnowledgePoint[] }): KnowledgePoint[] => [
          k,
          ...(k.children?.flatMap(flatten) ?? []),
        ]
        return flatten(root)
      }),
    [tree]
  )

  const selected = flatKnowledge.find((k) => k.id === selectedId)
  const filtered = query
    ? flatKnowledge.filter((k) => k.name.includes(query) || k.code.includes(query))
    : []

  const level1Kps = useMemo(() => knowledgePoints.filter((k) => k.level === 1), [knowledgePoints])

  return (
    <div className="space-y-6">
      <PageHeader
        title="知识点管理"
        desc="维护多级知识点树，管理知识点与能力单元、教材的关联"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button size="sm" className="gap-1 bg-indigo-500 text-white hover:bg-indigo-600 shadow-sm" onClick={openCreateKp}>
              <Plus className="size-3.5" /> 新增
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => { setBulkText(''); setBulkDialogOpen(true) }}>
              <Upload className="size-3.5" /> 批量导入
            </Button>
            <Button size="sm" variant="outline" className="gap-1" onClick={() => { setBulkSimCount(5); setBulkSimDialogOpen(true) }}>
              <Play className="size-3.5" /> 批量导入模拟
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ListTree className="size-4" /> 知识点树
            </CardTitle>
            <CardDescription>一级 → 二级知识点层级</CardDescription>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="搜索知识点"
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {query ? (
              filtered.map((k) => (
                <button
                  key={k.id}
                  onClick={() => {
                    setSelectedId(k.id)
                    setQuery('')
                  }}
                  className={cn(
                    'w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted',
                    selectedId === k.id && 'bg-primary text-primary-foreground hover:bg-primary'
                  )}
                >
                  {k.name}
                  <span className="ml-2 text-xs text-muted-foreground">{k.code}</span>
                </button>
              ))
            ) : (
              tree.map((root) => (
                <KnowledgeTreeNode
                  key={root.id}
                  node={root}
                  level={0}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">知识点详情</CardTitle>
                <CardDescription>查看关联的能力单元与教材课件</CardDescription>
              </div>
              {selected && (
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => openEditKp(selected)}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => confirmDeleteKp(selected.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50/60 p-4">
                  <div className="flex items-center gap-2">
                    <div className="text-lg font-semibold">{selected.name}</div>
                    <Badge variant="outline">{selected.code}</Badge>
                    <Badge variant="secondary">{selected.level} 级知识点</Badge>
                  </div>
                  {selected.parentId && (
                    <div className="mt-1 text-sm text-muted-foreground">
                      父级：{flatKnowledge.find((k) => k.id === selected.parentId)?.name}
                    </div>
                  )}
                </div>

                <Separator />

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <Target className="size-4" /> 关联能力单元
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.abilityIds.length > 0 ? (
                      selected.abilityIds.map((id) => {
                        const ab = getAbilityById(id)
                        return ab ? (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {ab.name}
                          </Badge>
                        ) : null
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">未关联能力单元</span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
                    <BookOpen className="size-4" /> 关联教材课件
                  </h3>
                  <div className="space-y-2">
                    {selected.courseIds.length > 0 ? (
                      selected.courseIds.map((id) => {
                        const course = getCourseById(id)
                        return course ? (
                          <div key={id} className="rounded-md border px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">{course.title}</span>
                              <Badge variant="outline" className="text-xs">
                                {course.type === 'course' ? '视频课程' : course.type === 'material' ? '课件' : '测验'}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground">预计学习时长：{course.duration}</div>
                          </div>
                        ) : null
                      })
                    ) : (
                      <span className="text-sm text-muted-foreground">未关联教材课件</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                从左侧选择知识点查看详情
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === 'create' ? '新建知识点' : '编辑知识点'}</DialogTitle>
            <DialogDescription>
              {dialogMode === 'create' ? '创建新的知识点，支持一、二级层级' : '修改知识点名称、编码、层级与关联关系'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">知识点名称</label>
              <Input value={kpForm.name} onChange={(e) => setKpForm({ ...kpForm, name: e.target.value })} placeholder="请输入知识点名称" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">知识点编码</label>
              <Input value={kpForm.code} onChange={(e) => setKpForm({ ...kpForm, code: e.target.value })} placeholder="例如：KN-12" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">层级</label>
              <Select
                value={String(kpForm.level)}
                onValueChange={(v) => {
                  if (!v) return
                  const level = parseInt(v, 10)
                  setKpForm({ ...kpForm, level, parentId: level === 1 ? '' : kpForm.parentId })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择层级" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">一级知识点</SelectItem>
                  <SelectItem value="2">二级知识点</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {kpForm.level === 2 && (
              <div className="grid gap-2">
                <label className="text-sm font-medium">父级知识点</label>
                <Select value={kpForm.parentId} onValueChange={(v) => setKpForm({ ...kpForm, parentId: v ?? '' })}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择父级知识点" />
                  </SelectTrigger>
                  <SelectContent>
                    {level1Kps.map((kp) => (
                      <SelectItem key={kp.id} value={kp.id}>
                        {kp.name} ({kp.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid gap-2">
              <label className="text-sm font-medium">关联能力单元</label>
              <ScrollArea className="h-36 rounded-md border p-2">
                <div className="space-y-1">
                  {capabilityUnits.map((u) => (
                    <label key={u.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={kpForm.abilityIds.includes(u.id)}
                        onChange={() => toggleAbilityForKp(u.id)}
                      />
                      <span className="text-sm">{u.name}</span>
                      <span className="text-xs text-muted-foreground">{u.code}</span>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">关联教材课件</label>
              <ScrollArea className="h-36 rounded-md border p-2">
                <div className="space-y-1">
                  {courses.map((c) => (
                    <label key={c.id} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 hover:bg-muted">
                      <input
                        type="checkbox"
                        className="size-4 rounded border-input"
                        checked={kpForm.courseIds.includes(c.id)}
                        onChange={() => toggleCourseForKp(c.id)}
                      />
                      <span className="text-sm">{c.title}</span>
                      <Badge variant="outline" className="text-[10px]">
                        {c.type === 'course' ? '视频' : c.type === 'material' ? '课件' : '测验'}
                      </Badge>
                    </label>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={handleSaveKp}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              删除该知识点及其下所有子知识点。此操作不可恢复，是否继续？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteKp}>删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>批量导入知识点</DialogTitle>
            <DialogDescription>
              每行一条数据，格式：名称,编码,层级,父级编码（层级为 2 时填写父级编码，一级可留空）
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
              示例：<br />
              计量误差分析,KN-14,1,<br />
              计量误差分析·电压误差,KN-14-1,2,KN-14<br />
              计量误差分析·电流误差,KN-14-2,2,KN-14
            </div>
            <Textarea
              placeholder="在此粘贴批量导入数据..."
              className="min-h-32 font-mono text-sm"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>取消</Button>
            <Button onClick={handleBulkImport} disabled={!bulkText.trim()}>导入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Import Simulate Dialog */}
      <Dialog open={bulkSimDialogOpen} onOpenChange={setBulkSimDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>批量导入模拟</DialogTitle>
            <DialogDescription>
              自动生成指定数量的一级模拟知识点
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">生成数量</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={bulkSimCount}
                onChange={(e) => setBulkSimCount(Math.max(1, Math.min(50, parseInt(e.target.value || '1', 10))))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkSimDialogOpen(false)}>取消</Button>
            <Button onClick={handleBulkSim}>生成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
