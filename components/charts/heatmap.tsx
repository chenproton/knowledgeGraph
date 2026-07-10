'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

type HeatmapProps = {
  rows: string[]
  cols: string[]
  data: (number | null)[][]
  onCellClick?: (row: number, col: number) => void
}

export function Heatmap({ rows, cols, data, onCellClick }: HeatmapProps) {
  return (
    <div className="overflow-auto rounded-md border">
      <div
        className="grid gap-px bg-border"
        style={{
          gridTemplateColumns: `120px repeat(${cols.length}, minmax(80px, 1fr))`,
        }}
      >
        <div className="sticky left-0 bg-muted p-2 text-xs font-medium text-muted-foreground" />
        {cols.map((c) => (
          <div
            key={c}
            className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground"
            title={c}
          >
            {c}
          </div>
        ))}
        {rows.map((r, i) => (
          <React.Fragment key={r}>
            <div
              className="sticky left-0 bg-background p-2 text-xs font-medium text-foreground"
              title={r}
            >
              {r}
            </div>
            {cols.map((_, j) => {
              const value = data[i]?.[j]
              const covered = value != null && value > 0
              return (
                <button
                  key={`${i}-${j}`}
                  onClick={() => onCellClick?.(i, j)}
                  className={cn(
                    'flex h-10 items-center justify-center text-xs font-medium transition-colors',
                    covered
                      ? 'bg-emerald-500/80 text-white hover:bg-emerald-600'
                      : 'bg-background text-muted-foreground hover:bg-red-50'
                  )}
                  title={covered ? `覆盖度 ${value}%` : '未覆盖'}
                >
                  {covered ? `${value}%` : '—'}
                </button>
              )
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}
