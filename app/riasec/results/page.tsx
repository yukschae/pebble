/**
 * RIASEC結果ページコンポーネント
 *
 * このファイルは、RIASEC（職業興味）分析の結果を表示するページを実装しています。
 *
 * 主な機能：
 * - RIASEC分析結果の取得と表示
 * - レーダーチャートと棒グラフによる視覚化
 * - 各次元の詳細説明
 * - サンプルデータ表示機能
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect, useRef)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 * - Chart.js (グラフ表示)
 *
 * データフロー：
 * 1. データベースからRIASEC結果を取得
 * 2. 結果データをグラフ用にフォーマット
 * 3. チャートを描画
 * 4. 詳細情報を表示
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - lib/riasec-data.ts (RIASEC次元の定義)
 * - app/riasec/assessment/page.tsx (分析ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  Download,
  Share2,
  Wrench,
  Microscope,
  Palette,
  Users,
  TrendingUp,
  ClipboardList,
  AlertCircle,
} from "lucide-react"
import { getUserRiasecResults, useAuthContext } from "@/lib/supabase"
import { riasecDimensions } from "@/lib/riasec-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"

export default function RiasecResults() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuthContext() 
  const [results, setResults] = useState<any>(null)
  const [resultsLoading, setResultsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showStars, setShowStars] = useState(false)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    setShowStars(true)

    async function fetchResults() {

        if (authLoading) return
        
        try {
        if (!user) {
           setError("ログイン情報が確認できません。再度ログインしてください。")
           setResultsLoading(false)
           return
        }
        
        const userId = user.id  

        console.log("Fetching RIASEC results for user:", userId)

        try {
          const data = await getUserRiasecResults(userId)
          console.log("Fetched RIASEC results:", data)

          setDebugInfo({ rawData: data })

          if (!data) {
            setError("結果が見つかりませんでした。分析を完了してください。")
            return
          }

          // データの形式を確認
          if (!data.results || typeof data.results !== "object") {
            setError("結果データの形式が正しくありません。")
            return
          }

          setResults(data.results)
        } catch (err) {
          console.error("Error fetching RIASEC results:", err)
          setError("結果の取得中にエラーが発生しました。Supabaseの接続を確認してください。")
          setDebugInfo({ error: err instanceof Error ? err.message : String(err) })
        }
      } catch (err) {
        console.error("Error in fetchResults:", err)
        setError("予期せぬエラーが発生しました。")
      } finally {
        setResultsLoading(false)
      }
    }

    fetchResults()
    }, [authLoading, user]) 

  // 結果データをチャート用に変換
  const getPieChartData = () => {
    if (!results || !results.dimensionScores) {
      console.log("No dimension scores available for pie chart")
      return []
    }

    console.log("Generating pie chart data from:", results.dimensionScores)

    return Object.keys(results.dimensionScores).map((key) => ({
      name: riasecDimensions[key as keyof typeof riasecDimensions]?.name || key,
      value: results.dimensionScores[key],
      code: key,
    }))
  }

  const getRadarChartData = () => {
    if (!results || !results.dimensionScores) {
      console.log("No dimension scores available for radar chart")
      return []
    }

    console.log("Generating radar chart data from:", results.dimensionScores)

    return Object.keys(results.dimensionScores).map((key) => ({
      subject: key,
      A: results.dimensionScores[key],
      fullMark: 100,
    }))
  }

  // 六角形の頂点の座標を計算
  const getHexagonPoints = () => {
    const radius = 100
    const points = []
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2
      points.push({
        x: radius * Math.cos(angle) + 150,
        y: radius * Math.sin(angle) + 150,
        code: ["R", "I", "A", "S", "E", "C"][i],
      })
    }
    return points
  }

  const hexagonPoints = getHexagonPoints()

  // 一貫性の説明テキストを取得
  const getConsistencyText = () => {
    if (!results || !results.consistency) return ""

    switch (results.consistency) {
      case 3:
        return "高い一貫性があります。あなたの興味は互いに関連性が強く、明確な方向性を示しています。"
      case 2:
        return "中程度の一貫性があります。あなたの興味はある程度関連していますが、多様な分野に広がっています。"
      case 1:
        return "低い一貫性があります。あなたの興味は多様で、異なる分野にまたがっています。"
      default:
        return "一貫性が非常に低いです。あなたの興味は非常に多様で、様々な分野に分散しています。"
    }
  }

  // 分化度の説明テキストを取得
  const getDifferentiationText = () => {
    if (!results || !results.differentiation) return ""

    if (results.differentiation >= 70) {
      return "高い分化度があります。特定の分野に強い興味を持ち、他の分野との差が明確です。"
    } else if (results.differentiation >= 40) {
      return "中程度の分化度があります。いくつかの分野に興味を持っていますが、特定の分野への傾向が見られます。"
    } else {
      return "低い分化度があります。様々な分野に均等に興味を持っており、特定の分野への強い傾向は見られません。"
    }
  }

  const getIconComponent = (code: string) => {
    switch (code) {
      case "R":
        return <Wrench className="h-5 w-5" />
      case "I":
        return <Microscope className="h-5 w-5" />
      case "A":
        return <Palette className="h-5 w-5" />
      case "S":
        return <Users className="h-5 w-5" />
      case "E":
        return <TrendingUp className="h-5 w-5" />
      case "C":
        return <ClipboardList className="h-5 w-5" />
      default:
        return null
    }
  }

  // デバッグ用のダミーデータ（結果が取得できない場合に使用）
  const generateDummyData = () => {
    return {
      dimensionScores: {
        R: 65,
        I: 45,
        A: 85,
        S: 70,
        E: 50,
        C: 30,
      },
      sortedDimensions: ["A", "S", "R", "E", "I", "C"],
      threeLetterCode: "ASR",
      consistency: 2,
      differentiation: 55,
    }
  }

  // 結果がない場合はダミーデータを使用するオプション
  const useDummyData = () => {
    setResults(generateDummyData())
    setError(null)
  }

  // チャートデータの準備
  const pieChartData = getPieChartData()
  const radarChartData = getRadarChartData()

  return (
    <div className="flex min-h-dvh bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
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
      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
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
              RIASEC分析結果
            </h1>

            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="border-white/10">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" className="border-white/10">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {resultsLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <Card className="bg-red-900/20 border-red-500/30">
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-300 mb-4">{error}</p>

                {/* デバッグ情報 */}
                {debugInfo && (
                  <div className="mb-4 text-left">
                    <details className="text-xs text-red-300/70">
                      <summary className="cursor-pointer">デバッグ情報</summary>
                      <pre className="mt-2 p-3 bg-black/30 rounded overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                      </pre>
                    </details>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button className="bg-red-500 hover:bg-red-600" onClick={() => router.push("/riasec/assessment")}>
                    分析を開始する
                  </Button>
                  <Button variant="outline" className="border-red-500/30" onClick={useDummyData}>
                    サンプルデータを表示
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : results ? (
            <div className="space-y-8">
              {/* サマリーカード */}
              <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-4">あなたのRIASECプロファイル</h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">3文字コード</h3>
                      <div className="flex gap-2">
                        {results.threeLetterCode.split("").map((letter: string, index: number) => (
                          <div
                            key={index}
                            className={`w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                              riasecDimensions[letter as keyof typeof riasecDimensions]?.color ||
                              "from-gray-500 to-gray-700"
                            } shadow-lg border border-white/20`}
                          >
                            <span className="text-2xl font-bold text-white">{letter}</span>
                          </div>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400">
                        あなたの主要な興味タイプは
                        <span className="font-medium text-white">
                          {results.threeLetterCode
                            .split("")
                            .map(
                              (letter: string) =>
                                ` ${riasecDimensions[letter as keyof typeof riasecDimensions]?.name || letter}`,
                            )
                            .join("、")}
                        </span>
                        です。
                      </p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">一貫性</h3>
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 3 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-8 h-8 rounded-full ${
                              i < results.consistency ? "bg-gradient-to-br from-green-400 to-green-600" : "bg-gray-700"
                            }`}
                          ></div>
                        ))}
                        <span className="ml-2 text-sm">{results.consistency}/3</span>
                      </div>
                      <p className="text-sm text-gray-400">{getConsistencyText()}</p>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">分化度</h3>
                      <div className="w-full bg-gray-700 rounded-full h-4">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-indigo-600 h-4 rounded-full"
                          style={{ width: `${Math.min(100, results.differentiation)}%` }}
                        ></div>
                      </div>
                      <p className="text-sm text-gray-400">{getDifferentiationText()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* チャートタブ */}
              <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-6">
                  <Tabs defaultValue="radar">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                      <TabsTrigger value="radar">レーダーチャート</TabsTrigger>
                      <TabsTrigger value="pie">円グラフ</TabsTrigger>
                      <TabsTrigger value="hexagon">六角形モデル</TabsTrigger>
                    </TabsList>

                    <TabsContent value="radar" className="pt-6">
                      {radarChartData.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart outerRadius={90} data={radarChartData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="subject" />
                              <PolarRadiusAxis domain={[0, 100]} />
                              <Radar name="RIASEC" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center">
                          <p className="text-gray-400">データがありません</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="pie" className="pt-6">
                      {pieChartData.length > 0 ? (
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, value }) => `${name}: ${value}%`}
                              >
                                {pieChartData.map((entry, index) => {
                                  const dimension = entry.code as keyof typeof riasecDimensions
                                  const colorClass = riasecDimensions[dimension]?.color || "from-gray-500 to-gray-700"
                                  let color = "#3b82f6"

                                  if (colorClass.includes("blue")) color = "#3b82f6"
                                  else if (colorClass.includes("purple")) color = "#8b5cf6"
                                  else if (colorClass.includes("pink")) color = "#ec4899"
                                  else if (colorClass.includes("yellow")) color = "#eab308"
                                  else if (colorClass.includes("red")) color = "#ef4444"
                                  else if (colorClass.includes("green")) color = "#22c55e"

                                  return <Cell key={`cell-${index}`} fill={color} />
                                })}
                              </Pie>
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      ) : (
                        <div className="h-80 flex items-center justify-center">
                          <p className="text-gray-400">データがありません</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="hexagon" className="pt-6">
                      <div className="h-80 relative">
                        <svg width="300" height="300" viewBox="0 0 300 300">
                          {/* 六角形の線 */}
                          <polygon
                            points={hexagonPoints.map((p) => `${p.x},${p.y}`).join(" ")}
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="1"
                          />

                          {/* 六角形の頂点ラベル */}
                          {hexagonPoints.map((point, i) => (
                            <g key={i}>
                              <circle cx={point.x} cy={point.y} r="20" className={`fill-[url(#grad-${point.code})]`} />
                              <text
                                x={point.x}
                                y={point.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="white"
                                fontSize="12"
                                fontWeight="bold"
                              >
                                {point.code}
                              </text>

                              {/* スコア表示 */}
                              {results.dimensionScores && results.dimensionScores[point.code] && (
                                <text
                                  x={point.x}
                                  y={point.y + 35}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                  fill="white"
                                  fontSize="10"
                                >
                                  {results.dimensionScores[point.code]}%
                                </text>
                              )}
                            </g>
                          ))}

                          {/* グラデーション定義 */}
                          <defs>
                            <linearGradient id="grad-R" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#3b82f6" />
                              <stop offset="100%" stopColor="#1d4ed8" />
                            </linearGradient>
                            <linearGradient id="grad-I" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8b5cf6" />
                              <stop offset="100%" stopColor="#6d28d9" />
                            </linearGradient>
                            <linearGradient id="grad-A" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ec4899" />
                              <stop offset="100%" stopColor="#be185d" />
                            </linearGradient>
                            <linearGradient id="grad-S" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#eab308" />
                              <stop offset="100%" stopColor="#a16207" />
                            </linearGradient>
                            <linearGradient id="grad-E" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" />
                              <stop offset="100%" stopColor="#b91c1c" />
                            </linearGradient>
                            <linearGradient id="grad-C" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" />
                              <stop offset="100%" stopColor="#15803d" />
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>

              {/* 詳細説明 */}
              <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-6">あなたの興味タイプの詳細</h2>

                  <div className="space-y-6">
                    {results.sortedDimensions.map((dim: string, index: number) => (
                      <div key={dim} className="flex gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${
                            riasecDimensions[dim as keyof typeof riasecDimensions]?.color || "from-gray-500 to-gray-700"
                          } shadow-lg border border-white/20 flex-shrink-0`}
                        >
                          {getIconComponent(dim)}
                        </div>

                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-2">
                            <h3 className="font-medium">
                              {riasecDimensions[dim as keyof typeof riasecDimensions]?.name || dim}
                            </h3>
                            <span className="text-sm bg-white/10 px-2 py-1 rounded-full">
                              {results.dimensionScores[dim]}%
                            </span>
                          </div>

                          <div className="w-full bg-gray-700 rounded-full h-2 mb-3">
                            <div
                              className={`bg-gradient-to-r ${
                                riasecDimensions[dim as keyof typeof riasecDimensions]?.color ||
                                "from-gray-500 to-gray-700"
                              } h-2 rounded-full`}
                              style={{ width: `${results.dimensionScores[dim]}%` }}
                            ></div>
                          </div>

                          <p className="text-sm text-gray-400">
                            {riasecDimensions[dim as keyof typeof riasecDimensions]?.description ||
                              "この興味タイプの説明はありません。"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
