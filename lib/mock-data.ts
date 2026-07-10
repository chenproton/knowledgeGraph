import type {
  Position,
  KnowledgePoint,
  Course,
  Student,
  StudentAbilityScore,
  StudentWorkorderRecord,
  StudentLearningRecord,
  Recommendation,
  Dimension,
  WorkorderTask,
  WorkorderProblem,
  DeductionRecord,
  Quiz,
  StudentQuizRecord,
  EffectivenessReport,
  SkillStability,
  CapabilityDomain,
  CapabilityUnit,
  AssessmentConfig,
  WorkorderSyncRecord,
  GraphNode,
  GraphEdge,
  LearningPathGroup,
} from './types'
export type { GraphNode, GraphEdge } from './types'
import { DIMENSIONS } from './types'

// ==================== 基础数据 ====================

export const POSITIONS: Position[] = [
  { id: 'pos1', name: '装表接电', code: 'POS-01' },
]

// ==================== 能力诊断模型 ====================

export const CAPABILITY_DOMAINS: CapabilityDomain[] = [
  {
    id: 'cd1', name: '计量采集装置更换', code: 'CD-001', positionId: 'pos1',
    unitIds: ['cu1', 'cu2', 'cu3', 'cu15', 'cu16'],
    taskDescription: '完成低压三相直接电能表新装作业，包括现场勘查、设备安装、接线、调试及验收记录填写。',
    standardDuration: '2.5 小时',
    riskDeductionRules: '未执行安全措施扣 20 分；操作不规范扣 10 分；遗漏验收项扣 5 分',
    scoreRules: '按时完成 +10 分；一次验收通过 +15 分；用户有效投诉扣 10 分',
    type: '计量采集装置新装', batchGroup: '批次2026-Q3-01', creator: '张工', createTime: '2026-05-10', version: 1,
  },
  {
    id: 'cd2', name: '计量采集装置新装', code: 'CD-002', positionId: 'pos1',
    unitIds: ['cu1', 'cu2', 'cu16'],
    taskDescription: '完成单相电能表更换作业，包括旧表拆除、新表安装、接线检查及送电验收。',
    standardDuration: '1.0 小时',
    riskDeductionRules: '未断电操作扣 30 分；接线错误扣 15 分；未核对表号扣 5 分',
    scoreRules: '一次更换成功 +10 分；接线复查合格 +8 分；未按时完成扣 5 分',
    type: '计量采集装置更换', batchGroup: '批次2026-Q3-01', creator: '张工', createTime: '2026-05-10', version: 1,
  },
  {
    id: 'cd3', name: '计量采集装置拆除', code: 'CD-003', positionId: 'pos1',
    unitIds: ['cu4', 'cu5', 'cu6', 'cu15', 'cu16'],
    taskDescription: '完成低压带互感器三相电能表拆除作业，包括断电确认、设备拆除、线头绝缘处理及现场清理。',
    standardDuration: '1.5 小时',
    riskDeductionRules: '未验电扣 25 分；拆除过程中损坏设备扣 20 分；线头未绝缘处理扣 15 分',
    scoreRules: '安全拆除完成 +10 分；线头防护到位 +8 分；现场清理合格 +5 分',
    type: '计量采集装置拆除', batchGroup: '批次2026-Q3-02', creator: '李工', createTime: '2026-06-02', version: 1,
  },
  {
    id: 'cd4', name: '专变用户计量普查', code: 'CD-004', positionId: 'pos1',
    unitIds: ['cu13', 'cu14'],
    taskDescription: '完成专变用户现场普查与信息核对，包括计量装置信息采集、现场照片拍摄及数据录入。',
    standardDuration: '3.0 小时',
    riskDeductionRules: '未核对用户身份扣 10 分；漏查设备扣 15 分；数据录入错误扣 10 分',
    scoreRules: '按计划完成普查 +8 分；数据准确率 100% +12 分；发现并上报隐患 +10 分',
    type: '计量采集装置普查', batchGroup: '批次2026-Q3-02', creator: '李工', createTime: '2026-06-02', version: 1,
  },
  {
    id: 'cd5', name: '高压三相电能表新装', code: 'CD-005', positionId: 'pos1',
    unitIds: ['cu7', 'cu8', 'cu15'],
    taskDescription: '完成高压三相电能表新装作业，包括高压设备停电确认、互感器安装、电能表接线及保护调试。',
    standardDuration: '4.0 小时',
    riskDeductionRules: '未执行停电安全措施扣 30 分；接线相序错误扣 20 分；未做保护校验扣 15 分',
    scoreRules: '一次送电成功 +15 分；验收合格 +10 分；安全记录完好 +10 分',
    type: '计量采集装置新装', batchGroup: '批次2026-Q3-03', creator: '王工', createTime: '2026-06-15', version: 1,
  },
  {
    id: 'cd6', name: '计量装置普查', code: 'CD-006', positionId: 'pos1',
    unitIds: ['cu9', 'cu10'],
    taskDescription: '完成采集设备更换作业，包括旧设备拆除、新设备安装、参数配置及通信调试。',
    standardDuration: '1.5 小时',
    riskDeductionRules: '调试不成功扣 15 分；参数配置错误扣 10 分；未做数据备份扣 5 分',
    scoreRules: '通信调试成功 +10 分；数据上传正常 +8 分；参数记录完整 +5 分',
    type: '计量采集装置更换', batchGroup: '批次2026-Q3-03', creator: '王工', createTime: '2026-06-15', version: 1,
  },
  {
    id: 'cd7', name: '低压单表位表箱拆除', code: 'CD-007', positionId: 'pos1',
    unitIds: ['cu11', 'cu12'],
    taskDescription: '完成低压单表位表箱拆除作业，包括断电确认、表箱拆除、线路封堵及用户通知。',
    standardDuration: '1.0 小时',
    riskDeductionRules: '未通知用户扣 10 分；带电拆除扣 25 分；线路裸接头未封堵扣 15 分',
    scoreRules: '安全拆除完成 +10 分；线头封堵到位 +8 分；用户确认签收 +5 分',
    type: '计量采集装置拆除', batchGroup: '批次2026-Q4-01', creator: '赵工', createTime: '2026-07-01', version: 1,
  },
  {
    id: 'cd8', name: '计量装置巡视', code: 'CD-008', positionId: 'pos1',
    unitIds: ['cu17', 'cu18'],
    taskDescription: '完成低压用户现场普查与信息核对，包括表计信息核对、封印检查、现场照片及数据录入。',
    standardDuration: '2.0 小时',
    riskDeductionRules: '未核对用户信息扣 8 分；封印未检查扣 10 分；拍摄不清晰扣 5 分',
    scoreRules: '按计划完成普查 +8 分；数据完整率 100% +10 分；发现异常上报 +10 分',
    type: '计量采集装置普查', batchGroup: '批次2026-Q4-01', creator: '赵工', createTime: '2026-07-01', version: 1,
  },
]

function buildAssessmentConfig(domainId: string): AssessmentConfig {
  const domain = CAPABILITY_DOMAINS.find((d) => d.id === domainId)
  const wtName = domain?.name ?? '未知'
  const isInstall = domain?.type === '计量采集装置新装'
  const isReplace = domain?.type === '计量采集装置更换'
  const isSurvey = domain?.type === '计量采集装置普查'

  const workload = [
    { workorderTaskName: '计量采集装置新装', unit: '设备数/只' },
    { workorderTaskName: '计量采集装置更换', unit: '设备数/只' },
    { workorderTaskName: '计量采集装置拆除', unit: '设备数/只' },
  ]

  const quality = [
    { workorderTaskName: wtName, baseScore: 4, issueType: '接线错误', issueItems: '1.接线错误，扣1.6分；' },
    { workorderTaskName: wtName, baseScore: 4, issueType: '安装工艺不规范', issueItems: '2.安装工艺不规范，扣0.8分；' },
    { workorderTaskName: wtName, baseScore: 4, issueType: '表计安装串户', issueItems: '3.表计安装串户，扣1.6分；' },
    { workorderTaskName: wtName, baseScore: 4, issueType: isInstall || isReplace ? '新装后采集失败' : '拆除后数据异常', issueItems: `4.${isInstall || isReplace ? '新装后采集失败' : '拆除后数据异常'}，扣0.8分；` },
  ]

  if (isSurvey) {
    quality.push(
      { workorderTaskName: wtName, baseScore: 4, issueType: '数据录入错误', issueItems: '5.数据录入错误，扣1.0分；' },
      { workorderTaskName: wtName, baseScore: 4, issueType: '普查遗漏', issueItems: '6.普查遗漏，扣1.2分；' },
    )
  }

  const efficiency = [
    { workorderTaskName: wtName, processingTime: isSurvey ? '5天' : '3天' },
  ]

  const compliance = [
    { workorderTaskName: wtName, equipmentIssue: 'nan', toolIssue: 'nan' },
    { workorderTaskName: wtName, equipmentIssue: 'nan', toolIssue: 'nan' },
    { workorderTaskName: wtName, equipmentIssue: 'nan', toolIssue: 'nan' },
    { workorderTaskName: wtName, equipmentIssue: 'nan', toolIssue: 'nan' },
  ]

  const safety = [
    { workorderTaskName: wtName, type: '安全问题', level: '安全问题', deduction: '1' },
    { workorderTaskName: wtName, type: '安全问题', level: '一般违章', deduction: '10' },
    { workorderTaskName: wtName, type: '安全问题', level: '严重违章', deduction: '扣当月全部积分或100分' },
    { workorderTaskName: wtName, type: '服务问题', level: '有责诉求', deduction: '3' },
    { workorderTaskName: wtName, type: '服务问题', level: '三类过错', deduction: '50' },
    { workorderTaskName: wtName, type: '服务问题', level: '二类过错', deduction: '80' },
    { workorderTaskName: wtName, type: '服务问题', level: '一类过错', deduction: '100' },
    { workorderTaskName: wtName, type: '服务问题', level: '4类事件', deduction: '扣当月全部积分或100分' },
    { workorderTaskName: wtName, type: '廉政问题', level: '廉政问题', deduction: '100' },
  ]

  return { workload, quality, efficiency, compliance, safety }
}

