/**
 * RIASEC分析ページコンポーネント
 *
 * このファイルは、RIASEC（職業興味）分析を実施するためのページを実装しています。
 * ユーザーが質問に回答し、その結果を分析して保存します。
 *
 * 主な機能：
 * - RIASEC質問の表示
 * - ユーザー回答の収集
 * - 回答データの分析と結果の計算
 * - 結果のデータベース保存
 * - 結果ページへのリダイレクト
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 *
 * データフロー：
 * 1. ユーザーが質問に回答
 * 2. 回答データを状態変数に保存
 * 3. 送信時に回答を分析して結果を計算
 * 4. 結果をデータベースに保存
 * 5. 結果ページにリダイレクト
 *
 * 関連ファイル：
 * - lib/riasec-data.ts (質問データと分析ロジック)
 * - lib/supabase.ts (データベース操作)
 * - app/riasec/results/page.tsx (結果表示ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, Check, AlertCircle } from "lucide-react"
import { riasecQuestions, calculateRiasecResults } from "@/lib/riasec-data"
import { saveRiasecResponses, saveRiasecResults, checkTablesExist } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function RiasecAssessment() {
  const router = useRouter()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showStars, setShowStars] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tablesStatus, setTablesStatus] = useState<any>(null)

  useEffect(() => {
    setShowStars(true)

    // テーブルの存在を確認
    async function checkTables() {
      try {
        const status = await checkTablesExist()
        setTablesStatus(status)

        if (!status.responsesTableExists || !status.resultsTableExists) {
          setError("Supabaseのテーブルが見つかりません。テーブルを作成してください。")
        }
      } catch (err) {
        console.error("Error checking tables:", err)
        setError("Supabaseの接続を確認できませんでした。環境変数を確認してください。")
      }
    }

    checkTables()
  }, [])

  const currentQuestion = riasecQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / riasecQuestions.length) * 100

  const handleResponse = (value: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))

    // 自動的に次の質問へ進む
    if (currentQuestionIndex < riasecQuestions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    setError(null)
    setIsSubmitting(true)

    try {
      // ユーザーIDはアプリケーションの認証システムから取得する必要があります
      // この例では簡略化のため、ハードコードしています
      const userId = "ユーダイ" // 実際の実装では認証済みユーザーIDを使用

      console.log("Starting Supabase operations...")

      try {
        // 結果を計算
        console.log("Calculating results...")
        const results = calculateRiasecResults(responses)
        console.log("Results calculated:", results)

        // 結果を保存（先に結果を保存）
        console.log("Saving results...")
        await saveRiasecResults(userId, results)
        console.log("Results saved successfully")

        // 回答を保存
        console.log("Saving responses...")
        await saveRiasecResponses(userId, responses)
        console.log("Responses saved successfully")

        // 結果ページへリダイレクト
        router.push("/riasec/results")
      } catch (error) {
        console.error("Error with Supabase operations:", error)

        // エラーメッセージを詳細に表示
        if (error instanceof Error) {
          setError(`Supabase操作エラー: ${error.message}`)
        } else {
          setError("Supabaseとの通信中に不明なエラーが発生しました。環境変数とテーブル構造を確認してください。")
        }
      }
    } catch (error) {
      console.error("Error submitting RIASEC assessment:", error)
      setError("予期せぬエラーが発生しました。もう一度お試しください。")
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLastQuestion = currentQuestionIndex === riasecQuestions.length - 1
  const canSubmit = Object.keys(responses).length === riasecQuestions.length

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
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

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          className="w-full max-w-3xl card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-8">
            <div className="flex justify-between items-center mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="text-gray-400 hover:text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                RIASEC分析
              </h1>
              <div className="w-10 h-10"></div> {/* スペーサー */}
            </div>

            {/* エラーメッセージ */}
            {error && (
              <Alert variant="destructive" className="mb-6 bg-red-900/20 border-red-500/30 text-red-300">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>エラーが発生しました</AlertTitle>
                <AlertDescription>{error}</AlertDescription>

                {/* テーブルステータスの詳細（デバッグ用） */}
                {tablesStatus && (
                  <div className="mt-2 text-xs">
                    <p>テーブルステータス:</p>
                    <pre className="mt-1 p-2 bg-black/30 rounded overflow-auto">
                      {JSON.stringify(tablesStatus, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="border-red-500/30 hover:bg-red-900/30"
                    onClick={() => setError(null)}
                  >
                    閉じる
                  </Button>
                </div>
              </Alert>
            )}

            <div className="mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>
                  質問 {currentQuestionIndex + 1} / {riasecQuestions.length}
                </span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-gray-700" />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mb-10"
              >
                <h2 className="text-xl font-medium mb-8 text-center">{currentQuestion.text}</h2>

                <div className="grid grid-cols-7 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7].map((value) => {
                    const isSelected = responses[currentQuestion.id] === value
                    return (
                      <motion.button
                        key={value}
                        className={`relative h-16 rounded-xl border ${
                          isSelected ? "border-blue-500 bg-blue-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"
                        } flex flex-col items-center justify-center transition-all duration-200`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleResponse(value)}
                      >
                        <span className="text-lg font-bold">{value}</span>
                        {value === 1 && <span className="text-xs mt-1">全く当てはまらない</span>}
                        {value === 4 && <span className="text-xs mt-1">どちらでもない</span>}
                        {value === 7 && <span className="text-xs mt-1">非常に当てはまる</span>}

                        {isSelected && (
                          <motion.div
                            className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-1"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15 }}
                          >
                            <Check className="h-3 w-3" />
                          </motion.div>
                        )}
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="border-white/10"
              >
                前の質問
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit || isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      送信中...
                    </>
                  ) : (
                    "結果を見る"
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  disabled={!responses[currentQuestion.id]}
                  className="border-white/10"
                >
                  次の質問
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
