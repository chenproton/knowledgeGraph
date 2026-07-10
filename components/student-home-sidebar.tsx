'use client'

import Link from 'next/link'
import {
  MonitorPlay,
  Bot,
  Box,
  Wand2,
  ClipboardList,
  Upload,
  Award,
  PlayCircle,
  AlertTriangle,
  Layers,
  TrendingUp,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const MENU = [
  { label: '直播课堂', icon: MonitorPlay, active: false },
  { label: '个人课堂', icon: Bot, active: true },
  { label: '实训仿真', icon: Box, active: false },
  { label: '课程智作', icon: Wand2, active: false },
  { label: '我的考试', icon: ClipboardList, active:  false },
  { label: '学习成效', icon: TrendingUp, active: false },
  { label: '资源上传', icon: Upload, active: false },
]

const TRACKS = [
  { title: '主-配-微电网协同...', status: '直播中', statusCls: 'bg-emerald-100 text-emerald-600', icon: PlayCircle },
  { title: '三相四线错误接线...', status: '生成中', statusCls: 'bg-slate-100 text-slate-500', icon: AlertTriangle },
  { title: '电能表更换三维仿...', status: '学习中', statusCls: 'bg-emerald-100 text-emerald-600', icon: Layers },
]

export function StudentHomeSidebar({ onMenuSelect }: { onMenuSelect?: (label: string) => void }) {
  return (
    <aside className="flex h-full w-56 flex-col border-r bg-[#f5f8fc]">
      {/* 标题 */}
      <div className="flex h-14 items-center border-b border-slate-100 px-4">
        <span className="text-base font-bold text-slate-800">计量专业AI数字培训师</span>
      </div>

      {/* 个人信息 */}
      <div className="flex flex-col items-center border-b border-slate-100 px-4 py-5">
        <div className="relative">
          <Avatar className="size-16 border-2 border-white shadow-sm">
            <AvatarImage src="/avatars/student.png" alt="李亮" />
            <AvatarFallback className="bg-blue-100 text-blue-600 text-lg">李</AvatarFallback>
          </Avatar>
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-blue-500 text-white shadow">
            <Award className="size-3" />
          </span>
        </div>
        <div className="mt-3 text-center">
          <div className="text-base font-bold text-slate-800">李亮</div>
          <div className="mt-0.5 text-xs text-slate-500">装表接电 · 入职1年</div>
        </div>
      </div>

      {/* 主导航 */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {MENU.map((item) => (
          <Link
            key={item.label}
            href="#"
            onClick={(e) => { e.preventDefault(); onMenuSelect?.(item.label) }}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              item.active
                ? 'bg-blue-50 text-slate-800'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-full',
                item.active
                  ? 'bg-emerald-500 text-white'
                  : 'bg-transparent text-slate-500'
              )}
            >
              <item.icon className="size-4" />
            </span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* 学习轨迹 */}
      <div className="border-t border-slate-100 px-4 py-4">
        <div className="mb-3 text-sm font-bold text-slate-700">学习轨迹</div>
        <div className="space-y-3">
          {TRACKS.map((track) => (
            <div key={track.title} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <track.icon className="size-4 shrink-0 text-slate-400" />
                <span className="truncate text-xs text-slate-600">{track.title}</span>
              </div>
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium',
                  track.statusCls
                )}
              >
                {track.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
