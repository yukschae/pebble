/**
 * クエスト方向性設定ページコンポーネント
 *
 * このファイルは、クエストの方向性（探究活動の大まかな方向）を
 * 設定するためのページを実装しています。
 *
 * 主な機能：
 * - パッションシャトルの確認
 * - クエスト方向性候補の生成
 * - 候補の表示と選択
 * - フィードバックに基づく候補の修正
 * - 選択した方向性の保存
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 *
 * データフロー：
 * 1. パッションシャトルを確認
 * 2. パッションシャトルに基づいて方向性候補を生成
 * 3. ユーザーが候補を選択
 * 4. 必要に応じてフィードバックを提供し、候補を修正
 * 5. 選択した方向性をデータベースに保存
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - app/api/quest/suggest-directions/route.ts (方向性生成API)
 * - app/api/quest/refine-directions/route.ts (方向性修正API)
 * - app/quest-setup/quests/page.tsx (クエスト設定ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Rocket, RefreshCw, Check, Tag, AlertCircle, ChevronRight, Loader2, MapPin } from "lucide-react"
import { getSelectedPassionShuttle, getSupabaseClient, saveQuestDirection } from "@/lib/supabase"
import { AuthCheck } from "@/components/auth/auth-check"
import { useAuthContext } from "@/lib/supabase"

export default function QuestDirectionPage() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [refining, setRefining] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [passionShuttle, setPassionShuttle] = useState<any>(null)
  const [directions, setDirections] = useState<any[]>([])
  const [selectedDirection, setSelectedDirection] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
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

  useEffect(() => {
    setShowStars(true)
    if (user) {
      checkPassionShuttle()
    }
  }, [user])

  // パッションシャトルの確認
  const checkPassionShuttle = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // パッションシャトルを取得
      const shuttle = await getSelectedPassionShuttle(user.id)

      if (!shuttle) {
        setError("パッションシャトルが設定されていません。先にパッションシャトルを設定してください。")
        return
      }

      setPassionShuttle(shuttle)
    } catch (error) {
      console.error("Error checking passion shuttle:", error)
      setError("パッションシャトルの確認中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const authHeaders = (t: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  })


  // クエスト方向性の生成
  const generateDirections = async () => {
    if (!user) return

    try {
      setGenerating(true)
      setError(null)

      const response = await fetch("/api/quest/suggest-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "方向性の生成に失敗しました。")
      }

      const data = await response.json()
      setDirections(data.directions || [])
      setSelectedDirection(null)
    } catch (error) {
      console.error("Error generating directions:", error)
      setError(`方向性の生成中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setGenerating(false)
    }
  }

  // クエスト方向性の修正
  const refineDirections = async () => {
    if (!user) return

    try {
      if (!feedback.trim()) {
        setError("フィードバックを入力してください。")
        return
      }

      setRefining(true)
      setError(null)


      const response = await fetch("/api/quest/refine-directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          feedback,
          currentDirections: directions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "方向性の修正に失敗しました。")
      }

      const data = await response.json()
      setDirections(data.directions || [])
      setSelectedDirection(null)
      setFeedback("")
    } catch (error) {
      console.error("Error refining directions:", error)
      setError(`方向性の修正中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setRefining(false)
    }
  }

  // クエスト方向性の保存
  const saveDirection = async () => {
    if (!user) return

    try {
      if (selectedDirection === null) {
        setError("クエスト方向性を選択してください。")
        return
      }

      setSaving(true)
      setError(null)

      const access = await fetchAuthToken()
      const direction = directions[selectedDirection]

      await saveQuestDirection(user.id, direction)

      // クエスト設定ページにリダイレクト
      router.push("/quest-setup/quests")
    } catch (error) {
      console.error("Error saving quest direction:", error)
      setError(
        `クエスト方向性の保存中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`,
      )
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
              クエスト方向性の設定
            </h1>
            <div className="w-32"></div> {/* スペーサー */}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-300">読み込み中...</p>
            </div>
          ) : !passionShuttle ? (
            <div className="bg-gray-800/50 rounded-xl p-8 shadow-lg border border-white/10 mb-8">
              <div className="flex items-start text-amber-400 mb-6">
                <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-xl mb-2">パッションシャトルが設定されていません</h3>
                  <p className="text-gray-300">
                    クエスト方向性を設定するには、先にパッションシャトルを設定する必要があります。
                  </p>
                </div>
              </div>

              <div className="flex justify-center mt-6">
                <button
                  onClick={() => router.push("/passion-shuttle")}
                  className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium"
                >
                  <span className="mr-2">パッションシャトルを設定する</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* パッションシャトル情報 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-blue-400" />
                  あなたのパッションシャトル
                </h2>
                <div className="flex items-start">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-red-600/20 border border-white/20">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground flex items-center">「{passionShuttle.title}」</div>
                    <p className="text-gray-300 mt-2">{passionShuttle.description}</p>
                    <div className="flex gap-2 mt-3">
                      {passionShuttle.tags.map((tag: string, index: number) => (
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

              {/* 説明 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-400" />
                  クエスト方向性とは？
                </h2>
                <p className="text-gray-300 mb-4">
                  クエスト方向性は、パッションシャトルを具体的なプロジェクトに落とし込むための指針です。
                  あなたのパッションシャトルに基づいて、どのような探究活動を行うかの大まかな方向性を決めます。
                </p>
                <p className="text-gray-300">
                  例えば、「アート×人助け」というパッションシャトルなら、「高齢者施設でのアートセラピーワークショップ」や「子ども向け感情表現アートプログラム」などの方向性が考えられます。
                </p>
              </motion.div>

              {/* 生成ボタン */}
              {directions.length === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex justify-center mb-8"
                >
                  <button
                    onClick={generateDirections}
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
                        <MapPin className="w-5 h-5 mr-2" />
                        クエスト方向性を生成する
                      </>
                    )}
                  </button>
                </motion.div>
              )}

              {/* 方向性一覧 */}
              {directions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="mb-8"
                >
                  <h2 className="text-2xl font-semibold mb-6 text-center">
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                      あなたへのクエスト方向性提案
                    </span>
                  </h2>

                  <div className="grid grid-cols-1 gap-6">
                    {directions.map((direction, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                        className={`bg-gray-800/50 rounded-xl p-6 shadow-lg border ${
                          selectedDirection === index
                            ? "border-blue-500 shadow-blue-500/20"
                            : "border-white/10 hover:border-white/30"
                        } cursor-pointer transition-all duration-300`}
                        onClick={() => setSelectedDirection(index)}
                      >
                        <div className="flex justify-between items-start">
                          <h3 className="text-xl font-semibold mb-3 text-white">{direction.title}</h3>
                          {selectedDirection === index && (
                            <div className="bg-blue-500 rounded-full p-1">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-4">{direction.description}</p>
                        <div className="flex flex-wrap gap-2">
                          {direction.tags.map((tag: string, tagIndex: number) => (
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
              {directions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">提案を修正する</h3>
                  <p className="text-gray-300 mb-4">
                    提案に対するフィードバックを入力してください。どのような点が気に入ったか、どのような方向性を探りたいかなど、具体的に記述すると、より良い提案が得られます。
                  </p>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="例：「高齢者向けのアートセラピー」の方向性が気に入りました。もう少し具体的な活動内容も提案してほしいです。"
                    className="w-full h-32 bg-gray-900/50 border border-white/10 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={refineDirections}
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
              {directions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                  className="bg-gray-800/50 rounded-xl p-6 shadow-lg border border-white/10 mb-8"
                >
                  <h3 className="text-xl font-semibold mb-4">クエスト方向性を選択する</h3>
                  <p className="text-gray-300 mb-6">
                    気に入った方向性を選択して、あなたのクエスト方向性として設定しましょう。選択した方向性に基づいて、具体的なクエストが生成されます。
                  </p>
                  <div className="flex justify-center">
                    <button
                      onClick={saveDirection}
                      disabled={saving || selectedDirection === null}
                      className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-xl text-white font-medium shadow-lg shadow-blue-600/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          保存中...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-5 h-5 mr-2" />
                          クエスト方向性を設定する
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