export const CAPABILITY_UNITS: CapabilityUnit[] = [
  {
    id: 'cu1', name: '单相表新装能力', code: 'CU-001', domainId: 'cd2',
    description: '完成单相电能表新装作业', baseline: 75,
    knowledgeIds: ['k-sp', 'k-sp-1', 'k-sp-2'],
    assessmentConfig: buildAssessmentConfig('cd2'),
  },
  {
    id: 'cu2', name: '单相表更换能力', code: 'CU-002', domainId: 'cd2',
    description: '完成单相电能表更换作业', baseline: 75,
    knowledgeIds: ['k-sp', 'k-sp-1', 'k-sp-2'],
    assessmentConfig: buildAssessmentConfig('cd2'),
  },
  {
    id: 'cu3', name: '低压三相直接表新装能力', code: 'CU-003', domainId: 'cd1',
    description: '完成低压三相直接表新装作业', baseline: 75,
    knowledgeIds: ['k-lv3d', 'k-lv3d-1', 'k-lv3d-2'],
    assessmentConfig: buildAssessmentConfig('cd1'),
  },
  {
    id: 'cu4', name: '低压带互感器三相表新装能力', code: 'CU-004', domainId: 'cd3',
    description: '完成低压带互感器三相表新装作业', baseline: 80,
    knowledgeIds: ['k-lv3ct', 'k-lv3ct-1', 'k-lv3ct-2'],
    assessmentConfig: buildAssessmentConfig('cd3'),
  },
  {
    id: 'cu5', name: '低压带互感器的三相表更换能力', code: 'CU-005', domainId: 'cd3',
    description: '完成低压带互感器三相表拆除作业', baseline: 75,
    knowledgeIds: ['k-lv3ct', 'k-lv3ct-1', 'k-lv3ct-2'],
    assessmentConfig: buildAssessmentConfig('cd3'),
  },
  {
    id: 'cu6', name: '低压互感器新装能力', code: 'CU-006', domainId: 'cd3',
    description: '完成低压互感器新装作业', baseline: 80,
    knowledgeIds: ['k-lvct', 'k-lvct-1', 'k-lvct-2'],
    assessmentConfig: buildAssessmentConfig('cd3'),
  },
  {
    id: 'cu7', name: '高压三相表新装能力', code: 'CU-007', domainId: 'cd5',
    description: '完成高压三相表新装作业', baseline: 85,
    knowledgeIds: ['k-hv3', 'k-hv3-1', 'k-hv3-2'],
    assessmentConfig: buildAssessmentConfig('cd5'),
  },
  {
    id: 'cu8', name: '高压互感器接线能力', code: 'CU-008', domainId: 'cd5',
    description: '完成高压互感器接线与检查', baseline: 85,
    knowledgeIds: ['k-hvct', 'k-hvct-1', 'k-hvct-2'],
    assessmentConfig: buildAssessmentConfig('cd5'),
  },
  {
    id: 'cu9', name: '低压单表位表箱更换能力', code: 'CU-009', domainId: 'cd6',
    description: '完成采集设备新装作业', baseline: 75,
    knowledgeIds: ['k-acq', 'k-acq-1', 'k-acq-2'],
    assessmentConfig: buildAssessmentConfig('cd6'),
  },
  {
    id: 'cu10', name: '采集设备调试能力', code: 'CU-010', domainId: 'cd6',
    description: '完成采集设备参数配置与调试', baseline: 75,
    knowledgeIds: ['k-acq', 'k-acq-1', 'k-acq-2'],
    assessmentConfig: buildAssessmentConfig('cd6'),
  },
  {
    id: 'cu11', name: '低压单表位表箱拆除能力', code: 'CU-011', domainId: 'cd7',
    description: '完成低压单表位表箱拆除作业', baseline: 70,
    knowledgeIds: ['k-box', 'k-box-1', 'k-box-2'],
    assessmentConfig: buildAssessmentConfig('cd7'),
  },
  {
    id: 'cu12', name: '低压多表位表箱新装能力', code: 'CU-012', domainId: 'cd7',
    description: '完成低压多表位表箱新装作业', baseline: 75,
    knowledgeIds: ['k-box', 'k-box-1', 'k-box-2'],
    assessmentConfig: buildAssessmentConfig('cd7'),
  },
  {
    id: 'cu13', name: '低压多表位表箱更换能力', code: 'CU-013', domainId: 'cd4',
    description: '完成低压用户现场普查与信息核对', baseline: 70,
    knowledgeIds: ['k-survey', 'k-survey-1', 'k-survey-2'],
    assessmentConfig: buildAssessmentConfig('cd4'),
  },
  {
    id: 'cu14', name: '专变用户普查能力', code: 'CU-014', domainId: 'cd4',
    description: '完成专变用户现场普查与信息核对', baseline: 75,
    knowledgeIds: ['k-survey', 'k-survey-1', 'k-survey-2'],
    assessmentConfig: buildAssessmentConfig('cd4'),
  },
  {
    id: 'cu15', name: '煤改电普查能力', code: 'CU-015', domainId: 'cd1',
    description: '落实现场作业安全组织措施', baseline: 85,
    knowledgeIds: ['k-safety', 'k-safety-1', 'k-safety-2'],
    assessmentConfig: buildAssessmentConfig('cd1'),
  },
  {
    id: 'cu16', name: '低压互感器新装能力', code: 'CU-016', domainId: 'cd1',
    description: '完成导线剥皮、压接与连接等通用作业', baseline: 75,
    knowledgeIds: ['k-common', 'k-common-1', 'k-common-2'],
    assessmentConfig: buildAssessmentConfig('cd1'),
  },
  {
    id: 'cu17', name: '单相表更换能力', code: 'CU-017', domainId: 'cd8',
    description: '完成低压用户现场普查与信息核对', baseline: 70,
    knowledgeIds: ['k-survey', 'k-survey-1', 'k-survey-2'],
    assessmentConfig: buildAssessmentConfig('cd8'),
  },
  {
    id: 'cu18', name: '变电站普查能力', code: 'CU-018', domainId: 'cd8',
    description: '完成普查数据录入、审核与上报', baseline: 70,
    knowledgeIds: ['k-survey', 'k-survey-1', 'k-survey-2'],
    assessmentConfig: buildAssessmentConfig('cd8'),
  },
]

// ==================== 知识点 & 课程（按能力域均匀生成，全覆盖、不富集） ====================

type UnitGroup = { key: string; name: string; unitIds: string[]; abilityIds: string[] }

const UNIT_GROUPS: UnitGroup[] = [
  { key: 'sp', name: '单相电能表', unitIds: ['cu1', 'cu2'], abilityIds: ['ab1', 'ab2', 'ab3', 'ab4', 'ab5'] },
  { key: 'lv3d', name: '低压三相直接表', unitIds: ['cu3'], abilityIds: ['ab6', 'ab7', 'ab8', 'ab9', 'ab10'] },
  { key: 'lv3ct', name: '低压带互感器三相表', unitIds: ['cu4', 'cu5'], abilityIds: ['ab11', 'ab12', 'ab13', 'ab14', 'ab15'] },
  { key: 'hv3', name: '高压三相表', unitIds: ['cu7'], abilityIds: ['ab16', 'ab17', 'ab18', 'ab19', 'ab20'] },
  { key: 'lvct', name: '低压互感器', unitIds: ['cu6'], abilityIds: ['ab21', 'ab22', 'ab23', 'ab24', 'ab25'] },
  { key: 'hvct', name: '高压互感器', unitIds: ['cu8'], abilityIds: ['ab26', 'ab27', 'ab28', 'ab29', 'ab30'] },
  { key: 'box', name: '计量表箱', unitIds: ['cu11', 'cu12'], abilityIds: ['ab31', 'ab32', 'ab33', 'ab34', 'ab35', 'ab36'] },
  { key: 'acq', name: '采集设备', unitIds: ['cu9', 'cu10'], abilityIds: ['ab37', 'ab38', 'ab39', 'ab40'] },
  { key: 'survey', name: '用户普查', unitIds: ['cu13', 'cu14', 'cu17', 'cu18'], abilityIds: ['ab41', 'ab42', 'ab43', 'ab44'] },
  { key: 'safety', name: '安全与规范', unitIds: ['cu15'], abilityIds: ['ab45', 'ab46', 'ab47', 'ab48', 'ab49'] },
  { key: 'common', name: '通用计量作业', unitIds: ['cu16'], abilityIds: ['ab50', 'ab51', 'ab52', 'ab53', 'ab54', 'ab55'] },
]

