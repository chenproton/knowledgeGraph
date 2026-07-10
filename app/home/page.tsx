'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles,
  ClipboardCheck,
  BookOpen,
  Image as ImageIcon,
  Video,
  GraduationCap,
  Plus,
  Mic,
  Send,
  Circle,
  CheckCircle2,
  Clock,
  Play,
  ArrowRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { StudentHomeSidebar } from '@/components/student-home-sidebar'
import {
  HistoryContent,
  DiagnosisContent,
  KnowledgeGraphContent,
  LearningContent,
  AssessmentContent,
  ProfileContent,
} from '@/components/tab-contents'

const STATS = [
  { value: '26', label: '完成工单数', tag: '工单分析', color: 'blue' as const },
  { value: '36h', label: '学习时长', color: 'green' as const },
  { value: '30', label: '已完成课程数', color: 'orange' as const },
  { value: '15/20', label: '岗位排名', sub: '本单位（供电所）', color: 'teal' as const },
  { value: '20分钟', label: '平均作业时长', sub: '班组平均15分钟', color: 'blue' as const },
  { value: '78%', label: '工单合格率', sub: '班组平均84%', color: 'red' as const },
]

const COLOR_STYLE: Record<
  string,
  { text: string; border: string; light: string }
> = {
  blue:   { text: 'text-blue-600',   border: 'border-blue-200',   light: 'bg-blue-50' },
  green:  { text: 'text-emerald-600',border: 'border-emerald-200',light: 'bg-emerald-50' },
  orange: { text: 'text-amber-600',  border: 'border-amber-200',  light: 'bg-amber-50' },
  teal:   { text: 'text-cyan-600',   border: 'border-cyan-200',   light: 'bg-cyan-50' },
  red:    { text: 'text-rose-600',   border: 'border-rose-200',   light: 'bg-rose-50' },
}

const SUGGESTIONS = [
  ['资讯：全国电力行业职业技能竞赛（装表接电工）', '单相智能电表的更换流程标准'],
  ['营销现场作业安全规范', '如何区分线缆的型号', '三相四线电表更换的视频', '电能表更换的三维仿真课程'],
  ['三相四线电表标准化作业指导', '计量现场施工的现场工作安全', '电力安全操作规程'],
]

const QUICK_ACTIONS = [
  { label: '智识问答', icon: BookOpen },
  { label: '图像智询', icon: ImageIcon },
  { label: '视频智询', icon: Video },
  { label: '课程智询', icon: GraduationCap },
]

type TabKey = 'home' | 'history' | 'diagnosis' | 'knowledge-graph' | 'learning' | 'assessment' | 'profile'

const PERSONAL_TABS: { label: string; key: TabKey }[] = [
  { label: 'AI 工作台', key: 'home' },
]

const LEARNING_TABS: { label: string; key: TabKey }[] = [
  { label: '成效分析', key: 'profile' },
  { label: '知识图谱', key: 'knowledge-graph' },
  { label: '学习推荐', key: 'learning' },
  { label: '学习评测', key: 'assessment' },
]

