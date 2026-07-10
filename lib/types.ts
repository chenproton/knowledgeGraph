export type Role = 'student' | 'admin'

export type Dimension = '数量' | '质量' | '安全' | '规范' | '效率'
export const DIMENSIONS: Dimension[] = ['数量', '质量', '安全', '规范', '效率']

// 岗位
export type Position = {
  id: string
  name: string
  code: string
}

// 能力领域（原工单，全局改名）
export type CapabilityDomain = {
  id: string
  name: string
  code: string
  positionId: string
  unitIds: string[] // 关联能力单元
  taskDescription: string
  standardDuration: string
  riskDeductionRules: string
  scoreRules: string
  // 工单对接字段
  type: '计量采集装置新装' | '计量采集装置更换' | '计量采集装置拆除' | '计量采集装置普查'
  batchGroup: string
  creator: string
  createTime: string
  version: number
}

// 能力单元（原能力单元，全局改名）
export type CapabilityUnit = {
  id: string
  name: string
  code: string
  domainId: string // 关联能力领域
  description?: string
  baseline: number
  knowledgeIds: string[]
  assessmentConfig: AssessmentConfig
}

// 五维考核标准表
export type AssessmentConfig = {
  workload: { workorderTaskName: string; unit: string }[]
  quality: { workorderTaskName: string; baseScore: number; issueType: string; issueItems: string }[]
  efficiency: { workorderTaskName: string; processingTime: string }[]
  compliance: { workorderTaskName: string; equipmentIssue: string; toolIssue: string }[]
  safety: { workorderTaskName: string; type: string; level: string; deduction: string }[]
}

// ==================== 知识点（支持多级树） ====================
export type KnowledgePoint = {
  id: string
  name: string
  code: string
  level: number
  parentId?: string
  abilityIds: string[] // 兼容旧引用
  capabilityUnitIds: string[]
  courseIds: string[]
}

// 教材/课件/课程
export type CourseType = 'course' | 'material' | 'quiz'

export type Course = {
  id: string
  title: string
  type: CourseType
  duration: string
  knowledgeIds: string[]
  parentId?: string
  description?: string
}

// 学习路径分组
export type LearningPathGroup = {
  id: string
  title: string
  intro: string
  courseIds: string[]
}

// 学生
export type Student = {
  id: string
  name: string
  positionIds: string[]
  department: string
  joinDate: string
}

// 学生能力单元分数
export type StudentAbilityScore = {
  studentId: string
  positionId: string
  abilityId: string
  date: string
  score: number
  source?: 'workorder' | 'learning' | 'carry'
}

// ==================== 领域六级层级 ====================

export type DeductionRecord = {
  id: string
  name: string
  dimension: Dimension
  points: number
  abilityId: string
}

export type WorkorderProblem = {
  id: string
  name: string
  type: string
  deductions: DeductionRecord[]
}

export type WorkorderTask = {
  id: string
  name: string
  category: string
  problems: WorkorderProblem[]
}

// 学生领域执行记录
export type StudentWorkorderRecord = {
  studentId: string
  workorderId: string
  date: string
  dimensionScore: Record<Dimension, number>
  abilityId: string
  scoreImpact: number
  tasks?: WorkorderTask[]
}

// 学生学习记录
export type StudentLearningRecord = {
  studentId: string
  courseId: string
  date: string
  score?: number
}

// ==================== 学习评测 ====================

export type QuizQuestion = {
  id: string
  question: string
  options: string[]
  answer: number
}

export type Quiz = {
  id: string
  courseId: string
  questions: QuizQuestion[]
}

export type StudentQuizRecord = {
  id: string
  studentId: string
  courseId: string
  date: string
  score: number
  total: number
}

// ==================== 成效评估 ====================

export type EffectivenessReport = {
  abilityId: string
  abilityName: string
  before: { frequency: number; deduction: number }
  after: { frequency: number; deduction: number }
  dimensionDeltas: Record<Dimension, number>
}

export type SkillStability = {
  abilityId: string
  abilityName: string
  repeatCount: number
  totalDeduction: number
  stabilityScore: number
}

export type Recommendation = {
  id: string
  studentId: string
  abilityId: string
  reason: string
  courseIds: string[]
  createdDate: string
  status: 'pending' | 'in_progress' | 'completed'
}

// ==================== 知识图谱 ====================

export type GraphNode = {
  id: string
  label: string
  type: 'position' | 'domain' | 'unit' | 'knowledge' | 'course'
  level?: number
}

export type GraphEdge = { source: string; target: string }

// 完整 mock 数据
export type MockData = {
  positions: Position[]
  capabilityDomains: CapabilityDomain[]
  capabilityUnits: CapabilityUnit[]
  knowledgePoints: KnowledgePoint[]
  courses: Course[]
  students: Student[]
  scores: StudentAbilityScore[]
  workorderRecords: StudentWorkorderRecord[]
  learningRecords: StudentLearningRecord[]
}

// 工单同步记录
export type WorkorderSyncRecord = {
  id: string
  domainId: string
  date: string
  studentName: string
  department: string
  dimensionScores: Record<Dimension, number>
  status: '正常' | '异常' | '待审核'
}

// ==================== 向后兼容别名 ====================
export type Workorder = CapabilityDomain
export type AbilityPoint = CapabilityUnit
