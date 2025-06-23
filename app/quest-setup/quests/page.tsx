"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Loader2, Pencil, Sparkles, Save } from "lucide-react"
import {
  getSelectedQuestDirection,
  getUserQuests,
  saveQuests,
  getSupabaseClient,
  useAuthContext,
} from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface QuestForm {
  title: string
  description: string
  actions: string
  outcome: string
  difficulty: number
  planet?: string
}

export default function QuestSetupPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [questDirection, setQuestDirection] = useState<any>(null)
  const [quests, setQuests] = useState<(QuestForm | null)[]>([null, null, null, null, null])
  const [editing, setEditing] = useState<number | null>(null)
  const [showStars, setShowStars] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getSupabaseClient().auth.getSession().then(({ data }) => setToken(data.session?.access_token ?? null))
  }, [])

  const fetchAuthToken = async () => {
    const { data } = await getSupabaseClient().auth.getSession()
    const t = data.session?.access_token ?? null
    setToken(t)
    return t
  }

  const authHeaders = (t: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  })

  useEffect(() => {
    setShowStars(true)
    if (user) {
      checkQuestDirection()
    }
  }, [user])

  const checkQuestDirection = async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)

      const direction = await getSelectedQuestDirection(user.id)
      if (!direction) {
        setError("クエスト方向性が設定されていません。先にクエスト方向性を設定してください。")
        return
      }

      setQuestDirection(direction)
      const existing = await getUserQuests(user.id)
      if (existing && existing.length > 0) {
        const filled = new Array(5).fill(null) as (QuestForm | null)[]
        existing.slice(0, 5).forEach((q, i) => {
          filled[i] = {
            title: q.title,
            description: q.description,
            actions: (q.actions || []).join("\n"),
            outcome: q.outcome,
            difficulty: q.difficulty,
            planet: q.planet,
          }
        })
        setQuests(filled)
      }
    } catch (err) {
      console.error("checkQuestDirection", err)
      setError("クエスト情報の取得中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!user) return
    try {
      setGenerating(true)
      setError(null)

      const access = await fetchAuthToken()
      const response = await fetch("/api/quest/generate-quests", {
        method: "POST",
        headers: authHeaders(access),
        body: JSON.stringify({
          userId: user.id,
          existingQuests: quests.filter((q) => q),
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "生成に失敗しました")
      }

      const data = await response.json()
      const arr = new Array(5).fill(null) as (QuestForm | null)[]
      ;(data.quests || []).slice(0, 5).forEach((q: any, i: number) => {
        arr[i] = {
          title: q.title,
          description: q.description,
          actions: (q.actions || []).join("\n"),
          outcome: q.outcome,
          difficulty: q.difficulty,
          planet: q.planet,
        }
      })
      setQuests(arr)
    } catch (err) {
      console.error("generate", err)
      setError(`クエスト生成中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!user) return
    try {
      setSaving(true)
      setError(null)

      const payload = quests.map((q, idx) =>
        q
          ? {
              title: q.title,
              description: q.description,
              actions: q.actions.split(/\n+/).filter(Boolean),
              outcome: q.outcome,
              difficulty: q.difficulty,
              planet: q.planet || "gray",
              order: idx,
              completed: false,
              current: idx === 0,
            }
          : null,
      ).filter(Boolean)

      await saveQuests(user.id, payload as any[])
      router.push("/dashboard")
    } catch (err) {
      console.error("save", err)
      setError(`クエストの保存中にエラーが発生しました: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setSaving(false)
    }
  }

  const Card = ({ quest, index }: { quest: QuestForm | null; index: number }) => (
    <motion.div
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.2 }}
      className="relative w-60 h-40 bg-gray-800/50 rounded-xl border border-white/10 flex flex-col items-center justify-center mx-2"
    >
      {quest ? (
        <>
          <div className="text-center font-semibold px-2 text-white">{quest.title}</div>
          <Button size="sm" variant="secondary" className="mt-2" onClick={() => setEditing(index)}>
            クエストを変更する
          </Button>
        </>
      ) : (
        <Button variant="ghost" className="animate-pulse" onClick={() => setEditing(index)}>
          クエストを設定する
        </Button>
      )}
    </motion.div>
  )

  const EditDialog = ({ index }: { index: number }) => {
    const q = quests[index] || {
      title: "",
      description: "",
      actions: "",
      outcome: "",
      difficulty: 3,
    }
    const [form, setForm] = useState<QuestForm>(q)
    const save = () => {
      const updated = [...quests]
      updated[index] = form
      setQuests(updated)
      setEditing(null)
    }
    return (
      <Dialog open={editing === index} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>クエスト{index + 1}を編集</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <Input placeholder="タイトル" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Textarea placeholder="説明" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Textarea placeholder="行動例 (改行区切り)" value={form.actions} onChange={(e) => setForm({ ...form, actions: e.target.value })} />
            <Input placeholder="成果物" value={form.outcome} onChange={(e) => setForm({ ...form, outcome: e.target.value })} />
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="secondary">キャンセル</Button>
            </DialogClose>
            <Button onClick={save}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showStars && Array.from({ length: 80 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.1, 0.8, 0.1], scale: [0.8, 1.2, 0.8] }}
                transition={{
                  duration: 2 + Math.random() * 5,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                }}
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 mr-1" /> ダッシュボードに戻る
            </button>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              クエスト設定
            </h1>
            <div className="w-32" />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-300">読み込み中...</p>
            </div>
          ) : !questDirection ? (
            <div className="text-center text-red-400">{error}</div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
              >
                <h2 className="text-xl font-semibold mb-2 flex items-center">
                  <Sparkles className="w-5 h-5 mr-2 text-blue-400" /> あなたのクエスト方向性
                </h2>
                <div className="font-bold">「{questDirection.title}」</div>
                <p className="text-gray-300 mt-2">{questDirection.description}</p>
              </motion.div>

              <div className="flex justify-center mb-6">
                <Button onClick={handleGenerate} disabled={generating} className="gap-2">
                  {generating && <Loader2 className="w-4 h-4 animate-spin" />}
                  AIの力を借りる
                </Button>
              </div>

              <div className="flex justify-center overflow-x-auto pb-6 mb-6">
                {quests.map((q, idx) => (
                  <div key={idx} className="relative">
                    <Card quest={q} index={idx} />
                    <EditDialog index={idx} />
                  </div>
                ))}
              </div>

              <div className="flex justify-center mt-8">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Save className="w-4 h-4" /> クエストを保存する
                </Button>
              </div>

              {error && <div className="mt-6 text-center text-red-400">{error}</div>}
            </>
          )}
        </div>
      </div>
    </AuthCheck>
  )
}
