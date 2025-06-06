/**
 * パッションシャトルページコンポーネント
 *
 * このファイルは、ユーザーのパッションシャトル（興味と才能を掛け合わせたキャリアコンセプト）を
 * 設定するためのページを実装しています。
 *
 * 主な機能：
 * - パッションシャトル候補の生成
 * - 候補の表示と選択
 * - フィードバックに基づく候補の修正
 * - 選択したパッションシャトルの保存
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 *
 * データフロー：
 * 1. RIASEC/OCEAN結果に基づいてパッションシャトル候補を生成
 * 2. ユーザーが候補を選択
 * 3. 必要に応じてフィードバックを提供し、候補を修正
 * 4. 選択したパッションシャトルをデータベースに保存
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - app/api/passion-shuttle/suggest/route.ts (候補生成API)
 * - app/api/passion-shuttle/refine/route.ts (候補修正API)
 * - app/api/passion-shuttle/save/route.ts (保存API)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Rocket, RefreshCw, Check, Tag, AlertCircle, Sparkles, ChevronRight, Loader2 } from "lucide-react"
import {
  getUserRiasecResults,
  getUserOceanResults,
  getLatestPassionShuttleSuggestions,
  getSupabaseClient,
  savePassionShuttle as savePassionShuttleToDb,
} from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"
import { useAuthContext } from "@/lib/supabase"

import type { PassionSuggestion } from "@/lib/types";


export default function PassionShuttlePage() {
  const router = useRouter()
  const { user } = useAuthContext()

  const [token, setToken] = useState<string | null>(null)        
  useEffect(() => {
    getSupabaseClient().auth
      .getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null))
  }, [])  

  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasRiasecResults, setHasRiasecResults] = useState(false)
  const [hasOceanResults, setHasOceanResults] = useState(false)
  const [suggestions, setSuggestions] = useState<PassionSuggestion[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [showStars, setShowStars] = useState(false)

  useEffect(() => {
    setShowStars(true)
    if (user) {
      checkResults()
    }
  }, [user])

  // RIASECとOCEAN結果の確認
  const checkResults = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // RIASECとOCEAN結果の確認
      const riasecResults = await getUserRiasecResults(user.id)
      const oceanResults = await getUserOceanResults(user.id)

      setHasRiasecResults(!!riasecResults)
      setHasOceanResults(!!oceanResults)

      // 両方の結果がある場合、最新の提案を取得
      if (riasecResults && oceanResults) {
        const latestSuggestions = await getLatestPassionShuttleSuggestions(user.id)
        if (latestSuggestions) {
          setSuggestions(latestSuggestions.suggestions)
        }
      }
    } catch (error) {
      console.error("Error checking results:", error)
      setError("結果の確認中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const authHeaders = (): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  })                               // ★
      
  // パッションシャトル提案の生成
  const generateSuggestions = async () => {
    if (!user) return
    try {
      setGenerating(true)
      setError(null)

      const res = await fetch("/api/passion-shuttle/suggest", {
        method: "POST",
        headers: authHeaders(),                          // ★
        body: JSON.stringify({}),
      })

      const txt = await res.text()
      const data = JSON.parse(txt)

      if (!res.ok) throw new Error(data.error || "提案の生成に失敗しました。")
      setSuggestions(data.suggestions)
      setSelectedSuggestion(null)
    } catch (e) {
      console.error(e)
      setError(`提案の生成中にエラーが発生しました: ${(e as Error).message}`)
    } finally {
      setGenerating(false)
    }
  }

  /* ─────────────────────────────────────────────────────────────── */
  /* refine                                                         */
  const refineSuggestions = async () => {
    if (!user) return
    if (!feedback.trim()) return setError("フィードバックを入力してください。")

    try {
      setRefining(true)
      setError(null)

      const res  = await fetch("/api/passion-shuttle/refine", {
        method: "POST",
        headers: authHeaders(),                          // ★
        body: JSON.stringify({ feedback }),
      })

      const txt  = await res.text()
      const data = JSON.parse(txt)

      if (!res.ok) throw new Error(data.error || "提案の修正に失敗しました。")
      setSuggestions(data.suggestions)
      setSelectedSuggestion(null)
      setFeedback("")
    } catch (e) {
      console.error(e)
      setError(`提案の修正中にエラーが発生しました: ${(e as Error).message}`)
    } finally {
      setRefining(false)
    }
  }

  /* ─────────────────────────────────────────────────────────────── */
  /* save                                                           */
  const handleSavePassionShuttle = async () => {
    if (!user || selectedSuggestion === null) return

    try {
      setSaving(true)
      setError(null)

      const s = suggestions[selectedSuggestion]
      await savePassionShuttleToDb(user.id, s.title, s.description, s.tags)

      router.push("/dashboard")
    } catch (e) {
      console.error(e)
      setError(`保存中にエラーが発生しました: ${(e as Error).message}`)
    } finally {
      setSaving(false)
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
              パッションシャトル
            </h1>
            <div className="w-32"></div> {/* スペーサー */}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">読み込み中...</p>
            </div>
          ) : !hasRiasecResults || !hasOceanResults ? (
            <div className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-white/10 mb-8">
              <div className="flex items-start text-amber-400 mb-6">
                <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">分析結果が不足しています</h3>
                  <p className="text-gray-300">
                    パッションシャトルを生成するには、RIASECタイプとOCEANタイプの両方の分析結果が必要です。まずは分析を完了してください。
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {!hasRiasecResults && (
                  <button
                    onClick={() => router.push("/riasec/assessment")}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl text-white font-medium"
                  >
                    <span className="mr-2">RIASEC分析を開始</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {!hasOceanResults && (
                  <button
                    onClick={() => router.push("/ocean/assessment")}
                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-xl text-white font-medium"
                  >
                    <span className="mr-2">OCEAN分析を開始</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* 説明 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-blue-400" />
                  パッションシャトルとは？
                </h2>
                <p className="text-gray-300 mb-4">
                  パッションシャトルは、あなたの興味・関心と才能を掛け合わせた、創造的なキャリアコンセプトです。従来の「医者」「弁護士」のような具体的な職業ではなく、より抽象的で創造的な組み合わせを提案します。
                </p>
                <p className="text-gray-300">
                  あなたのRIASECタイプとOCEANタイプの分析結果に基づいて、AIがあなたに合ったパッションシャトル候補を提案します。気に入った提案を選んで、あなただけのキャリア探究の旅を始めましょう！
                </p>
              </motion.div>

              {/* 生成ボタン */}
              {suggestions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="flex justify-center mb-8"
                >
                  <button
                    onClick={generateSuggestions}
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
                        <Sparkles className="w-5 h-5 mr-2" />
                        パッションシャトルを生成する
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* 提案一覧 */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-center">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                      あなたへのパッションシャトル提案
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 gap-6">
                    {suggestions.map((suggestion, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className={`bg-gray-800/50 rounded-xl p-6 shadow-lg border ${
                          selectedSuggestion === index
                            ? "border-blue-500 shadow-blue-500/20"
                            : "border-white/10 hover:border-white/30"
                        } cursor-pointer transition-all duration-300`}
                        onClick={() => setSelectedSuggestion(index)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold mb-3 text-white">{suggestion.title}</h3>
                          {selectedSuggestion === index && (
                            <div className="bg-blue-500 rounded-full p-1">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{suggestion.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {suggestion.tags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="flex items-center text-xs bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-full border border-indigo-500/30"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* フィードバックと修正 */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">提案を修正する</h3>
                  <p className="text-gray-300 mb-4">
                    提案に対するフィードバックを入力してください。どのような点が気に入ったか、どのような方向性を探りたいかなど、具体的に記述すると、より良い提案が得られます。
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="例：「アート×テクノロジー」の方向性が気に入りました。もう少し教育的な要素も入れてほしいです。"
                    className="w-full h-32 bg-gray-900/50 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={refineSuggestions}
                      disabled={refining || !feedback.trim()}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 rounded-lg text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {refining ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          修正中...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5 mr-2" />
                          提案を修正する
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 選択と保存 */}
              {suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">パッションシャトルを選択する</h3>
                  <p className="text-gray-300 mb-6">
                    気に入った提案を選択して、あなたのパッションシャトルとして設定しましょう。選択したパッションシャトルに基づいて、クエストが生成されます。
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={handleSavePassionShuttle}
                      disabled={saving || selectedSuggestion === null}
                      className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-5 h-5 mr-2" />
                          パッションシャトルを打ち上げる
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
