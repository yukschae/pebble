/**
 * OCEAN分析ページコンポーネント
 *
 * このファイルは、OCEAN（ビッグファイブ性格特性）分析を実施するためのページを実装しています。
 * ユーザーが質問に回答し、その結果を分析して保存します。
 *
 * 主な機能：
 * - OCEAN質問の表示
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
 * - lib/ocean-data.ts (質問データと分析ロジック)
 * - lib/supabase.ts (データベース操作)
 * - app/ocean/results/page.tsx (結果表示ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Check, AlertCircle } from "lucide-react"
import { oceanQuestions, calculateOceanScores, generateOceanInterpretation } from "@/lib/ocean-data"
import { saveOceanResponses, saveOceanResults, useAuthContext } from "@/lib/supabase"

export default function OceanAssessment() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  // 進捗状況を更新
  useEffect(() => {
    const answeredQuestions = Object.keys(responses).length
    const totalQuestions = oceanQuestions.length
    setProgress((answeredQuestions / totalQuestions) * 100)
  }, [responses])

  // 現在の質問
  const currentQuestion = oceanQuestions[currentQuestionIndex]

  // 回答を記録
  const handleResponse = (value: number) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }))

    // 次の質問へ自動的に進む
    if (currentQuestionIndex < oceanQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // 前の質問に戻る
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  // 次の質問に進む
  const handleNext = () => {
    if (currentQuestionIndex < oceanQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  // 結果を計算して保存
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // 回答が50%以上あるか確認
      const answeredQuestions = Object.keys(responses).length
      if (answeredQuestions < oceanQuestions.length * 0.5) {
        setError("少なくとも質問の半分以上に回答してください。")
        setIsSubmitting(false)
        return
      }

      // スコアを計算
      const scores = calculateOceanScores(responses)
      const interpretation = generateOceanInterpretation(scores)

      // 結果オブジェクトを作成
      const results = {
        scores,
        interpretation,
        timestamp: new Date().toISOString(),
      }

      if (!user) {                      
        setError("ログイン状態が確認できません。再度ログインしてください。")
        setIsSubmitting(false)
        return
      }

    const userId = user.id            

      // 回答と結果をデータベースに保存
      console.log("Saving results...")
      await saveOceanResponses(userId, responses)
      console.log("Results saved successfully")

      console.log("Saving results...")
      await saveOceanResults(userId, results)
      console.log("Results saved successfully")

      // 結果ページにリダイレクト
      router.push("/ocean/results")
    } catch (err) {
      console.error("Error submitting OCEAN assessment:", err)
      setError("結果の保存中にエラーが発生しました。もう一度お試しください。")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-center mb-2">OCEANパーソナリティ分析</h1>
          <p className="text-center text-gray-300 mb-6">
            ビッグファイブ理論に基づく性格特性を測定します。あなたに最も当てはまる回答を選んでください。
          </p>

          {/* 進捗バー */}
          <div className="w-full bg-gray-700 rounded-full h-2.5 mb-6">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="text-center text-sm text-gray-400 mb-8">
            質問 {currentQuestionIndex + 1} / {oceanQuestions.length}
          </div>
        </motion.div>

        {/* 質問カード */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8"
        >
          <h2 className="text-xl font-semibold mb-6">{currentQuestion.text}</h2>

          {/* 回答オプション */}
          <div className="grid grid-cols-1 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7].map((value) => (
              <button
                key={value}
                onClick={() => handleResponse(value)}
                className={`p-3 rounded-lg border transition-all ${
                  responses[currentQuestion.id] === value
                    ? "bg-indigo-600 border-indigo-400 text-white"
                    : "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600"
                }`}
              >
                {value === 1
                  ? "全く当てはまらない"
                  : value === 2
                    ? "ほとんど当てはまらない"
                    : value === 3
                      ? "あまり当てはまらない"
                      : value === 4
                        ? "どちらともいえない"
                        : value === 5
                          ? "やや当てはまる"
                          : value === 6
                            ? "かなり当てはまる"
                            : "非常によく当てはまる"}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ナビゲーションボタン */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center px-4 py-2 rounded-lg ${
              currentQuestionIndex === 0
                ? "text-gray-500 cursor-not-allowed"
                : "bg-gray-700 hover:bg-gray-600 text-white"
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            前へ
          </button>

          {currentQuestionIndex < oceanQuestions.length - 1 ? (
            <button
              onClick={handleNext}
              className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
            >
              次へ
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center px-6 py-2 rounded-lg ${
                isSubmitting
                  ? "bg-gray-600 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
              }`}
            >
              {isSubmitting ? "送信中..." : "結果を見る"}
              {!isSubmitting && <Check className="w-5 h-5 ml-1" />}
            </button>
          )}
        </div>

        {/* エラーメッセージ */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start"
          >
            <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* ヒント */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-sm text-gray-400"
        >
          <p>
            すべての質問に回答する必要はありません。少なくとも半分以上の質問に回答すると、結果を見ることができます。
          </p>
        </motion.div>
      </div>
    </div>
  )
}
