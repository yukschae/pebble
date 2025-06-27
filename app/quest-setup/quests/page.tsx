"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  AlertCircle,
  ChevronRight,
  Loader2,
  MapPin,
  Wand2,
  Save,
  Edit3,
  Check,
  X,
} from "lucide-react"
import {
  getSelectedQuestDirection,
  getUserQuests,
  saveQuests,
  getSupabaseClient,
  useAuthContext,
} from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"

interface Quest {
  id: number
  title: string
  description: string
  actions: string[]
  outcome: string
  difficulty: number
  completed: boolean
  current: boolean
  order: number
  planet?: string
}

export default function QuestSetupPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questDirection, setQuestDirection] = useState<any>(null)
  const [quests, setQuests] = useState<Quest[]>(
    Array(5)
      .fill(null)
      .map((_, index) => ({
        id: index + 1,
        title: "",
        description: "",
        actions: [],
        outcome: "",
        difficulty: 3,
        completed: false,
        current: index === 0,
        order: index,
      }))
  )
  const [editingCard, setEditingCard] = useState<number | null>(null)
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    actions: ["", "", ""],
    outcome: "",
  })
  const [showStars, setShowStars] = useState(false)
  const [cardsAnimated, setCardsAnimated] = useState(false)

  useEffect(() => {
    getSupabaseClient().auth
      .getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null))
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

  // クエスト方向性と既存クエストの取得
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
        const filled = Array(5)
          .fill(null)
          .map((_, idx) => {
            const q = existing[idx]
            return q
              ? {
                  id: idx + 1,
                  title: q.title,
                  description: q.description,
                  actions: q.actions,
                  outcome: q.outcome,
                  difficulty: q.difficulty,
                  completed: q.completed,
                  current: q.current,
                  order: q.order,
                  planet: q.planet,
                }
              : {
                  id: idx + 1,
                  title: "",
                  description: "",
                  actions: [],
                  outcome: "",
                  difficulty: 3,
                  completed: false,
                  current: idx === 0,
                  order: idx,
                }
          })
        setQuests(filled)
      }

      setTimeout(() => {
        setCardsAnimated(true)
      }, 500)
    } catch (error) {
      console.error("Error checking quest direction:", error)
      setError("クエスト方向性の確認中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const startEditingCard = (index: number) => {
    const quest = quests[index]
    setEditForm({
      title: quest.title,
      description: quest.description,
      actions: quest.actions.length > 0 ? quest.actions : ["", "", ""],
      outcome: quest.outcome,
    })
    setEditingCard(index)
  }

  const saveCardEdit = () => {
    if (editingCard === null) return

    const updated = [...quests]
    updated[editingCard] = {
      ...updated[editingCard],
      title: editForm.title,
      description: editForm.description,
      actions: editForm.actions.filter((a) => a.trim() !== ""),
      outcome: editForm.outcome,
    }
    setQuests(updated)
    setEditingCard(null)
  }

  const cancelCardEdit = () => {
    setEditingCard(null)
    setEditForm({
      title: "",
      description: "",
      actions: ["", "", ""],
      outcome: "",
    })
  }

  const generateRemainingQuests = async () => {
    if (!user) return

    try {
      setGenerating(true)
      setError(null)

      const access = await fetchAuthToken()
      const filledQuests = quests.filter((q) => q.title.trim() !== "")

      const response = await fetch("/api/quest/generate-quests", {
        method: "POST",
        headers: authHeaders(access),
        body: JSON.stringify({
          userId: user.id,
          existingQuests: filledQuests,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "クエストの生成に失敗しました。")
      }

      const data = await response.json()
      const updated = [...quests]
      let generatedIndex = 0

      for (let i = 0; i < updated.length; i++) {
        if (updated[i].title.trim() === "" && generatedIndex < data.quests.length) {
          const q = data.quests[generatedIndex]
          updated[i] = {
            ...updated[i],
            ...q,
            id: i + 1,
            order: i,
            completed: false,
            current: i === 0,
          }
          generatedIndex++
        }
      }

      setQuests(updated)
    } catch (error) {
      console.error("Error generating quests:", error)
      setError(
        `クエストの生成中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setGenerating(false)
    }
  }

  const saveQuestList = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)

      const emptyQuests = quests.filter((q) => q.title.trim() === "")
      if (emptyQuests.length > 0) {
        setError("すべてのクエストを設定してください。")
        return
      }

      await saveQuests(user.id, quests)
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving quests:", error)
      setError(
        `クエストの保存中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setSaving(false)
    }
  }

  const getFilledQuestsCount = () => quests.filter((q) => q.title.trim() !== "").length

  return (
    <AuthCheck>
      <div className="min-h-dvh bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showStars &&
              Array.from({ length: 100 }).map((_, i) => (
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
                    width: `${Math.random() < 0.8 ? 1 : 2}px`,
                    height: `${Math.random() < 0.8 ? 1 : 2}px`,
                    boxShadow: `0 0 ${Math.random() * 4 + 2}px rgba(255, 255, 255, ${Math.random() * 0.5 + 0.5})`,
                  }}
                />
              ))}
          </AnimatePresence>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex items-center px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white border border-white/10"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              ダッシュボードに戻る
            </button>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              クエスト設定
            </h1>
            <div className="w-32"></div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">読み込み中...</p>
            </div>
          ) : !questDirection ? (
            <div className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-white/10 mb-8">
              <div className="flex items-start text-amber-400 mb-6">
                <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">クエスト方向性が設定されていません</h3>
                  <p className="text-gray-300">クエストを設定するには、先にクエスト方向性を設定する必要があります。</p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => router.push("/quest-setup/direction")}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium"
                >
                  <span className="mr-2">クエスト方向性を設定する</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  あなたのクエスト方向性
                </h2>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-blue-600/20 border border-white/20">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground flex items-center">「{questDirection.title}」</div>
                    <p className="text-gray-300 mt-2">{questDirection.description}</p>
                  </div>
                </div>
              </motion.div>

              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-center">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                    あなたのクエストを設定しましょう
                  </span>
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                  {quests.map((quest, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -200, opacity: 0, rotateY: 180 }}
                      animate={
                        cardsAnimated
                          ? {
                              x: 0,
                              opacity: 1,
                              rotateY: 0,
                            }
                          : {}
                      }
                      transition={{
                        duration: 0.8,
                        delay: index * 0.2,
                        type: "spring",
                        stiffness: 100,
                      }}
                      className="relative"
                    >
                      <div className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 hover:border-white/30 transition-all duration-300 min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-blue-400">クエスト {index + 1}</span>
                          {quest.title && (
                            <button onClick={() => startEditingCard(index)} className="p-1 hover:bg-gray-700/50 rounded">
                              <Edit3 className="w-4 h-4 text-gray-400" />
                            </button>
                          )}
                        </div>

                        {quest.title ? (
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-3 text-white">{quest.title}</h3>
                            <p className="text-gray-300 text-sm mb-4">{quest.description}</p>
                            {quest.actions.length > 0 && (
                              <div className="mb-4">
                                <h4 className="text-sm font-medium text-gray-300 mb-2">行動例:</h4>
                                <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                                  {quest.actions.slice(0, 2).map((action, actionIndex) => (
                                    <li key={actionIndex}>{action}</li>
                                  ))}
                                  {quest.actions.length > 2 && (
                                    <li className="text-gray-500">...他{quest.actions.length - 2}項目</li>
                                  )}
                                </ul>
                              </div>
                            )}
                            {quest.outcome && (
                              <div className="mt-auto">
                                <h4 className="text-sm font-medium text-gray-300 mb-1">成果物:</h4>
                                <p className="text-xs text-gray-400">{quest.outcome}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center">
                            <motion.button
                              onClick={() => startEditingCard(index)}
                              className="w-full h-full flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-600 rounded-lg hover:border-blue-500 transition-colors duration-300"
                              animate={{ opacity: [0.5, 1, 0.5] }}
                              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                            >
                              <div className="text-4xl mb-4">✨</div>
                              <div className="text-lg font-medium text-blue-400 mb-2">クエストを設定する</div>
                              <div className="text-sm text-gray-400">タップして内容を入力</div>
                            </motion.button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {getFilledQuestsCount() < 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center mb-8"
                  >
                    <button
                      onClick={generateRemainingQuests}
                      disabled={generating}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-purple-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-5 h-5 mr-2" />
                          AIの力を借りる
                        </>
                      )}
                    </button>
                  </motion.div>
                )}

                {getFilledQuestsCount() === 5 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex justify-center"
                  >
                    <button
                      onClick={saveQuestList}
                      disabled={saving}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl text-white font-medium shadow-lg shadow-green-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          クエストを保存する
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start mb-8"
                >
                  <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </>
          )}
        </div>

        <AnimatePresence>
          {editingCard !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  cancelCardEdit()
                }
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold text-white">クエスト {editingCard! + 1} を編集</h3>
                  <button onClick={cancelCardEdit} className="p-2 hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">タイトル</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="クエストのタイトルを入力"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">説明</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                      placeholder="クエストの説明を入力"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">行動例（3つまで）</label>
                    {editForm.actions.map((action, index) => (
                      <input
                        key={index}
                        type="text"
                        value={action}
                        onChange={(e) => {
                          const newActions = [...editForm.actions]
                          newActions[index] = e.target.value
                          setEditForm({ ...editForm, actions: newActions })
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        placeholder={`行動例 ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">成果物</label>
                    <textarea
                      value={editForm.outcome}
                      onChange={(e) => setEditForm({ ...editForm, outcome: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                      placeholder="クエスト完了時の成果物を入力"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={cancelCardEdit} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white">
                    キャンセル
                  </button>
                  <button onClick={saveCardEdit} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    保存
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthCheck>
  )
}