const KP_ASPECTS = ['作业工艺', '接线与验收']

function buildKnowledgeAndCourses(): { knowledge: KnowledgePoint[]; courses: Course[] } {
  const knowledge: KnowledgePoint[] = []
  const courses: Course[] = []
  let courseSeq = 0

  UNIT_GROUPS.forEach((g, gi) => {
    const l1Id = `k-${g.key}`
    const kpIds = [l1Id, `k-${g.key}-1`, `k-${g.key}-2`]

    const buckets: string[][] = [[], [], []]
    g.unitIds.forEach((uid, idx) => buckets[idx % 3].push(uid))

    const videoId = `c${++courseSeq}`
    const materialId = `c${++courseSeq}`
    const courseIds = [videoId, materialId]
    courses.push({
      id: videoId,
      title: `${g.name}实操课程`,
      type: 'course',
      duration: `${40 + (gi % 4) * 5} 分钟`,
      knowledgeIds: [...kpIds],
    })
    courses.push({
      id: materialId,
      title: `${g.name}作业指导书`,
      type: 'material',
      duration: `${18 + (gi % 3) * 4} 分钟`,
      knowledgeIds: [...kpIds],
    })

    const code2 = String(gi + 1).padStart(2, '0')
    knowledge.push({ id: l1Id, name: `${g.name}作业规范`, code: `KN-${code2}`, level: 1, abilityIds: [...g.unitIds], capabilityUnitIds: [], courseIds: [...courseIds] })
    knowledge.push({ id: `k-${g.key}-1`, name: `${g.name}·${KP_ASPECTS[0]}`, code: `KN-${code2}-1`, level: 2, parentId: l1Id, abilityIds: [...g.unitIds], capabilityUnitIds: [], courseIds: [...courseIds] })
    knowledge.push({ id: `k-${g.key}-2`, name: `${g.name}·${KP_ASPECTS[1]}`, code: `KN-${code2}-2`, level: 2, parentId: l1Id, abilityIds: [...g.unitIds], capabilityUnitIds: [], courseIds: [...courseIds] })
  })

  return { knowledge, courses }
}

const KNOWLEDGE_AND_COURSES = buildKnowledgeAndCourses()

export const KNOWLEDGE_POINTS: KnowledgePoint[] = KNOWLEDGE_AND_COURSES.knowledge

CAPABILITY_UNITS.forEach((unit) => {
  unit.knowledgeIds.forEach((kid) => {
    const kp = KNOWLEDGE_POINTS.find((k) => k.id === kid)
    if (kp) {
      if (!kp.capabilityUnitIds.includes(unit.id)) {
        kp.capabilityUnitIds.push(unit.id)
      }
      if (!kp.abilityIds.includes(unit.id)) {
        kp.abilityIds.push(unit.id)
      }
    }
  })
})

function buildCourseUnits(base: Course[]): Course[] {
  const units: Course[] = []
  let seq = 0
  base
    .filter((c) => c.type === 'course')
    .forEach((c) => {
      const count = 2 + (units.length % 2)
      const topics = ['基础操作', '要点讲解', '实操演示']
      const kpIds = [...c.knowledgeIds]
      const perUnit = Math.ceil(kpIds.length / count)
      for (let i = 0; i < count; i++) {
        const slice = kpIds.slice(i * perUnit, (i + 1) * perUnit)
        seq++
        units.push({
          id: `csu${seq}`,
          title: `${c.title.replace('实操课程', '')}·${topics[i % topics.length]}`,
          type: 'material',
          duration: `${8 + (i % 3) * 4} 分钟`,
          knowledgeIds: slice.length > 0 ? slice : kpIds.slice(0, 1),
          parentId: c.id,
        })
      }
    })
  return units
}

export const COURSES: Course[] = [
  ...KNOWLEDGE_AND_COURSES.courses,
  ...buildCourseUnits(KNOWLEDGE_AND_COURSES.courses),
  {
    id: 'lc-safety-1', title: '计量现场施工质量工艺规范之现场工作安全', type: 'course',
    duration: '35 分钟', knowledgeIds: ['k-safety'],
    description: '涵盖计量现场各类施工场景的安全操作规范、危险点辨识与预控措施，确保作业人员在装表接电过程中严格遵守安全规程。',
  },
  {
    id: 'lc-safety-2', title: '国家电网有限公司营销现场作业安全工作规程', type: 'material',
    duration: '28 分钟', knowledgeIds: ['k-safety'],
    description: '国网营销现场作业安全规程的全面解读，覆盖低压、高压各类作业场景的安全要求、组织措施与技术措施。',
  },
  {
    id: 'lc-safety-3', title: '电力安全操作规程', type: 'material',
    duration: '22 分钟', knowledgeIds: ['k-safety'],
    description: '电力作业安全操作规程详解，包括停电验电、挂设接地线、个人防护装备使用等关键操作流程与注意事项。',
  },
  {
    id: 'lc-safety-quiz', title: '安全风险专题考试', type: 'quiz',
    duration: '20 分钟', knowledgeIds: ['k-safety'],
    description: '安全风险知识在线测验，涵盖安全规程、风险防范、应急处理等核心考点，帮助巩固学习效果。',
  },
  {
    id: 'lc-theory-1', title: '装表接电基础知识（一）', type: 'course',
    duration: '42 分钟', knowledgeIds: ['k-sp'],
    description: '装表接电入门课程，讲解电能表结构原理、单相/三相电能表接线方式、计量装置构成等基础知识。',
  },
  {
    id: 'lc-theory-2', title: '装表接电基础知识（二）', type: 'course',
    duration: '38 分钟', knowledgeIds: ['k-sp-1'],
    description: '装表接电进阶课程，涵盖三相电能表、互感器接线、计量二次回路等复杂场景的理论知识与现场校验规范。',
  },
  {
    id: 'lc-theory-3', title: '走进电力营销 — 装表接电与用电信息采集', type: 'course',
    duration: '30 分钟', knowledgeIds: ['k-lv3d'],
    description: '电力营销业务全景介绍，深入了解装表接电与用电信息采集系统的工作原理、数据流程与业务规范。',
  },
  {
    id: 'lc-skill-1', title: '装表接电技能培训', type: 'course',
    duration: '45 分钟', knowledgeIds: ['k-sp'],
    description: '单相电能表接线方法深度剖析，结合实际案例讲解正确接线步骤、万用表测量方法及常见错误排查技巧。',
  },
  {
    id: 'lc-skill-2', title: '电能计量装置安装与检查', type: 'material',
    duration: '25 分钟', knowledgeIds: ['k-sp-2'],
    description: '电能计量装置安装与检查规范详解，包括电能表、互感器、二次回路的安装标准与现场检查要点。',
  },
  {
    id: 'lc-skill-3', title: '单相电能表接线方法剖析', type: 'material',
    duration: '18 分钟', knowledgeIds: ['k-sp-1'],
    description: '配合实物演示讲解不停电更换电表操作中的接线技巧、绝缘防护与安全操作要点。',
  },
  {
    id: 'lc-sim', title: '电能表更换仿真课程', type: 'course',
    duration: '30 分钟', knowledgeIds: ['k-sp'],
    description: '进入电能表更换的三维仿真环境，通过教学模式学习操作步骤，再进入自主实操模式独立完成全流程练习，最后进入考核模式自动评分。',
  },
]
// 课程标题覆盖（用于考试记录显示）
const COURSE_TITLE_OVERRIDES: Record<string, string> = {
  c1: '装表接电考核',
  c3: '高压安全校核专项考核',
  c5: '电压互感器现场作业理论考试',
}
COURSES.forEach((c) => {
  if (COURSE_TITLE_OVERRIDES[c.id]) c.title = COURSE_TITLE_OVERRIDES[c.id]
})

