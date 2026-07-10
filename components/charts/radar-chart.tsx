'use client'

import {
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts'
import { DIMENSION_COLORS } from '@/lib/utils-chart'

type RadarChartProps = {
  data: { dimension: string; value: number; fullMark?: number }[]
  highlighted?: string | null
}

export function RadarChart({ data, highlighted }: RadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 12 }} />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={6} tick={{ fontSize: 10 }} />
        <Radar
          name="能力得分"
          dataKey="value"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.25}
        />
        {highlighted && (
          <Radar
            name="高亮维度"
            dataKey={(entry: { dimension: string; value: number }) =>
              entry.dimension === highlighted ? entry.value : 0
            }
            stroke={DIMENSION_COLORS[highlighted] || '#ef4444'}
            fill={DIMENSION_COLORS[highlighted] || '#ef4444'}
            fillOpacity={0.5}
          />
        )}
      </ReRadarChart>
    </ResponsiveContainer>
  )
}
