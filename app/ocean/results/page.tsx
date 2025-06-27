/**
 * OCEAN結果ページコンポーネント
 *
 * このファイルは、OCEAN（ビッグファイブ性格特性）分析の結果を表示するページを実装しています。
 *
 * 主な機能：
 * - OCEAN分析結果の取得と表示
 * - レーダーチャートと棒グラフによる視覚化
 * - 各次元の詳細説明
 * - 職業提案機能
 * - サンプルデータ表示機能
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect, useRef)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 * - Recharts (グラフ表示)
 *
 * データフロー：
 * 1. データベースからOCEAN結果を取得
 * 2. 結果データをグラフ用にフォーマット
 * 3. チャートを描画
 * 4. 詳細情報と職業提案を表示
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - lib/ocean-data.ts (OCEAN次元の定義と職業提案ロジック)
 * - app/ocean/assessment/page.tsx (分析ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronLeft, Download, Share2, AlertCircle, Info } from "lucide-react"
import { oceanFactors, sortFactorsByScore, suggestOceanCareers } from "@/lib/ocean-data"
import { getUserOceanResults , useAuthContext } from "@/lib/supabase"
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts"

export default function OceanResults() {
  const router = useRouter()
  const { user, loading: authLoading} = useAuthContext()
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showSampleData, setShowSampleData] = useState(false)

  useEffect(() => {
    async function fetchResults() {
      if (authLoading) return 

      try {
        setLoading(true)
        setError(null)

        if (!user) {
          setError("ログイン情報が確認できません。再度ログインしてください。")
          setLoading(false)
          return
          }
        
        const userId = user.id   

        const data = await getUserOceanResults(userId)

        if (data && data.results) {
          setResults(data.results)
          console.log("OCEAN結果データ:", data.results) // デバッグ用
        } else {
          setError("結果が見つかりませんでした。まずは分析を完了してください。")
        }
      } catch (err) {
        console.error("Error fetching OCEAN results:", err)
        setError("結果の取得中にエラーが発生しました。")
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [authLoading, user])

  // サンプルデータを表示
  const handleShowSampleData = () => {
    const sampleResults = {
      scores: {
        O: 75, // 開放性
        C: 60, // 誠実性
        E: 85, // 外向性
        A: 65, // 協調性
        N: 40, // 神経症的傾向
      },
      interpretation: {
        O: "好奇心が強く、創造的で、新しいアイデアや経験に開かれています。芸術や抽象的な思考を楽しみます。",
        C: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
        E: "社交的で活発、自己主張が強いです。グループ活動を楽しみ、人との交流からエネルギーを得ます。",
        A: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
        N: "中間的な傾向があります。状況によって柔軟に対応できる可能性があります。",
      },
      timestamp: new Date().toISOString(),
    }
    setResults(sampleResults)
    setShowSampleData(true)
    setError(null)
  }

  // レーダーチャート用のデータ変換
  const getRadarChartData = () => {
    if (!results || !results.scores) return []

    return [
      { subject: "開放性 (O)", A: results.scores.O, fullMark: 100 },
      { subject: "誠実性 (C)", A: results.scores.C, fullMark: 100 },
      { subject: "外向性 (E)", A: results.scores.E, fullMark: 100 },
      { subject: "協調性 (A)", A: results.scores.A, fullMark: 100 },
      { subject: "神経症的傾向 (N)", A: results.scores.N, fullMark: 100 },
    ]
  }

  // 棒グラフ用のデータ変換
  const getBarChartData = () => {
    if (!results || !results.scores) return []

    const sortedFactors = sortFactorsByScore(results.scores)
    return sortedFactors.map((factor) => ({
      name: `${oceanFactors[factor as keyof typeof oceanFactors].name} (${factor})`,
      score: results.scores[factor],
      color: oceanFactors[factor as keyof typeof oceanFactors].color.replace("from-", "").replace("to-", ""),
    }))
  }

  // 職業提案を取得
  const careerSuggestions = results?.scores ? suggestOceanCareers(results.scores) : null

  return (
    <div className="min-h-dvh bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            ダッシュボードに戻る
          </button>

          {results && (
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                <Download className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">保存</span>
              </button>
              <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white">
                <Share2 className="w-5 h-5 mr-1" />
                <span className="hidden sm:inline">共有</span>
              </button>
            </div>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl font-bold mb-2">OCEANパーソナリティ分析結果</h1>
          <p className="text-gray-300">ビッグファイブ理論に基づくあなたの性格特性プロファイル</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-300">結果を読み込んでいます...</p>
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8"
          >
            <div className="flex items-start text-amber-400 mb-4">
              <AlertCircle className="w-6 h-6 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">結果が見つかりません</h3>
                <p className="text-gray-300 mt-1">{error}</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => router.push("/ocean/assessment")}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-lg text-white font-medium"
              >
                分析を開始する
              </button>
              <button
                onClick={handleShowSampleData}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
              >
                サンプルデータを表示
              </button>
            </div>
          </motion.div>
        ) : results ? (
          <>
            {showSampleData && (
              <div className="bg-amber-900/30 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-lg flex items-start mb-6">
                <Info className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>
                  これはサンプルデータです。実際のデータを見るには、OCEANパーソナリティ分析を完了してください。
                </span>
              </div>
            )}

            {/* チャートセクション */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
            >
              {/* レーダーチャート */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">パーソナリティプロファイル</h2>
                <div className="aspect-square">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={getRadarChartData()} outerRadius="80%">
                      <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255, 255, 255, 0.7)", fontSize: 12 }} />
                      <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "rgba(255, 255, 255, 0.7)" }} />
                      <Radar
                        name="あなたのスコア"
                        dataKey="A"
                        stroke="rgba(99, 102, 241, 1)"
                        fill="rgba(99, 102, 241, 0.2)"
                        dot={{ fill: "rgba(99, 102, 241, 1)" }}
                      />
                      <Tooltip />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* 棒グラフ */}
              <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
                <h2 className="text-xl font-semibold mb-4">因子スコア</h2>
                <div className="aspect-square">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={getBarChartData()}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fill: "rgba(255, 255, 255, 0.7)" }} />
                      <YAxis dataKey="name" type="category" tick={{ fill: "rgba(255, 255, 255, 0.7)" }} />
                      <Tooltip />
                      <Bar dataKey="score" name="スコア" radius={4} fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>

            {/* 詳細な結果 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8"
            >
              <h2 className="text-xl font-semibold mb-6">あなたの性格特性の詳細</h2>

              <div className="space-y-6">
                {Object.keys(oceanFactors).map((factor) => {
                  const factorKey = factor as keyof typeof oceanFactors
                  const factorInfo = oceanFactors[factorKey]
                  const score = results.scores[factor]
                  const interpretation = results.interpretation[factor]

                  return (
                    <div key={factor} className="border-b border-gray-700 pb-6 last:border-0">
                      <div className="flex items-center mb-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br ${factorInfo.color} shadow-lg`}
                        >
                          <span className="text-xl">{factorInfo.icon}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">
                            {factorInfo.name} ({factor})
                          </h3>
                          <div className="text-sm text-gray-400">{factorInfo.nameEn}</div>
                        </div>
                        <div className="ml-auto">
                          <span className="text-2xl font-bold">{score}</span>
                          <span className="text-gray-400 text-sm">/100</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="w-full bg-gray-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${factorInfo.color}`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-gray-300 mb-3">{factorInfo.description}</p>

                      <div className="bg-gray-700/50 rounded-lg p-4">
                        <p className="text-white">{interpretation}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* 職業提案 */}
            {careerSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700 mb-8"
              >
                <h2 className="text-xl font-semibold mb-6">あなたに合うかもしれない職業</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 bg-gradient-to-br ${
                          oceanFactors[careerSuggestions.topFactor as keyof typeof oceanFactors].color
                        } shadow-lg`}
                      >
                        <span className="text-lg">
                          {oceanFactors[careerSuggestions.topFactor as keyof typeof oceanFactors].icon}
                        </span>
                      </div>
                      {oceanFactors[careerSuggestions.topFactor as keyof typeof oceanFactors].name}型の職業
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {careerSuggestions.topFactorCareers.map((career: string) => (
                        <li key={career}>{career}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-3 flex items-center">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center mr-2 bg-gradient-to-br ${
                          oceanFactors[careerSuggestions.secondFactor as keyof typeof oceanFactors].color
                        } shadow-lg`}
                      >
                        <span className="text-lg">
                          {oceanFactors[careerSuggestions.secondFactor as keyof typeof oceanFactors].icon}
                        </span>
                      </div>
                      {oceanFactors[careerSuggestions.secondFactor as keyof typeof oceanFactors].name}型の職業
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-gray-300">
                      {careerSuggestions.secondFactorCareers.map((career: string) => (
                        <li key={career}>{career}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <h3 className="font-medium text-lg mb-3">あなたの上位2つの特性を組み合わせた職業提案</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-300">
                    {careerSuggestions.combinedCareers.map((career: string) => (
                      <li key={career}>{career}</li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