export const STUDENTS: Student[] = [
  {
    id: 'stu-li',
    name: '李四',
    positionIds: ['pos1'],
    department: '计量二班',
    joinDate: '2024-03-15',
  },
  {
    id: 'stu-zhang',
    name: '张三',
    positionIds: ['pos1'],
    department: '计量一班',
    joinDate: '2026-06-01',
  },
  {
    id: 'stu-wang',
    name: '王五',
    positionIds: ['pos1'],
    department: '计量一班',
    joinDate: '2022-07-20',
  },
  {
    id: 'stu-zhao',
    name: '赵六',
    positionIds: ['pos1'],
    department: '运维一班',
    joinDate: '2023-09-10',
  },
  {
    id: 'stu-sun',
    name: '孙七',
    positionIds: ['pos1'],
    department: '检修二班',
    joinDate: '2021-05-12',
  },
]

// ==================== 生成每日能力单元分数 ====================

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function clampScore(score: number) {
  return Math.max(0, Math.min(100, Math.round(score)))
}

type ScoreEvent =
  | { type: 'workorder'; date: string; domainId: string; unitId: string; impact: number }
  | { type: 'learning'; date: string; courseId: string; unitId: string; impact: number }

function generateSupplementalEvents(): ScoreEvent[] {
  const events: ScoreEvent[] = []

  const allUnitIds = new Set<string>()
  for (const pid of ['pos1']) {
    for (const dom of CAPABILITY_DOMAINS.filter((d) => d.positionId === pid)) {
      for (const uid of dom.unitIds) allUnitIds.add(uid)
    }
  }
  allUnitIds.add('cu15')

  const uidDomainMap = new Map<string, string>()
  for (const pid of ['pos1']) {
    for (const dom of CAPABILITY_DOMAINS.filter((d) => d.positionId === pid)) {
      for (const uid of dom.unitIds) {
        if (!uidDomainMap.has(uid)) uidDomainMap.set(uid, dom.id)
      }
    }
  }

  const uidCourseMap = new Map<string, string[]>()
  for (const unit of CAPABILITY_UNITS) {
    const kpIds = KNOWLEDGE_POINTS.filter((k) => k.capabilityUnitIds.includes(unit.id)).map((k) => k.id)
    const cIds = Array.from(new Set(COURSES.filter((c) => c.knowledgeIds.some((kid) => kpIds.includes(kid))).map((c) => c.id)))
    if (cIds.length > 0) uidCourseMap.set(unit.id, cIds)
  }

  const lDates = ['2026-06-10', '2026-06-14', '2026-06-19', '2026-06-24', '2026-06-28', '2026-07-02', '2026-07-05']
  const wDates = ['2026-06-12', '2026-06-17', '2026-06-21', '2026-06-26', '2026-06-30', '2026-07-03', '2026-07-06']

  Array.from(allUnitIds).forEach((uid, idx) => {
    const courses = uidCourseMap.get(uid) || []
    const domainId = uidDomainMap.get(uid)
    const ld1 = lDates[idx % lDates.length]
    const ld2 = lDates[(idx + 4) % lDates.length]
    const wd1 = wDates[idx % wDates.length]
    const wd2 = wDates[(idx + 3) % wDates.length]

    if (courses.length > 0) {
      events.push({ type: 'learning', date: ld1, courseId: courses[idx % courses.length], unitId: uid, impact: 5 + ((idx * 3) % 5) })
    }
    if (domainId) {
      events.push({ type: 'workorder', date: wd1, domainId, unitId: uid, impact: -(6 + ((idx * 2) % 6)) })
    }
    if (idx % 2 === 0 && courses.length > 0) {
      events.push({ type: 'learning', date: ld2, courseId: courses[(idx + 1) % courses.length], unitId: uid, impact: 4 + ((idx * 2) % 4) })
    } else if (domainId) {
      events.push({ type: 'workorder', date: wd2, domainId, unitId: uid, impact: -(4 + ((idx * 3) % 5)) })
    }
  })

  return events
}

const SUPPLEMENTAL_EVENTS = generateSupplementalEvents()

const EVENTS: ScoreEvent[] = [
  { type: 'workorder', date: '2026-06-20', domainId: 'cd2', unitId: 'cu1', impact: -10 },
  { type: 'workorder', date: '2026-06-22', domainId: 'cd2', unitId: 'cu2', impact: -5 },
  { type: 'learning', date: '2026-06-28', courseId: 'c1', unitId: 'cu1', impact: 8 },
  { type: 'learning', date: '2026-07-05', courseId: 'c2', unitId: 'cu1', impact: 5 },
  { type: 'workorder', date: '2026-07-06', domainId: 'cd2', unitId: 'cu1', impact: -8 },
  { type: 'workorder', date: '2026-06-18', domainId: 'cd1', unitId: 'cu16', impact: -8 },
  { type: 'learning', date: '2026-07-01', courseId: 'c3', unitId: 'cu16', impact: 10 },
  { type: 'learning', date: '2026-06-15', courseId: 'c8', unitId: 'cu15', impact: 5 },
  { type: 'workorder', date: '2026-06-22', domainId: 'cd4', unitId: 'cu14', impact: -6 },
  { type: 'learning', date: '2026-07-03', courseId: 'c5', unitId: 'cu14', impact: 8 },
  { type: 'learning', date: '2026-06-10', courseId: 'c6', unitId: 'cu7', impact: 6 },
  ...SUPPLEMENTAL_EVENTS,
]

function generateScores(): StudentAbilityScore[] {
  const endDate = '2026-07-07'
  const startDate = '2026-06-08'
  const scores: StudentAbilityScore[] = []

  STUDENTS.forEach((student) => {
    student.positionIds.forEach((positionId) => {
      const positionDomains = CAPABILITY_DOMAINS.filter((d) => d.positionId === positionId)
      const unitIds = Array.from(
        new Set(positionDomains.flatMap((d) => d.unitIds))
      )
      if (!unitIds.includes('cu15')) unitIds.push('cu15')

      unitIds.forEach((unitId) => {
        let currentScore = 75
        const unitEvents = EVENTS.filter(
          (e) => e.unitId === unitId && (e.type !== 'workorder' || e.domainId)
        ).filter((e) => {
          if (e.type === 'workorder') {
            const dom = CAPABILITY_DOMAINS.find((d) => d.id === e.domainId)
            return dom?.positionId === positionId
          }
          if (e.type === 'learning') {
            const course = COURSES.find((c) => c.id === e.courseId)
            const unit = CAPABILITY_UNITS.find((u) => u.id === unitId)
            return course != null && unit != null
          }
          return false
        })

        let d = startDate
        while (d <= endDate) {
          const dayEvents = unitEvents.filter((e) => e.date === d)
          let source: StudentAbilityScore['source'] = 'carry'

          dayEvents.forEach((e) => {
            if (e.type === 'workorder') {
              currentScore += e.impact
              source = 'workorder'
            } else if (e.type === 'learning') {
              currentScore += e.impact
              source = 'learning'
            }
          })

          if (dayEvents.length === 0) {
            source = 'carry'
          }

          currentScore = clampScore(currentScore)
          scores.push({
            studentId: student.id,
            positionId,
            abilityId: unitId,
            date: d,
            score: currentScore,
            source,
          })
          d = addDays(d, 1)
        }
      })
    })
  })

  return scores
}

export const SCORES = generateScores()

// ==================== 执行记录 & 学习记录 ====================

function generateRecordDimensionScore(impact: number): Record<Dimension, number> {
  const base = 80 + impact * 2
  return {
    数量: clampScore(base + 5),
    质量: clampScore(base - 5),
    安全: clampScore(base + 10),
    规范: clampScore(base - 10),
    效率: clampScore(base),
  }
}

const DIMENSION_PROBLEMS: Record<
  Dimension,
  { type: string; problems: { name: string; deductions: { name: string; points: number }[] }[] }
