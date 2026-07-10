import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { DemoProvider } from '@/components/demo-provider'
import { AppShell } from '@/components/app-shell'
import './globals.css'

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

export const metadata: Metadata = {
  title: '知识图谱与学习成效分析 · 演示系统',
  description: '国网项目知识图谱与学习成效分析演示原型',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <TooltipProvider>
          <Suspense fallback={<div className="flex min-h-screen items-center justify-center">加载中...</div>}>
            <DemoProvider>
              <AppShell>{children}</AppShell>
              <Toaster position="top-center" richColors />
            </DemoProvider>
          </Suspense>
        </TooltipProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
