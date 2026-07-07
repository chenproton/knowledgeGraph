import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-4xl font-bold tracking-tight">Knowledge Graph</h1>
      <p className="text-muted-foreground text-lg">
        知识图谱可视化与管理项目初始化完成
      </p>
      <Button>开始使用</Button>
    </main>
  )
}
