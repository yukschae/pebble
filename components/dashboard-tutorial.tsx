"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface Slide {
  image: string
  text: string
}

const slides: Slide[] = [
    {
      image: "/images/tutorial/slide1.png",
      text: "プロフィールを設定して基本情報を登録しよう！ユーザー名と好きなアバターが選べるよ。",
    },
    {
      image: "/images/tutorial/slide2.png",
      text: "RIASEC分析でキャリアに繋がる興味タイプを確認してみよう！どんな分野が得意かな？",
    },
    {
      image: "/images/tutorial/slide3.png",
      text: "OCEAN性格分析で性格傾向を知ろう！自分の性格を知ることも大事だよ。",
    },
    {
      image: "/images/tutorial/slide4.png",
      text: "AIと一緒にパッションシャトルを探って、好きなことを探究し始めよう。",
    },
    {
      image: "/images/tutorial/slide5.png",
      text: "ダッシュボードで進捗を確認し、AIチャットとクエスト形式で成長をサポートするよ。",
    },
  ]

export default function DashboardTutorial({
  onComplete,
  force,
}: { onComplete?: () => void; force?: boolean }) {
  const [open, setOpen] = useState(false)
  const [index, setIndex] = useState(0)
  const [skip, setSkip] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("dashboardTutorialSkipped")
    if (force || !stored) {
      setOpen(true)
    } else {
      onComplete?.()
    }
  }, [force])

  const close = () => {
    if (skip) {
      localStorage.setItem("dashboardTutorialSkipped", "true")
    }
    setOpen(false)
    onComplete?.()
  }

  const next = () => {
    if (index < slides.length - 1) {
      setIndex(index + 1)
    } else {
      close()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-md p-0 overflow-hidden text-white bg-gray-900">
        <div className="h-44 bg-gray-800 flex items-center justify-center">
          <img src={slides[index].image} alt="" className="object-contain h-full" />
        </div>
        <div className="p-6 text-sm">
          <p className="mb-4 text-center">{slides[index].text}</p>
          <div className="flex items-center justify-center space-x-2 mb-4">
            {slides.map((_, i) => (
              <div key={i} className={cn("h-2 w-2 rounded-full", i === index ? "bg-white" : "bg-white/30")} />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <label className="flex items-center text-xs space-x-2">
              <Checkbox id="skip" checked={skip} onCheckedChange={(c) => setSkip(!!c)} />
              <span>次回から表示しない</span>
            </label>
            <Button size="sm" onClick={next}>{index === slides.length - 1 ? "完了" : "次へ"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

