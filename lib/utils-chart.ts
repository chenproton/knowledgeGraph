export const DIMENSION_COLORS: Record<string, string> = {
  安全: '#3b82f6',
  质量: '#22c55e',
  效率: '#f59e0b',
  规范: '#8b5cf6',
  协作: '#ec4899',
}

export const NODE_COLORS: Record<string, string> = {
  workorder: '#ef4444',
  ability: '#3b82f6',
  knowledge: '#22c55e',
  course: '#f97316',
  material: '#a855f7',
  quiz: '#eab308',
}

export function levelClass(total: number) {
  if (total >= 90) return 'text-emerald-600'
  if (total >= 75) return 'text-blue-600'
  if (total >= 60) return 'text-amber-600'
  return 'text-red-600'
}

export function statusBadge(status: string) {
  switch (status) {
    case 'danger':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'warning':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    default:
      return 'bg-emerald-100 text-emerald-700 border-emerald-200'
  }
}
