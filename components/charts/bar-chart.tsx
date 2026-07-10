'use client'

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

type BarChartProps = {
  data: { name: string; value: number }[]
  color?: string
  colors?: string[]
  domain?: [number, number]
}

export function BarChart({ data, color = '#3b82f6', colors, domain = [0, 100] }: BarChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ReBarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
        <YAxis domain={domain} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {colors
            ? data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))
            : <Cell fill={color} />}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  )
}