> = {
  数量: {
    type: '工作量问题',
    problems: [
      {
        name: '当日完成量未达计划',
        deductions: [{ name: '完成率不足扣分', points: 3 }],
      },
      {
        name: '遗留未处理记录',
        deductions: [
          { name: '遗留扣分', points: 4 },
          { name: '积压影响考评', points: 2 },
        ],
      },
    ],
  },
  质量: {
    type: '作业质量问题',
    problems: [
      {
        name: '接线端子压接不牢',
        deductions: [
          { name: '接线工艺不达标扣分', points: 4 },
          { name: '端子虚接风险', points: 3 },
        ],
      },
      {
        name: '设备参数配置错误',
        deductions: [
          { name: '参数错误扣分', points: 3 },
          { name: '参数未校验留档', points: 2 },
        ],
      },
      {
        name: '一次验收未通过',
        deductions: [
          { name: '返工扣分', points: 5 },
          { name: '验收记录不全', points: 2 },
        ],
      },
    ],
  },
  安全: {
    type: '安全风险问题',
    problems: [
      {
        name: '未执行验电挂接地',
        deductions: [
          { name: '安全措施缺失扣分', points: 8 },
          { name: '未在作业票签字', points: 3 },
        ],
      },
      {
        name: '未佩戴绝缘防护',
        deductions: [
          { name: '违反安全规范扣分', points: 6 },
          { name: '安全用具过期未更换', points: 4 },
        ],
      },
    ],
  },
  规范: {
    type: '作业规范问题',
    problems: [
      {
        name: '作业记录填写不完整',
        deductions: [
          { name: '记录规范扣分', points: 4 },
          { name: '记录未按时归档', points: 2 },
        ],
      },
      {
        name: '现场未按标准工序操作',
        deductions: [
          { name: '工序不规范扣分', points: 5 },
          { name: '跳步漏步作业', points: 3 },
        ],
      },
    ],
  },
  效率: {
    type: '作业效率问题',
    problems: [
      {
        name: '作业耗时超标准工时',
        deductions: [
          { name: '超时扣分', points: 3 },
          { name: '影响后续排程', points: 2 },
        ],
      },
      {
        name: '重复往返现场',
        deductions: [
          { name: '效率低下扣分', points: 4 },
          { name: '工具材料准备不充分', points: 3 },
        ],
      },
    ],
  },
}

type TaskTemplate = { name: string; category: string; dimensions: Dimension[] }

const INSTALL_TASKS: TaskTemplate[] = [
  { name: '现场勘查与准备', category: '现场勘查类', dimensions: ['数量', '效率'] },
  { name: '设备安装接线', category: '装接作业类', dimensions: ['质量', '规范'] },
  { name: '安全检查与验收', category: '安全验收类', dimensions: ['安全', '规范'] },
]

const SURVEY_TASKS: TaskTemplate[] = [
  { name: '用户信息核对', category: '普查核对类', dimensions: ['数量'] },
  { name: '现场设备普查', category: '现场勘查类', dimensions: ['质量'] },
  { name: '数据录入与上报', category: '数据整理类', dimensions: ['规范', '效率'] },
]

let deductionSeq = 0

function buildWorkorderTasks(
  domainId: string,
  unitId: string,
  impact: number,
  seed: number
): WorkorderTask[] {
  const total = Math.abs(impact)
  const dom = CAPABILITY_DOMAINS.find((d) => d.id === domainId)
  const domName = dom?.name || '领域'
  const isSurvey = dom?.type === '计量采集装置普查'

  const templates = isSurvey ? SURVEY_TASKS : INSTALL_TASKS
  const taskCount = total >= 8 ? 3 : 2
  const selectedTasks: TaskTemplate[] = []
  for (let i = 0; i < taskCount; i++) {
    selectedTasks.push(templates[(seed + i) % templates.length])
  }

  return selectedTasks.map((tmpl, ti) => {
    const dims = tmpl.dimensions
    const problemCount = total >= 6 ? 2 : 1

    const problems = dims.flatMap((dim, di) => {
      const cfg = DIMENSION_PROBLEMS[dim]
      const selected: typeof cfg.problems = []
      for (let p = 0; p < problemCount && p < cfg.problems.length; p++) {
        selected.push(cfg.problems[(seed + ti * 3 + di * 7 + p) % cfg.problems.length])
      }

      return selected.map((prob, pi) => {
        const scale = total >= 8 ? 1 : 0.7
        const dedItems = prob.deductions.map((dd) => ({
          id: `ded-${++deductionSeq}`,
          name: dd.name,
          dimension: dim,
          points: Math.max(1, Math.round(dd.points * scale)),
          abilityId: unitId,
        }))

        return {
          id: `prob-${domainId}-${tmpl.category}-${dim}-${seed}-${ti}-${di}-${pi}`,
          name: prob.name,
          type: cfg.type,
          deductions: dedItems,
        }
      })
    })

    return {
      id: `task-${domainId}-${tmpl.category}-${seed}-${ti}`,
      name: `${domName}·${tmpl.name}`,
      category: tmpl.category,
      problems,
    }
  })
}

export const WORKORDER_RECORDS: StudentWorkorderRecord[] = EVENTS.filter(
  (e): e is Extract<ScoreEvent, { type: 'workorder' }> => e.type === 'workorder'
).map((e, idx) => {
  return {
    studentId: 'stu-li',
    workorderId: e.domainId,
    date: e.date,
    dimensionScore: generateRecordDimensionScore(e.impact),
    abilityId: e.unitId,
    scoreImpact: e.impact,
    tasks: buildWorkorderTasks(e.domainId, e.unitId, e.impact, idx),
  }
})

export const LEARNING_RECORDS: StudentLearningRecord[] = EVENTS.filter(
  (e): e is Extract<ScoreEvent, { type: 'learning' }> => e.type === 'learning'
).map((e) => ({
  studentId: 'stu-li',
  courseId: e.courseId,
  date: e.date,
  score: e.courseId.startsWith('c') ? Math.round(80 + Math.random() * 15) : undefined,
}))

// ==================== 随堂测试 ====================

function buildQuizForCourse(course: Course): Quiz {
  const topic = course.title.replace('实操课程', '').replace('作业指导书', '')
  return {
    id: `quiz-${course.id}`,
    courseId: course.id,
    questions: [
      {
        id: `q-${course.id}-1`,
        question: `${topic}作业前，首要执行的环节是？`,
        options: ['直接开始装接', '执行安全组织与技术措施', '填写验收单', '通知用户'],
        answer: 1,
      },
      {
        id: `q-${course.id}-2`,
        question: `${topic}接线完成后应进行的操作是？`,
        options: ['立即离场', '核对相序并验收', '仅拍照记录', '省略检查'],
        answer: 1,
      },
      {
        id: `q-${course.id}-3`,
        question: `以下哪项属于${topic}的规范要求？`,
        options: ['记录可后补', '按标准工序逐项操作', '工时不限', '省略台账'],
        answer: 1,
      },
    ],
  }
}

export const QUIZZES: Quiz[] = COURSES.filter((c) => c.type === 'course').map(buildQuizForCourse)

export const QUIZ_RECORDS: StudentQuizRecord[] = [
  { id: 'qr-1', studentId: 'stu-li', courseId: 'c1', date: '2026-06-29', score: 2, total: 3 },
  { id: 'qr-2', studentId: 'stu-li', courseId: 'c3', date: '2026-07-02', score: 3, total: 3 },
  { id: 'qr-3', studentId: 'stu-li', courseId: 'c5', date: '2026-07-04', score: 2, total: 3 },
]

// ==================== 查询函数 ====================

export function getMockData() {
  return {
    positions: POSITIONS,
    capabilityDomains: CAPABILITY_DOMAINS,
    capabilityUnits: CAPABILITY_UNITS,
    knowledgePoints: KNOWLEDGE_POINTS,
    courses: COURSES,
    students: STUDENTS,
    scores: SCORES,
    workorderRecords: WORKORDER_RECORDS,
    learningRecords: LEARNING_RECORDS,
  }
}

export function getPositionById(id: string): Position | undefined {
  return POSITIONS.find((p) => p.id === id)
}

export function getUnitById(id: string): CapabilityUnit | undefined {
  return CAPABILITY_UNITS.find((u) => u.id === id)
}

export function getDomainById(id: string): CapabilityDomain | undefined {
  return CAPABILITY_DOMAINS.find((d) => d.id === id)
}

export function getCapabilityDomainById(id: string): CapabilityDomain | undefined {
  return getDomainById(id)
}

export function getCapabilityUnitById(id: string): CapabilityUnit | undefined {
  return getUnitById(id)
}

export function getKnowledgeById(id: string): KnowledgePoint | undefined {
  return KNOWLEDGE_POINTS.find((k) => k.id === id)
}

