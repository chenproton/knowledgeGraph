'use client'

import { useMemo, useState } from 'react'
import {
  BookOpen,
  ClipboardCheck,
  Trophy,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Clock,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  getStudentById,
  getCourseQuiz,
  getStudentLearningRecords,
  getStudentQuizRecords,
  getCourseById,
  getWeakAbilities,
  getAbilityCourses,
} from '@/lib/mock-data'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { StatCard } from '@/components/dashboard-kit'
import { cn } from '@/lib/utils'
import type { Quiz } from '@/lib/types'

const STUDENT_ID = 'stu-li'
const PASS_THRESHOLD = 0.6

function QuizDialog({
  quiz,
  open,
  onOpenChange,
}: {
  quiz: Quiz | undefined
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!quiz) return null

  const q = quiz.questions[currentIdx]
  const selected = answers[currentIdx]
  const score = quiz.questions.reduce((s, q, i) => s + (answers[i] === q.answer ? 1 : 0), 0)

  const handleSelect = (optIdx: number) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }))
  }

  const handleSubmit = () => {
    setSubmitted(true)
    toast.success('测试完成', {
      description: `得分：${score} / ${quiz.questions.length}`,
    })
  }

  const resetAndClose = () => {
    setCurrentIdx(0)
    setAnswers({})
    setSubmitted(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{submitted ? '测试结果' : '随堂测试'}</DialogTitle>
          <DialogDescription>
            {submitted
              ? `您已完成测试，得分 ${score} / ${quiz.questions.length}`
              : `第 ${currentIdx + 1} / ${quiz.questions.length} 题`}
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Trophy
                  className={cn(
                    'size-12',
                    score === quiz.questions.length ? 'text-amber-500' : 'text-indigo-500'
                  )}
                />
                <span className="text-2xl font-extrabold">
                  {score} / {quiz.questions.length}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {quiz.questions.map((qq, i) => (
                <div
                  key={qq.id}
                  className={cn(
                    'flex items-center gap-2 rounded-md border px-3 py-2 text-sm',
                    answers[i] === qq.answer
                      ? 'border-emerald-200 bg-emerald-50'
                      : 'border-red-200 bg-red-50'
                  )}
                >
                  {answers[i] === qq.answer ? (
                    <CheckCircle2 className="size-4 text-emerald-600" />
                  ) : (
                    <XCircle className="size-4 text-red-600" />
                  )}
                  <span className="flex-1 truncate">{qq.question}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {qq.options[qq.answer]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="font-medium">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <button
                  key={oi}
                  type="button"
                  onClick={() => handleSelect(oi)}
                  className={cn(
                    'w-full rounded-lg border px-4 py-3 text-left text-sm transition-colors',
                    selected === oi
                      ? 'border-indigo-500 bg-indigo-50 font-semibold text-indigo-700'
                      : 'hover:bg-muted/50'
                  )}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((i) => i - 1)}
              >
                上一题
              </Button>
              {currentIdx < quiz.questions.length - 1 ? (
                <Button
                  size="sm"
                  disabled={selected === undefined}
                  onClick={() => setCurrentIdx((i) => i + 1)}
                >
                  下一题
                </Button>
              ) : (
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-[#5b76e8] to-[#8c6ff0] text-white"
                  disabled={Object.keys(answers).length < quiz.questions.length}
                  onClick={handleSubmit}
                >
                  提交测试
                </Button>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={resetAndClose}>
            {submitted ? '关闭' : '取消'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function AssessmentPage() {
  const student = getStudentById(STUDENT_ID)
  const learningRecords = useMemo(() => getStudentLearningRecords(STUDENT_ID), [])
  const quizRecords = useMemo(() => getStudentQuizRecords(STUDENT_ID), [])
  const [quizDialogCourseId, setQuizDialogCourseId] = useState<string | null>(null)

  if (!student) return null

  const currentQuiz = quizDialogCourseId ? getCourseQuiz(quizDialogCourseId) : undefined

  const completedCourses = new Set(learningRecords.map((r) => r.courseId)).size
  const totalExams = quizRecords.length
  const passedExams = quizRecords.filter((r) => r.score >= Math.ceil(r.total * PASS_THRESHOLD)).length
  const passRate = totalExams > 0 ? `${Math.round((passedExams / totalExams) * 100)}%` : '-'

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#27b08a] to-[#54cf9d]" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">我的成效</h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              随堂自主测试，检验课程学习效果
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={completedCourses} label="已完成课程" tone="green" icon={<BookOpen className="size-7" />} />
        <StatCard value={totalExams} label="已完成考试" tone="blue" icon={<ClipboardCheck className="size-7" />} />
        <StatCard value={passRate} label="考试通过率" tone="purple" icon={<Trophy className="size-7" />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <GraduationCap className="size-4" /> 课程学习
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(() => {
              const weak = getWeakAbilities(STUDENT_ID).slice(0, 3)
              const reasons: Record<string, string> = {
                cu1: '单相电能表接线操作规范不足，现场执行中存在接线失误风险',
                cu2: '单相电能表拆装流程不熟悉，更换作业效率偏低',
                cu3: '低压三相直接表新装流程理解不深，安装调试步骤需加强',
                cu4: '低压带互感器三相表拆除安全措施掌握不牢',
                cu5: '低压带互感器三相表拆除后线头处理不规范',
                cu6: '低压互感器新装作业中互感器变比配置容易出错',
                cu7: '高压三相表新装需强化安全操作流程',
                cu8: '高压互感器接线与检查中对极性校验不熟练',
                cu9: '采集设备参数配置步骤不熟悉，通信调试易出问题',
                cu10: '采集设备调试中对异常数据判断经验不足',
                cu11: '低压单表位表箱拆除时用户沟通环节易遗漏',
                cu12: '低压多表位表箱新装作业中安装位置规划需优化',
                cu13: '低压用户普查时信息采集条目易遗漏',
                cu14: '专变用户普查中对设备参数核对不够细致',
                cu15: '安全组织措施执行不到位，现场安全防护需加强',
                cu16: '通用作业中导线压接质量不稳定，需规范操作手法',
              }
              return weak.map((w) => {
                const courses = getAbilityCourses(w.abilityId).slice(0, 2)
                return (
                  <div key={w.abilityId} className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50/50 to-purple-50/30 p-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-700">AI 诊断</span>
                    </div>
                    <p className="mt-1 text-sm font-semibold">{w.abilityName}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{reasons[w.abilityId] || `${w.abilityName}方面存在不足，建议针对性学习`}</p>
                    {courses.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {courses.map((c) => {
                          const qr = quizRecords.find((r) => r.courseId === c.id)
                          const passScore = Math.ceil(3 * PASS_THRESHOLD)
                          const passed = qr ? qr.score >= passScore : null
                          return (
                            <div key={c.id} className="flex items-center justify-between rounded-md border bg-white px-3 py-2">
                              <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium">{c.title}</div>
                                <div className="text-[10px] text-muted-foreground">{c.duration}</div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {qr && (
                                  <Badge variant={passed ? 'default' : 'destructive'} className="text-[10px]">
                                    {passed ? '已通过' : '未通过'}
                                  </Badge>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-6 gap-1 text-[10px]"
                                  onClick={() => setQuizDialogCourseId(c.id)}
                                >
                                  <ClipboardCheck className="size-2.5" /> 测试
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })
            })()}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 lg:col-span-1">
          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <ClipboardCheck className="size-4" /> 考试记录
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[280px]">
              {quizRecords.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">暂无考试记录</div>
              ) : (
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-1 font-medium">考试名称</th>
                      <th className="pb-1 text-right font-medium">得分</th>
                      <th className="pb-1 text-right font-medium">通过</th>
                      <th className="pb-1 text-right font-medium">时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizRecords.map((r) => {
                      const course = getCourseById(r.courseId)
                      const passScore = Math.ceil(r.total * PASS_THRESHOLD)
                      const passed = r.score >= passScore
                      return (
                        <tr key={r.id} className="border-b last:border-0">
                          <td className="py-1 pr-2">
                            <span className="line-clamp-1">{course?.title || r.courseId}</span>
                          </td>
                          <td className="py-1 text-right font-medium">{r.score}/{r.total}</td>
                          <td className="py-1 text-center">
                            {passed ? (
                              <CheckCircle2 className="inline-block size-3 text-emerald-500" />
                            ) : (
                              <XCircle className="inline-block size-3 text-red-400" />
                            )}
                          </td>
                          <td className="py-1 text-right font-mono">{r.date}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          <Card className="flex-1 overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Clock className="size-4" /> 学习记录
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[280px]">
              {learningRecords.length === 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">暂无学习记录</div>
              ) : (
                <div className="space-y-1.5">
                  {learningRecords.sort((a, b) => b.date.localeCompare(a.date)).map((r, idx) => {
                    const course = getCourseById(r.courseId)
                    return (
                      <div key={`${r.courseId}-${idx}`} className="flex items-center justify-between rounded-md border px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-medium truncate">{course?.title || r.courseId}</div>
                        </div>
                        <span className="ml-2 shrink-0 text-[10px] font-mono text-muted-foreground">{r.date}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <QuizDialog
        quiz={currentQuiz}
        open={!!quizDialogCourseId}
        onOpenChange={(o) => !o && setQuizDialogCourseId(null)}
      />
    </div>
  )
}
