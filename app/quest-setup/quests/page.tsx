/**
 * クエスト設定ページコンポーネント
 *
 * このファイルは、ユーザーのクエスト（探究活動の段階的なミッション）を
 * 設定するためのページを実装しています。
 *
 * 主な機能：
 * - クエスト方向性の確認
 * - クエスト候補の生成
 * - 難易度に基づくクエストのフィルタリング
 * - クエストの保存
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 *
 * データフロー：
 * 1. クエスト方向性を確認
 * 2. 方向性に基づいてクエスト候補を生成
 * 3. 難易度でフィルタリング
 * 4. 選択したクエストをデータベースに保存
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - app/api/quest/generate-quests/route.ts (クエスト生成API)
 * - app/api/quest/filter-quests/route.ts (フィルタリングAPI)
 * - app/quest-setup/direction/page.tsx (方向性設定ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, AlertCircle, ChevronRight, Loader2, MapPin, Flag, Check, Filter, Save, Star } from "lucide-react"
import { getSelectedQuestDirection, saveQuests, getSupabaseClient } from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"
import { useAuthContext } from "@/lib/supabase"

export default function QuestSetupPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [filtering, setFiltering] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questDirection, setQuestDirection] = useState<any>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [filteredQuests, setFilteredQuests] = useState<any[]>([])
  const [minDifficulty, setMinDifficulty] = useState(1)
  const [maxDifficulty, setMaxDifficulty] = useState(5)
  const [step, setStep] = useState(1) // 1: 生成, 2: 難易度選択, 3: 確認
  const [showStars, setShowStars] = useState(false)

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

  // クエスト方向性の確認
  const checkQuestDirection = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // クエスト方向性を取得
      const direction = await getSelectedQuestDirection(user.id)

      if (!direction) {
        setError("クエスト方向性が設定されていません。先にクエスト方向性を設定してください。")
        return
      }

      setQuestDirection(direction)
    } catch (error) {
      console.error("Error checking quest direction:", error)
      setError("クエスト方向性の確認中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  // クエストの生成
  const generateQuests = async () => {
    if (!user) return

    try {
      setGenerating(true)
      setError(null)

      const access = await fetchAuthToken()
      const response = await fetch("/api/quest/generate-quests", {
        method: "POST",
        headers: authHeaders(access),
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "クエストの生成に失敗しました。")
      }

      const data = await response.json()
      setQuests(data.quests || [])
      setStep(2)
    } catch (error) {
      console.error("Error generating quests:", error)
      setError(`クエストの生成中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setGenerating(false)
    }
  }

  // クエストのフィルタリング
  const filterQuests = async () => {
    if (!user) return

    try {
      setFiltering(true)
      setError(null)

      const response = await fetch("/api/quest/filter-quests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quests,
          minDifficulty,
          maxDifficulty,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "クエストのフィルタリングに失敗しました。")
      }

      const data = await response.json()
      setFilteredQuests(data.quests || [])
      setStep(3)
    } catch (error) {
      console.error("Error filtering quests:", error)
      setError(
        `クエストのフィルタリング中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      )
    } finally {
      setFiltering(false)
    }
  }

  // クエストの保存
  const saveQuestList = async () => {
    if (!user) return

    try {
      setSaving(true)
      setError(null)

      await saveQuests(user.id, filteredQuests)

      // ダッシュボードにリダイレクト
      router.push("/dashboard")
    } catch (error) {
      console.error("Error saving quests:", error)
      setError(`クエストの保存中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSaving(false)
    }
  }

  // 難易度のラベル
  const getDifficultyLabel = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "とても簡単"
      case 2:
        return "簡単"
      case 3:
        return "普通"
      case 4:
        return "難しい"
      case 5:
        return "とても難しい"
      default:
        return "不明"
    }
  }

  // 難易度の色
  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return "from-green-400 to-green-600"
      case 2:
        return "from-teal-400 to-teal-600"
      case 3:
        return "from-blue-400 to-blue-600"
      case 4:
        return "from-purple-400 to-purple-600"
      case 5:
        return "from-red-400 to-red-600"
      default:
        return "from-gray-400 to-gray-600"
    }
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
        {/* Stars background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showStars &&
              Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0.1, 0.8, 0.1],
                    scale: [0.8, 1.2, 0.8],
                  }}
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

        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header */}
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
            <div className="w-32"></div> {/* スペーサー */}
          </div>

          {/* ステップインジケーター */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <div className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 1 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                }`}
              >
                1
              </div>
              <div className={`w-16 h-1 ${step >= 2 ? "bg-blue-500" : "bg-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 2 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                }`}
              >
                2
              </div>
              <div className={`w-16 h-1 ${step >= 3 ? "bg-blue-500" : "bg-gray-700"}`}></div>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  step >= 3 ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-400"
                }`}
              >
                3
              </div>
            </div>
          </motion.div>

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
              {/* クエスト方向性情報 */}
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
                    <div className="flex gap-2 mt-3">
                    {(questDirection.tags ?? questDirection.focus_areas ?? []).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* ステップ1: クエスト生成 */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Flag className="w-5 h-5 mr-2 text-blue-400" />
                    クエストの生成
                  </h2>
                  <p className="text-gray-300 mb-6">
                    あなたのクエスト方向性に基づいて、様々な難易度のクエストを生成します。
                    生成されたクエストから、あなたに合った難易度のものを選択していきます。
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={generateQuests}
                      disabled={generating}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          生成中...
                        </>
                      ) : (
                        <>
                          <Flag className="w-5 h-5 mr-2" />
                          クエストを生成する
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ステップ2: 難易度選択 */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Filter className="w-5 h-5 mr-2 text-blue-400" />
                    難易度の選択
                  </h2>
                  <p className="text-gray-300 mb-6">
                    あなたに合った難易度のクエストを選びましょう。下のスライダーで難易度の範囲を設定してください。
                  </p>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">最小難易度</span>
                      <span className="text-sm font-medium">
                        {minDifficulty}: {getDifficultyLabel(minDifficulty)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={minDifficulty}
                      onChange={(e) => setMinDifficulty(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">最大難易度</span>
                      <span className="text-sm font-medium">
                        {maxDifficulty}: {getDifficultyLabel(maxDifficulty)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      value={maxDifficulty}
                      onChange={(e) => setMaxDifficulty(Number(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={filterQuests}
                      disabled={filtering || minDifficulty > maxDifficulty}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {filtering ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          フィルタリング中...
                        </>
                      ) : (
                        <>
                          <Filter className="w-5 h-5 mr-2" />
                          この難易度でクエストを選ぶ
                        </>
                      )}
                    </button>
                  </div>

                  {minDifficulty > maxDifficulty && (
                    <div className="mt-4 text-center text-red-400 text-sm">
                      最小難易度は最大難易度以下に設定してください。
                    </div>
                  )}
                </motion.div>
              )}

              {/* ステップ3: クエスト確認 */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h2 className="text-xl font-semibold mb-4 flex items-center">
                    <Check className="w-5 h-5 mr-2 text-blue-400" />
                    クエストの確認
                  </h2>
                  <p className="text-gray-300 mb-6">
                    以下のクエストがあなたのロードマップとして設定されます。内容を確認して、問題なければ保存してください。
                  </p>

                  <div className="space-y-6 mb-8">
                    {filteredQuests.map((quest, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                        className="bg-gray-900/50 rounded-xl p-6 border border-white/10"
                      >
                        <div className="flex items-start">
                          <div
                            className={`w-12 h-12 bg-gradient-to-br ${getDifficultyColor(
                              quest.difficulty,
                            )} rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg border border-white/20`}
                          >
                            <span className="text-white font-bold">{index + 1}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-white">{quest.title}</h3>
                              <div className="flex items-center bg-gray-800 px-2 py-1 rounded-full text-xs">
                                <Star className="w-3 h-3 text-yellow-400 mr-1" />
                                <span>
                                  難易度: {quest.difficulty} ({getDifficultyLabel(quest.difficulty)})
                                </span>
                              </div>
                            </div>
                            <p className="text-gray-300 mt-2 mb-3">{quest.description}</p>
                            <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                              <h4 className="text-sm font-medium text-gray-300 mb-2">行動例:</h4>
                              <ul className="list-disc list-inside text-sm text-gray-400 space-y-1">
                                {quest.actions.map((action: string, actionIndex: number) => (
                                  <li key={actionIndex}>{action}</li>
                                ))}
                              </ul>
                            </div>
                            <div className="bg-gray-800/50 rounded-lg p-3">
                              <h4 className="text-sm font-medium text-gray-300 mb-1">成果物:</h4>
                              <p className="text-sm text-gray-400">{quest.outcome}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={saveQuestList}
                      disabled={saving}
                      className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
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
                  </div>
                </motion.div>
              )}

              {/* エラーメッセージ */}
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
      </div>
    </AuthCheck>
  )
}
