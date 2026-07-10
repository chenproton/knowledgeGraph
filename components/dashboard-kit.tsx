import { cn } from '@/lib/utils'

export const GRAD = 'from-[#5b76e8] to-[#8c6ff0]'

export type Tier = 'exceed' | 'meet' | 'below'
export function tierOf(score: number, baseline: number): Tier {
  if (score >= baseline + 5) return 'exceed'
  if (score >= baseline) return 'meet'
  return 'below'
}
export const TIER_FILL: Record<Tier, string> = {
  exceed: 'from-[#27b08a] to-[#54cf9d]',
  meet: 'from-[#5b76e8] to-[#8c6ff0]',
  below: 'from-[#e89b3a] to-[#f3c069]',
}
export const TIER_TEXT: Record<Tier, string> = {
  exceed: 'text-emerald-600',
  meet: 'text-indigo-600',
  below: 'text-amber-600',
}
export const TIER_BADGE: Record<Tier, { label: string; cls: string }> = {
  exceed: { label: '超基准', cls: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
  meet: { label: '达标', cls: 'bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200' },
  below: { label: '未达标', cls: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
}

export const TONE = {
  green: { card: 'from-emerald-50 to-white border-emerald-100', text: 'text-emerald-600', glow: 'bg-emerald-300/50' },
  purple: { card: 'from-purple-50 to-white border-purple-100', text: 'text-purple-600', glow: 'bg-purple-300/50' },
  blue: { card: 'from-indigo-50 to-white border-indigo-100', text: 'text-indigo-600', glow: 'bg-indigo-300/50' },
  amber: { card: 'from-amber-50 to-white border-amber-100', text: 'text-amber-600', glow: 'bg-amber-300/50' },
  rose: { card: 'from-rose-50 to-white border-rose-100', text: 'text-rose-600', glow: 'bg-rose-300/50' },
  cyan: { card: 'from-cyan-50 to-white border-cyan-100', text: 'text-cyan-600', glow: 'bg-cyan-300/50' },
} as const
export type Tone = keyof typeof TONE

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('rounded-xl border bg-card shadow-sm', className)}>{children}</div>
}

export function PageHeader({
  title,
  desc,
  actions,
}: {
  title: string
  desc?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {desc ? <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p> : null}
        </div>
      </div>
      {actions}
    </div>
  )
}

export function SectionTitle({
  children,
  extra,
}: {
  children: React.ReactNode
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 text-sm font-bold">
        <span className="h-3.5 w-1 rounded-full bg-gradient-to-b from-[#5b76e8] to-[#8c6ff0]" />
        {children}
      </div>
      {extra ? <span className="text-[11px] font-semibold text-muted-foreground">{extra}</span> : null}
    </div>
  )
}

export function StatCard({
  value,
  label,
  tone,
  icon,
}: {
  value: React.ReactNode
  label: string
  tone: Tone
  icon?: React.ReactNode
}) {
  const t = TONE[tone]
  return (
    <div className={cn('relative overflow-hidden rounded-xl border bg-gradient-to-br p-4', t.card)}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className={cn('text-2xl leading-none font-extrabold', t.text)}>{value}</div>
          <div className="mt-2 text-xs font-medium text-muted-foreground">{label}</div>
        </div>
        {icon ? <span className={cn('relative z-10', t.text)}>{icon}</span> : null}
      </div>
      <span className={cn('pointer-events-none absolute -top-5 -right-5 size-16 rounded-full blur-md', t.glow)} />
    </div>
  )
}

export function MasteryBar({ score, baseline }: { score: number; baseline: number }) {
  const tier = tierOf(score, baseline)
  const c = Math.max(0, Math.min(100, Math.round(score)))
  return (
    <div className="relative h-4 rounded-md bg-slate-100">
      <div
        className={cn(
          'flex h-full items-center justify-end rounded-md bg-gradient-to-r pr-1.5 text-[9px] font-bold text-white transition-all duration-700',
          TIER_FILL[tier]
        )}
        style={{ width: `${Math.max(c, 9)}%` }}
      >
        {score}
      </div>
      <div
        className="absolute -top-1 -bottom-1 z-10 border-l border-dashed border-slate-400"
        style={{ left: `${Math.max(0, Math.min(100, baseline))}%` }}
      />
    </div>
  )
}