export function getCourseById(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function getStudentById(id: string): Student | undefined {
  return STUDENTS.find((s) => s.id === id)
}

export function getStudentScores(
  studentId: string,
  abilityId?: string
): StudentAbilityScore[] {
  return SCORES.filter(
    (s) => s.studentId === studentId && (abilityId ? s.abilityId === abilityId : true)
  ).sort((a, b) => a.date.localeCompare(b.date))
}

export function getLatestScore(
  studentId: string,
  abilityId: string,
  date?: string
): StudentAbilityScore | undefined {
  const scores = getStudentScores(studentId, abilityId)
  if (date) return scores.find((s) => s.date === date)
  return scores.pop()
}

export function getAbilityScoresForDate(
  studentId: string,
  date: string
): StudentAbilityScore[] {
  return SCORES.filter((s) => s.studentId === studentId && s.date === date)
}

export function getStudentPositions(studentId: string): Position[] {
  const student = getStudentById(studentId)
  if (!student) return []
  return POSITIONS.filter((p) => student.positionIds.includes(p.id))
}

export function getPositionUnits(positionId: string): CapabilityUnit[] {
  const unitIds = Array.from(
    new Set(CAPABILITY_DOMAINS.filter((d) => d.positionId === positionId).flatMap((d) => d.unitIds))
  )
  if (!unitIds.includes('cu15')) unitIds.push('cu15')
  return CAPABILITY_UNITS.filter((u) => unitIds.includes(u.id))
}

export function getUnitDomains(unitId: string): CapabilityDomain[] {
  return CAPABILITY_DOMAINS.filter((d) => d.unitIds.includes(unitId))
}

export function getUnitKnowledge(unitId: string): KnowledgePoint[] {
  return KNOWLEDGE_POINTS.filter((k) => k.capabilityUnitIds.includes(unitId))
}

export function getPositionDomains(positionId: string): CapabilityDomain[] {
  return CAPABILITY_DOMAINS.filter((d) => d.positionId === positionId)
}

export function getKnowledgeTree(): KnowledgePoint[] {
  const map = new Map<string, KnowledgePoint & { children?: KnowledgePoint[] }>()
  KNOWLEDGE_POINTS.forEach((k) => map.set(k.id, { ...k }))
  const roots: (KnowledgePoint & { children?: KnowledgePoint[] })[] = []
  KNOWLEDGE_POINTS.forEach((k) => {
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

export function getKnowledgeCourses(knowledgeId: string): Course[] {
  return COURSES.filter((c) => c.knowledgeIds.includes(knowledgeId))
}

export function getStudentWorkorders(studentId: string): StudentWorkorderRecord[] {
  return WORKORDER_RECORDS.filter((r) => r.studentId === studentId).sort(
    (a, b) => b.date.localeCompare(a.date)
  )
}

export function getStudentLearningRecords(studentId: string): StudentLearningRecord[] {
  return LEARNING_RECORDS.filter((r) => r.studentId === studentId).sort(
    (a, b) => b.date.localeCompare(a.date)
  )
}

// ==================== 推荐逻辑 ====================

export function getRecommendations(studentId: string): Recommendation[] {
  const student = getStudentById(studentId)
  if (!student) return []

  const recs: Recommendation[] = []
  const today = '2026-07-07'
  const yesterday = '2026-07-06'

  student.positionIds.forEach((positionId) => {
    const units = getPositionUnits(positionId)
    units.forEach((unit) => {
      const scores = getStudentScores(studentId, unit.id)
      const todayScore = scores.find((s) => s.date === today)
      const yesterdayScore = scores.find((s) => s.date === yesterday)

      if (todayScore && yesterdayScore && todayScore.score < yesterdayScore.score) {
        const knowledgeIds = getUnitKnowledge(unit.id).map((k) => k.id)
        const courseIds = Array.from(
          new Set(
            COURSES.filter((c) => c.knowledgeIds.some((kId) => knowledgeIds.includes(kId))).map(
              (c) => c.id
            )
          )
        )

        if (courseIds.length > 0) {
          recs.push({
            id: `rec-${unit.id}`,
            studentId,
            abilityId: unit.id,
            reason: `${unit.name} 分数从 ${yesterdayScore.score} 下降至 ${todayScore.score}，建议学习相关课程提升能力。`,
            courseIds,
            createdDate: today,
            status: 'pending',
          })
        }
      }
    })
  })

  return recs
}

export function getRecommendationById(id: string): Recommendation | undefined {
  return getRecommendations('stu-li').find((r) => r.id === id)
}

// ==================== 衰减判定 ====================

export function isKnowledgeDecayed(
  studentId: string,
  knowledgeId: string,
  referenceDate = '2026-07-07'
): boolean {
  const knowledge = getKnowledgeById(knowledgeId)
  if (!knowledge) return false

  const courseIds = knowledge.courseIds
  const lastLearning = LEARNING_RECORDS.filter(
    (r) => r.studentId === studentId && courseIds.includes(r.courseId)
  ).sort((a, b) => b.date.localeCompare(a.date))[0]

  const abilityIds = knowledge.abilityIds
  const lastWorkorder = WORKORDER_RECORDS.filter(
    (r) => r.studentId === studentId && abilityIds.includes(r.abilityId)
  ).sort((a, b) => b.date.localeCompare(a.date))[0]

  const lastEventDate =
    lastLearning && lastWorkorder
      ? lastLearning.date > lastWorkorder.date
        ? lastLearning.date
        : lastWorkorder.date
      : lastLearning?.date || lastWorkorder?.date

  if (!lastEventDate) return true

  const daysDiff =
    (new Date(referenceDate).getTime() - new Date(lastEventDate).getTime()) /
    (1000 * 60 * 60 * 24)
  return daysDiff >= 30
}

// ==================== 知识图谱可视化数据 ====================

export function getStudentGraph(studentId: string): {
  nodes: GraphNode[]
  edges: GraphEdge[]
} {
  const student = getStudentById(studentId)
  if (!student) return { nodes: [], edges: [] }

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const added = new Set<string>()

  const addNode = (node: GraphNode) => {
    if (!added.has(node.id)) {
      nodes.push(node)
      added.add(node.id)
    }
  }

  student.positionIds.forEach((positionId) => {
    const position = getPositionById(positionId)
    if (!position) return
    addNode({ id: position.id, label: position.name, type: 'position' })

    const domains = CAPABILITY_DOMAINS.filter((d) => d.positionId === positionId)
    domains.forEach((dom) => {
      addNode({ id: dom.id, label: dom.name, type: 'domain' })
      edges.push({ source: position.id, target: dom.id })

      dom.unitIds.forEach((unitId) => {
        const unit = getUnitById(unitId)
        if (!unit) return
        addNode({ id: unit.id, label: unit.name, type: 'unit' })
        edges.push({ source: dom.id, target: unit.id })

        const knowledges = KNOWLEDGE_POINTS.filter((k) =>
          k.capabilityUnitIds.includes(unitId)
        )
        knowledges.forEach((k) => {
          addNode({
            id: k.id,
            label: k.name,
            type: 'knowledge',
            level: k.level,
          })
          edges.push({ source: unit.id, target: k.id })

          k.courseIds.forEach((courseId) => {
            const course = getCourseById(courseId)
            if (!course) return
            addNode({ id: course.id, label: course.title, type: 'course' })
            edges.push({ source: k.id, target: course.id })
          })
        })
      })
    })
  })

  return { nodes, edges }
}

export function getPositionGraph(positionId: string): {
  nodes: GraphNode[]
  edges: GraphEdge[]
} {
  const position = getPositionById(positionId)
  if (!position) return { nodes: [], edges: [] }

  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []
  const added = new Set<string>()

  const addNode = (node: GraphNode) => {
    if (!added.has(node.id)) {
      nodes.push(node)
      added.add(node.id)
    }
  }

  addNode({ id: position.id, label: position.name, type: 'position' })

  const domains = CAPABILITY_DOMAINS.filter((d) => d.positionId === positionId)
  domains.forEach((dom) => {
    addNode({ id: dom.id, label: dom.name, type: 'domain' })
    edges.push({ source: position.id, target: dom.id })

    dom.unitIds.forEach((unitId) => {
      const unit = getUnitById(unitId)
      if (!unit) return
      addNode({ id: unit.id, label: unit.name, type: 'unit' })
      edges.push({ source: dom.id, target: unit.id })

      const knowledges = KNOWLEDGE_POINTS.filter((k) => k.capabilityUnitIds.includes(unitId))
      knowledges.forEach((k) => {
        addNode({
          id: k.id,
          label: k.name,
          type: 'knowledge',
          level: k.level,
        })
        edges.push({ source: unit.id, target: k.id })

        k.courseIds.forEach((courseId) => {
          const course = getCourseById(courseId)
          if (!course) return
          addNode({ id: course.id, label: course.title, type: 'course' })
          edges.push({ source: k.id, target: course.id })
        })
      })
    })
  })

  return { nodes, edges }
}

// ==================== 新页面辅助查询函数 ====================

export function getDomainCapabilityUnits(domainId: string): CapabilityUnit[] {
  return CAPABILITY_UNITS.filter((u) => u.domainId === domainId)
}

export function getUnitCourses(unitId: string): Course[] {
  const knowledgeIds = getUnitKnowledge(unitId).map((k) => k.id)
  return COURSES.filter((c) => c.knowledgeIds.some((id) => knowledgeIds.includes(id)))
}

export function getKnowledgeChildren(parentId: string): KnowledgePoint[] {
  return KNOWLEDGE_POINTS.filter((k) => k.parentId === parentId)
}

export function getCourseKnowledge(courseId: string): KnowledgePoint[] {
  const course = getCourseById(courseId)
  if (!course) return []
  return KNOWLEDGE_POINTS.filter((k) => course.knowledgeIds.includes(k.id))
}

export function getRecentWorkordersForAbility(
  studentId: string,
  abilityId: string,
  days = 30
): StudentWorkorderRecord[] {
  const cutoff = new Date('2026-07-07')
  cutoff.setDate(cutoff.getDate() - days)
  return getStudentWorkorders(studentId).filter(
    (r) => r.abilityId === abilityId && new Date(r.date) >= cutoff
  )
}

export function getDaysSinceLastLearningForAbility(
  studentId: string,
  abilityId: string,
  referenceDate = '2026-07-07'
): number | null {
  const courses = getUnitCourses(abilityId)
  const courseIds = courses.map((c) => c.id)
  const last = LEARNING_RECORDS.filter(
    (r) => r.studentId === studentId && courseIds.includes(r.courseId)
  ).sort((a, b) => b.date.localeCompare(a.date))[0]
  if (!last) return null
  const diff =
    (new Date(referenceDate).getTime() - new Date(last.date).getTime()) / (1000 * 60 * 60 * 24)
  return Math.round(diff)
}

export type DiagnosisItem = {
  abilityId: string
  abilityName: string
  positionName: string
  baseline: number
  yesterdayScore: number
  todayScore: number
  status: 'above' | 'meet' | 'drop' | 'severe'
  recentWorkorders: number
  quizErrorRate: number
  daysSinceLearning: number | null
  recommendedCourses: Course[]
  predictedScore: number
  predictedWorkorderReduction: number
  effectAnalysis: 'positive' | 'poor' | 'pending'
}

export function getStudentRecommendationsWithDiagnosis(studentId: string): DiagnosisItem[] {
  const student = getStudentById(studentId)
  if (!student) return []

  const today = '2026-07-07'
  const yesterday = '2026-07-06'
  const items: DiagnosisItem[] = []

  student.positionIds.forEach((positionId) => {
    const position = getPositionById(positionId)
    if (!position) return

    const units = getPositionUnits(positionId)
    units.forEach((unit) => {
      const scores = getStudentScores(studentId, unit.id)
      const todayScore = scores.find((s) => s.date === today)?.score ?? 0
      const yesterdayScore = scores.find((s) => s.date === yesterday)?.score ?? todayScore
      const baseline = unit.baseline

      let status: DiagnosisItem['status']
      if (todayScore >= baseline + 5) status = 'above'
      else if (todayScore >= baseline) status = 'meet'
      else if (todayScore >= baseline - 15) status = 'drop'
      else status = 'severe'

      const recentWo = getRecentWorkordersForAbility(studentId, unit.id, 30)
      const recentWorkorders = recentWo.length

      const quizErrorRate = Math.min(50, Math.round((100 - todayScore) * 0.4))

      const daysSinceLearning = getDaysSinceLastLearningForAbility(studentId, unit.id)

      const recommendedCourses = getUnitCourses(unit.id)

      const predictedScore = Math.min(100, Math.round(todayScore + recommendedCourses.length * 4))

      const predictedWorkorderReduction = recentWorkorders > 0 ? 60 : 0

      let effectAnalysis: DiagnosisItem['effectAnalysis']
      if (todayScore > yesterdayScore) effectAnalysis = 'positive'
      else if (todayScore < yesterdayScore && todayScore < baseline) effectAnalysis = 'poor'
      else effectAnalysis = 'pending'

      items.push({
        abilityId: unit.id,
        abilityName: unit.name,
        positionName: position.name,
        baseline,
        yesterdayScore,
        todayScore,
        status,
        recentWorkorders,
        quizErrorRate,
        daysSinceLearning,
        recommendedCourses,
        predictedScore,
        predictedWorkorderReduction,
        effectAnalysis,
      })
    })
  })

  const order = { severe: 0, drop: 1, meet: 2, above: 3 }
  return items.sort((a, b) => order[a.status] - order[b.status])
}

export function getDecayedKnowledgesForStudent(
  studentId: string,
  referenceDate = '2026-07-07'
): (KnowledgePoint & { positionName: string })[] {
  const student = getStudentById(studentId)
  if (!student) return []

  const decayed: (KnowledgePoint & { positionName: string })[] = []
  student.positionIds.forEach((positionId) => {
    const position = getPositionById(positionId)
    if (!position) return
    const units = getPositionUnits(positionId)
    units.forEach((unit) => {
      const knowledges = getUnitKnowledge(unit.id)
      knowledges.forEach((k) => {
        if (isKnowledgeDecayed(studentId, k.id, referenceDate)) {
          decayed.push({ ...k, positionName: position.name })
        }
      })
    })
  })
  return decayed
}

// ==================== 执行层级 & 统计 ====================

export function getStudentWorkorderHierarchy(studentId: string): StudentWorkorderRecord[] {
  return WORKORDER_RECORDS.filter((r) => r.studentId === studentId && (r.tasks?.length ?? 0) > 0).sort(
    (a, b) => b.date.localeCompare(a.date)
  )
}

function collectDeductions(studentId: string): {
  record: StudentWorkorderRecord
  task: WorkorderTask
  problem: WorkorderProblem
  deduction: DeductionRecord
}[] {
  const out: {
    record: StudentWorkorderRecord
    task: WorkorderTask
    problem: WorkorderProblem
    deduction: DeductionRecord
  }[] = []
  getStudentWorkorderHierarchy(studentId).forEach((record) => {
    record.tasks?.forEach((task) => {
      task.problems.forEach((problem) => {
        problem.deductions.forEach((deduction) => {
          out.push({ record, task, problem, deduction })
        })
      })
    })
  })
  return out
}

export type WorkorderStats = {
  byCategory: { name: string; count: number; deduction: number }[]
  byProblemType: { name: string; count: number; deduction: number }[]
  byDimension: Record<Dimension, number>
  byDeductionItem: { name: string; dimension: Dimension; count: number; deduction: number }[]
}

export function getWorkorderStats(studentId: string): WorkorderStats {
  const flat = collectDeductions(studentId)
  const catMap = new Map<string, { count: number; deduction: number }>()
  const typeMap = new Map<string, { count: number; deduction: number }>()
  const dimMap: Record<Dimension, number> = { 数量: 0, 质量: 0, 安全: 0, 规范: 0, 效率: 0 }
  const itemMap = new Map<string, { dimension: Dimension; count: number; deduction: number }>()

  flat.forEach(({ task, problem, deduction }) => {
    const c = catMap.get(task.category) || { count: 0, deduction: 0 }
    c.count += 1
    c.deduction += deduction.points
    catMap.set(task.category, c)

    const t = typeMap.get(problem.type) || { count: 0, deduction: 0 }
    t.count += 1
    t.deduction += deduction.points
    typeMap.set(problem.type, t)

    dimMap[deduction.dimension] += deduction.points

    const it = itemMap.get(deduction.name) || { dimension: deduction.dimension, count: 0, deduction: 0 }
    it.count += 1
    it.deduction += deduction.points
    itemMap.set(deduction.name, it)
  })

  return {
    byCategory: Array.from(catMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.deduction - a.deduction),
    byProblemType: Array.from(typeMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.deduction - a.deduction),
    byDimension: dimMap,
    byDeductionItem: Array.from(itemMap.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.deduction - a.deduction),
  }
}

// ==================== 五维诊断 ====================

export function getDimensionScores(studentId: string): Record<Dimension, number> {
  const stats = getWorkorderStats(studentId)
  const dims = DIMENSIONS
  const maxDed = Math.max(...dims.map((d) => stats.byDimension[d]), 1)
  const result = {} as Record<Dimension, number>
  dims.forEach((dim) => {
    result[dim] = clampScore(100 - Math.round((stats.byDimension[dim] / maxDed) * 80))
  })
  return result
}

export type DimensionDetail = {
  dimension: Dimension
  score: number
  totalDeduction: number
  items: { workorderName: string; problemType: string; problem: string; deductionName: string; points: number; date: string }[]
}

export function getDimensionBreakdown(studentId: string): DimensionDetail[] {
  const flat = collectDeductions(studentId)
  const scores = getDimensionScores(studentId)
  return DIMENSIONS.map((dim) => {
    const items = flat
      .filter((f) => f.deduction.dimension === dim)
      .map((f) => ({
        workorderName: getDomainById(f.record.workorderId)?.name || f.record.workorderId,
        problemType: f.problem.type,
        problem: f.problem.name,
        deductionName: f.deduction.name,
        points: f.deduction.points,
        date: f.record.date,
      }))
      .sort((a, b) => b.points - a.points)
    return {
      dimension: dim,
      score: scores[dim],
      totalDeduction: items.reduce((s, i) => s + i.points, 0),
      items,
    }
  })
}

export type WeakAbility = {
  abilityId: string
  abilityName: string
  totalDeduction: number
  count: number
}

export function getWeakAbilities(studentId: string): WeakAbility[] {
  const flat = collectDeductions(studentId)
  const map = new Map<string, { count: number; deduction: number }>()
  flat.forEach(({ deduction }) => {
    const v = map.get(deduction.abilityId) || { count: 0, deduction: 0 }
    v.count += 1
    v.deduction += deduction.points
    map.set(deduction.abilityId, v)
  })
  return Array.from(map.entries())
    .map(([abilityId, v]) => ({
      abilityId,
      abilityName: getUnitById(abilityId)?.name || abilityId,
      totalDeduction: v.deduction,
      count: v.count,
    }))
    .sort((a, b) => b.totalDeduction - a.totalDeduction)
}

// ==================== 学习评测 ====================

export function getCourseHierarchy(): (Course & { units: Course[] })[] {
  return COURSES.filter((c) => c.type === 'course').map((c) => ({
    ...c,
    units: COURSES.filter((u) => u.parentId === c.id),
  }))
}

export function getCourseQuiz(courseId: string): Quiz | undefined {
  return QUIZZES.find((q) => q.courseId === courseId)
}

export function getStudentQuizRecords(studentId: string): StudentQuizRecord[] {
  return QUIZ_RECORDS.filter((r) => r.studentId === studentId).sort((a, b) =>
    b.date.localeCompare(a.date)
  )
}

// ==================== 成效评估 ====================

export function getEffectivenessReport(studentId: string): EffectivenessReport[] {
  const weak = getWeakAbilities(studentId)
  const reports: EffectivenessReport[] = []

  weak.forEach((w) => {
    const learnDates = LEARNING_RECORDS.filter((r) => {
      if (r.studentId !== studentId) return false
      const course = getCourseById(r.courseId)
      if (!course) return false
      const kIds = getUnitKnowledge(w.abilityId).map((k) => k.id)
      return course.knowledgeIds.some((id) => kIds.includes(id))
    })
      .map((r) => r.date)
      .sort()
    const boundary = learnDates[0]
    if (!boundary) return

    const recs = collectDeductions(studentId).filter((f) => f.deduction.abilityId === w.abilityId)
    const before = { frequency: 0, deduction: 0 }
    const after = { frequency: 0, deduction: 0 }
    recs.forEach((f) => {
      const target = f.record.date < boundary ? before : after
      target.frequency += 1
      target.deduction += f.deduction.points
    })

    const dimensionDeltas = {} as Record<Dimension, number>
    DIMENSIONS.forEach((dim) => {
      const b = recs.filter((f) => f.record.date < boundary && f.deduction.dimension === dim).reduce((s, f) => s + f.deduction.points, 0)
      const a = recs.filter((f) => f.record.date >= boundary && f.deduction.dimension === dim).reduce((s, f) => s + f.deduction.points, 0)
      dimensionDeltas[dim] = b - a
    })

    reports.push({
      abilityId: w.abilityId,
      abilityName: w.abilityName,
      before,
      after,
      dimensionDeltas,
    })
  })

  return reports
}

export function getSkillStability(studentId: string): SkillStability[] {
  const flat = collectDeductions(studentId)
  const map = new Map<string, { repeat: number; deduction: number; problems: Set<string>; occurrences: number }>()
  flat.forEach(({ deduction, problem, record }) => {
    const v = map.get(deduction.abilityId) || { repeat: 0, deduction: 0, problems: new Set<string>(), occurrences: 0 }
    const key = `${record.workorderId}-${problem.name}`
    if (!v.problems.has(key)) {
      v.problems.add(key)
      v.occurrences += 1
      v.deduction += deduction.points
    } else {
      v.repeat += 1
      v.deduction += deduction.points
    }
    map.set(deduction.abilityId, v)
  })
  const entries = Array.from(map.entries()).map(([abilityId, v]) => ({
    abilityId,
    abilityName: getUnitById(abilityId)?.name || abilityId,
    repeatCount: v.repeat,
    totalDeduction: v.deduction,
    raw: v.repeat * 10 + (v.occurrences > 0 ? Math.round(v.deduction / v.occurrences) * 3 : 0),
  }))
  const maxRaw = Math.max(...entries.map((e) => e.raw), 1)
  return entries
    .map(({ abilityId, abilityName, repeatCount, totalDeduction, raw }) => ({
      abilityId,
      abilityName,
      repeatCount,
      totalDeduction,
      stabilityScore: clampScore(100 - Math.round((raw / maxRaw) * 80)),
    }))
    .sort((a, b) => a.stabilityScore - b.stabilityScore)
}

// ==================== 成效评估 · 五维聚合提升 ====================

export type DimensionImprovement = {
  dimension: Dimension
  beforeScore: number
  afterScore: number
  delta: number
}

export function getDimensionImprovement(studentId: string): DimensionImprovement[] {
  const reports = getEffectivenessReport(studentId)

  const dimTotals: Record<Dimension, { totalBefore: number; totalAfter: number; count: number }> = {
    数量: { totalBefore: 0, totalAfter: 0, count: 0 },
    质量: { totalBefore: 0, totalAfter: 0, count: 0 },
    安全: { totalBefore: 0, totalAfter: 0, count: 0 },
    规范: { totalBefore: 0, totalAfter: 0, count: 0 },
    效率: { totalBefore: 0, totalAfter: 0, count: 0 },
  }

  reports.forEach((r) => {
    DIMENSIONS.forEach((dim) => {
      const delta = r.dimensionDeltas[dim]
      if (delta !== undefined) {
        dimTotals[dim].totalBefore += Math.max(0, r.before.deduction - delta)
        dimTotals[dim].totalAfter += Math.max(0, r.before.deduction - delta + delta)
        dimTotals[dim].count += 1
      }
    })
  })

  const allBefore = DIMENSIONS.map((d) => dimTotals[d].totalBefore)
  const maxBefore = Math.max(...allBefore, 1)

  return DIMENSIONS.map((dim) => {
    const d = dimTotals[dim]
    const beforeScore = clampScore(100 - Math.round((d.totalBefore / maxBefore) * 70))
    const afterScore = clampScore(100 - Math.round((d.totalAfter / maxBefore) * 70))
    return {
      dimension: dim,
      beforeScore,
      afterScore,
      delta: afterScore - beforeScore,
    }
  })
}

// ==================== 向后兼容别名 ====================

export const getWorkorderById = getDomainById
export const getAbilityById = getUnitById
export const getPositionAbilities = getPositionUnits
export const getAbilityWorkorders = getUnitDomains
export const getAbilityKnowledge = getUnitKnowledge
export const getPositionWorkorders = getPositionDomains

export function getPositionCapabilityDomains(positionId: string): CapabilityDomain[] {
  return getPositionDomains(positionId)
}

export function getWorkorderResourceById(id: string): { id: string; name: string; code: string; taskDescription: string } | undefined {
  const dom = getDomainById(id)
  if (!dom) return undefined
  return {
    id: dom.id,
    name: dom.name,
    code: dom.code,
    taskDescription: dom.taskDescription,
  }
}

export function getWorkorderSyncRecords(): WorkorderSyncRecord[] {
  return []
}

export function getAbilityCourses(unitId: string): Course[] {
  return getUnitCourses(unitId)
}

// ==================== 课程描述 ====================

export function getCourseDescription(courseId: string): string | undefined {
  const c = COURSES.find((x) => x.id === courseId)
  return c?.description
}

// ==================== 学习路径分组 ====================

export function getLearningPath(): LearningPathGroup[] {
  return [
    {
      id: 'gp1',
      title: '课程一 安全风险专题学习',
      intro: '识别到您为装表接电班组新人，针对现场作业安全风险，为您推荐包含营销现场作业安全规程、电力安全操作规程、计量施工安全工艺规范。学习后可实现现场违章发生率大幅下降，作业安全合规率显著提升。',
      courseIds: ['lc-safety-1', 'lc-safety-2', 'lc-safety-3', 'lc-safety-quiz'],
    },
    {
      id: 'gp2',
      title: '课程二 装表接电理论知识',
      intro: '检测到您装表接电工作规范性的接线和施工流程存在不足，为您推荐包含岗位基础理论讲解、现场校验规范、计量装置安装实操接线规程。学习后可夯实计量作业理论基础，大幅提升现场装接与验收工作标准化水平。',
      courseIds: ['lc-theory-1', 'lc-theory-2', 'lc-theory-3'],
    },
    {
      id: 'gp3',
      title: '课程三 装表接电技能教学',
      intro: '检测到您工单任务存在单相电能表、三相电能表装接存在错接和不规范问题，为您推荐包括单相电能表接线方法剖析、不停电更换三相电能表等课程。学习后可实现现场作业规范度显著提升，接线差错大幅下降。',
      courseIds: ['lc-skill-1', 'lc-skill-2', 'lc-skill-3'],
    },
    {
      id: 'gp4',
      title: '课程四 电能表更换三维仿真',
      intro: '进入电能表更换的三维仿真环境，模拟电能表更换装接的全流程。先通过教学模式学习操作步骤，再进入自主实操模式独立开展全流程自由练习，再进入考核模式，系统将对你的操作步骤、完成时效、规范度自动评分。',
      courseIds: ['lc-sim'],
    },
  ]
}
