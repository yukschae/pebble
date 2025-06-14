"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface Props {
  open: boolean
  onComplete: () => void
  onOpenChange: (open: boolean) => void
}

const ISSUE_LIST = [
  { tag: "地球温暖化", label: "地球の気温が上がってきている" },
  { tag: "海のごみ", label: "海や川がごみで汚れている" },
  { tag: "水不足", label: "水が足りない国がある" },
  { tag: "生物多様性", label: "生き物がどんどん減っている" },
  { tag: "プラごみ問題", label: "プラスチックの使いすぎが心配" },
  { tag: "飢餓と貧困", label: "食べられない人がまだ世界にいる" },
  { tag: "経済格差", label: "お金持ちとそうでない人の差が広がっている" },
  { tag: "食品ロス", label: "ごはんや服がたくさんムダになっている" },
  { tag: "働きすぎ問題", label: "長時間働いて体をこわす人がいる" },
  { tag: "教育の格差", label: "学校に行きづらい子がいる" },
  { tag: "学校の問題", label: "いじめや不登校が問題になっている" },
  { tag: "医療の格差", label: "病院が少なくて困っている人がいる" },
  { tag: "多文化共生", label: "外国の人と仲良く暮らすのが難しいことがある" },
  { tag: "人権の問題", label: "差別やハラスメントが今もある" },
  { tag: "少子化", label: "子どもの数が減っている" },
  { tag: "過疎化", label: "田舎で人が少なくなっている" },
  { tag: "空き家問題", label: "空き家がどんどん増えている" },
  { tag: "防災と支援", label: "災害で助けが届かない人がいる" },
  { tag: "伝統文化の継承", label: "昔の文化が受け継がれていない" },
  { tag: "情報の正しさ", label: "SNSやネットでうその情報が広がる" },
]

export default function SocialIssueDialog({ open, onComplete, onOpenChange }: Props) {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState("")
  const [attachment, setAttachment] = useState<number[]>([5])
  const [selected, setSelected] = useState<string[]>([])

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : prev.length < 3 ? [...prev, tag] : prev,
    )
  }

  const finish = () => {
    const socialIssue = {
      title,
      attachment: attachment[0],
      others: selected,
    }
    sessionStorage.setItem("socialIssue", JSON.stringify(socialIssue))
    onComplete()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-6 text-white bg-gray-900">
        {step === 0 ? (
          <div className="space-y-4">
            <p className="text-center">その前に...! あなたが一番モヤモヤする社会課題は？</p>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：フードロス削減"
              className="w-full p-2 rounded bg-gray-800"
            />
            <p className="text-center">そのモヤモヤはどれくらい強い？</p>
            <Slider
              min={1}
              max={10}
              step={1}
              value={attachment}
              onValueChange={(v) => setAttachment(v)}
            />
            <div className="text-center">{attachment[0]}</div>
            <div className="text-right">
              <Button size="sm" onClick={() => setStep(1)} disabled={!title.trim()}>
                次へ進む
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center">気になる社会課題を3つ選んでね</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {ISSUE_LIST.map((issue) => (
                <button
                  key={issue.tag}
                  onClick={() => toggle(issue.tag)}
                  className={`p-2 border rounded text-xs ${selected.includes(issue.tag) ? "bg-blue-500 text-white" : "bg-gray-800"}`}
                >
                  {issue.tag}
                </button>
              ))}
            </div>
            <div className="text-right">
              <Button size="sm" onClick={finish} disabled={selected.length === 0}>
                パッションシャトルを打ち上げる!
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