export default function StudentHomePage() {
  const searchParams = useSearchParams()
  const link = (path: string) => {
    const q = searchParams.toString()
    return q ? `${path}?${q}` : path
  }

  const [section, setSection] = useState<'personal' | 'learning'>('personal')
  const [activeTab, setActiveTab] = useState<TabKey>('home')
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month')
  const [pendingAbilityId, setPendingAbilityId] = useState<string | null>(null)

  const TABS = section === 'personal' ? PERSONAL_TABS : LEARNING_TABS

  const handleMenuSelect = (label: string) => {
    switch (label) {
      case '个人课堂':
        setSection('personal')
        setActiveTab('home')
        break
      case '学习成效':
        setSection('learning')
        setActiveTab('profile')
        break
    }
  }

  const PERIODS = [
    { key: 'week' as const, label: '本周' },
    { key: 'month' as const, label: '本月' },
    { key: 'year' as const, label: '全年' },
  ]

  return (
    <div className="flex h-full w-full">
      <StudentHomeSidebar onMenuSelect={handleMenuSelect} />
      <main className="flex flex-1 flex-col bg-background">
        {/* 顶部标签栏 */}
        <div className="flex shrink-0 items-center overflow-x-auto border-b px-6">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  '-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="flex h-full w-full flex-col gap-5 overflow-auto pt-6 px-6 pb-8">
          {/* 顶部双卡片 */}
          {activeTab === 'home' && (
            <div className="mx-auto w-full max-w-4xl">
          <div className="grid shrink-0 grid-cols-1 gap-4 xl:grid-cols-2">

            {/* 左侧 - 潜力新人 */}
            <div className="flex flex-col rounded-xl border bg-card shadow-sm">
              <div className="px-5 pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-semibold">潜力新人</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      基于工单数据及学习情况，为你生成专属能力评估
                    </p>
                    <div className="mt-2.5 inline-flex gap-0.5 rounded-lg bg-muted p-0.5">
                      {PERIODS.map((p) => (
                        <button
                          key={p.key}
                          onClick={() => setPeriod(p.key)}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                            period === p.key
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground hover:text-foreground'
                          )}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="h-7 shrink-0 gap-1 rounded-full bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] px-3 text-xs"
                  >
                    <ClipboardCheck className="size-3" />
                    AI测评
                  </Button>
                </div>
              </div>
              <div className="px-5 pb-5 pt-4">
                <div className="grid grid-cols-3 gap-2.5">
                  {STATS.map((stat) => {
                    const style = COLOR_STYLE[stat.color]
                    return (
                      <div
                        key={stat.label}
                        className={cn(
                          'flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-3 text-center ring-1 ring-inset ring-foreground/[0.06]',
                          style.light
                        )}
                      >
                        <span className={cn('text-xl font-bold tracking-tight', style.text)}>
                          {stat.value}
                        </span>
                        <div className="text-[11px] leading-tight text-muted-foreground">
                          <div>{stat.label}</div>
                          {stat.sub && <div className="text-[10px] opacity-70">{stat.sub}</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 右侧 - AI推荐课程 */}
            <div className="flex flex-col rounded-xl border bg-card shadow-sm">
              <div className="px-5 pt-5">
                <h3 className="text-base font-semibold">AI推荐课程</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  系统根据你的技能短板，智能生成以下
                  <Link href={link('/learning')} className="ml-0.5 font-medium text-primary hover:underline">
                    学习路径
                  </Link>
                </p>
              </div>
              <div className="px-5 pt-4 pb-5">
                <div className="rounded-xl bg-gradient-to-r from-[#5b76e8]/8 to-[#8c6ff0]/8 p-3.5 ring-1 ring-inset ring-primary/10">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-7 items-center justify-center rounded-full bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0]">
                        <Play className="size-3.5 fill-white text-white" />
                      </span>
                      <div>
                        <div className="text-sm font-semibold">装表接电入门专题</div>
                        <div className="mt-0.5 flex items-center gap-1.5">
                          <Badge variant="outline" className="rounded border-blue-200 bg-blue-50 px-1.5 text-[10px] text-blue-600">AI生成</Badge>
                          <Badge variant="outline" className="rounded border-sky-200 bg-sky-50 px-1.5 text-[10px] text-sky-600">考试</Badge>
                          <Badge variant="outline" className="rounded border-amber-200 bg-amber-50 px-1.5 text-[10px] text-amber-600">视频</Badge>
                        </div>
                      </div>
                    </div>
                    <Link href={link('/learning')}>
                      <Button size="sm" className="h-7 gap-1 rounded-full bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] px-3 text-xs">
                        开始学习
                        <ArrowRight className="size-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="mt-3 space-y-0.5">
                  {[
                    { title: '安全风险专题学习', status: '已完成', icon: CheckCircle2, iconCls: 'text-emerald-500 bg-emerald-50', statusCls: 'bg-emerald-50 text-emerald-600' },
                    { title: '装表接电理论知识', status: '学习中', icon: Clock, iconCls: 'text-blue-500 bg-blue-50', statusCls: 'bg-blue-50 text-blue-600' },
                    { title: '装表接电接线教学', status: null, icon: Circle, iconCls: 'text-muted-foreground/40 bg-muted', statusCls: '' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={cn('flex size-5 items-center justify-center rounded-full', item.iconCls)}>
                          <item.icon className="size-3" />
                        </span>
                        <span className="text-sm font-medium">{item.title}</span>
                      </div>
                      {item.status ? (
                        <Badge className={cn('rounded-full px-2 py-0 text-xs font-normal', item.statusCls)}>
                          {item.status}
                        </Badge>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI 对话区 */}
          <div className="flex flex-col items-center justify-center gap-5 py-12">
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex items-center gap-2.5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0]">
                  <Sparkles className="size-5 text-white" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">有什么我能帮你的吗？</h2>
              </div>
              <p className="text-sm text-muted-foreground">可以尝试询问以下问题</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.flatMap((row) => row).map((text) => (
                <Button
                  key={text}
                  variant="ghost"
                  size="sm"
                  className="h-auto rounded-2xl bg-muted/50 px-4 py-2 text-sm font-normal text-foreground transition-colors hover:bg-muted"
                >
                  {text}
                </Button>
              ))}
            </div>
          </div>

          {/* 底部输入栏 */}
          <div className="mx-auto w-full max-w-4xl shrink-0 pb-4">
            <div className="rounded-2xl border bg-card p-4 shadow-md">
              <Input
                placeholder="问问AI数字培训师"
                className="h-10 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
              <div className="mt-3 flex items-center gap-1.5">
                <Button variant="ghost" size="icon" className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground">
                  <Plus className="size-4" />
                </Button>
                <div className="flex flex-1 items-center gap-1 overflow-x-auto">
                  {QUICK_ACTIONS.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      size="sm"
                      className="h-7 gap-1.5 whitespace-nowrap rounded-full border-muted-foreground/20 px-3 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <action.icon className="size-3.5" />
                      {action.label}
                    </Button>
                  ))}
                </div>
                <Button variant="ghost" size="icon" className="size-7 shrink-0 rounded-full text-muted-foreground hover:text-foreground">
                  <Mic className="size-4" />
                </Button>
                <Button size="icon" className="size-7 shrink-0 rounded-full bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white shadow-sm">
                  <Send className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
            </div>
          )}

          {activeTab === 'history' && <HistoryContent />}
          {activeTab === 'diagnosis' && <DiagnosisContent />}
          {activeTab === 'knowledge-graph' && <KnowledgeGraphContent />}
          {activeTab === 'learning' && <LearningContent key={pendingAbilityId} defaultAbilityId={pendingAbilityId} />}
          {activeTab === 'assessment' && <AssessmentContent />}
          {activeTab === 'profile' && <ProfileContent onNavigate={(id) => { setPendingAbilityId(id); setActiveTab('learning') }} />}

        </div>
      </main>
    </div>
  )
}
