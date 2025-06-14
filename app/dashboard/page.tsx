/**
 * ダッシュボードページコンポーネント
 *
 * このファイルは、アプリケーションのメインダッシュボードを実装しています。
 * ユーザーのRIASEC分析結果、OCEAN分析結果、パッションシャトル、クエスト情報を表示します。
 *
 * 主な機能：
 * - ユーザーデータの読み込みと表示
 * - RIASEC/OCEAN分析結果の表示
 * - パッションシャトルの表示
 * - クエストロードマップの表示
 * - 各機能へのナビゲーション
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 * - Lucide React (アイコン)
 *
 * データフロー：
 * 1. ユーザーがログインすると、useEffect内でloadUserData関数が呼び出される
 * 2. Supabaseからユーザーデータを取得し、状態変数に保存
 * 3. 取得したデータをUIに表示
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - components/auth/auth-check.tsx (認証チェック)
 */


"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Award,
  MessageCircle,
  Star,
  ChevronRight,
  Flame,
  Diamond,
  Lock,
  Flag,
  Sparkles,
  LogOut,
  Settings,
  MapPin,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { getUserRiasecResults, getUserOceanResults, getSelectedPassionShuttle, getUserQuests } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { AuthCheck } from "@/components/auth/auth-check"
import { useAuthContext } from "@/lib/supabase"
import DashboardTutorial from "@/components/dashboard-tutorial"
import ProfileSetupDialog from "@/components/profile-setup"
import SocialIssueDialog from "@/components/social-issue-dialog"

// Suggested types (you might need to adjust based on actual data structure)
interface RiasecResultDetails {
  dimensionScores: Record<string, number>;
  sortedDimensions: string[]; // Should be 'R', 'I', 'A', 'S', 'E', 'C'
  threeLetterCode: string;
  consistency: number;
  differentiation: number;
}

interface RiasecData {
  results: RiasecResultDetails;
  // Add other properties if they exist on riasecData
}

interface OceanResultDetails {
  scores: Record<string, number>; // Keys like 'O', 'C', 'E', 'A', 'N'
  interpretation: Record<string, string>;
  timestamp: string;
}

interface OceanData {
  results: OceanResultDetails;
  // Add other properties if they exist on oceanData
}

interface PassionShuttleData {
  id: number; // Or string, adjust as needed
  title: string;
  informative_description: string;
  colloquial_description: string;
  tags: string[];
  selected: boolean;
  // Add other properties
}

interface QuestData {
  id: number; // Ensure this is a number
  title: string;
  completed: boolean;
  current: boolean;
  description: string;
  actions: string[];
  outcome: string;
  difficulty: number;
  order: number;
  planet: string;
  // Add funRating, confidenceRating if they are part of the fetched data
  funRating?: number;
  confidenceRating?: number;
}

export default function Dashboard() {
  const router = useRouter()
  const { user, userProfile, signOut, loading } = useAuthContext()
  const [activeQuest, setActiveQuest] = useState<number | null>(null)
  const [showStars, setShowStars] = useState(false)
  const [hasRiasecResults, setHasRiasecResults] = useState(false)
  const [hasOceanResults, setHasOceanResults] = useState(false)
  const [passionShuttle, setPassionShuttle] = useState<any>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [isLoadingRiasec, setIsLoadingRiasec] = useState(true)
  const [isLoadingOcean, setIsLoadingOcean] = useState(true)
  const [isLoadingPassionShuttle, setIsLoadingPassionShuttle] = useState(true)
  const [isLoadingQuests, setIsLoadingQuests] = useState(true)
  const [riasecResults, setRiasecResults] = useState<any>(null)
  const [oceanResults, setOceanResults] = useState<any>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [tutorialDone, setTutorialDone] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [showIssueSetup, setShowIssueSetup] = useState(false)

  useEffect(() => {
    console.log("Dashboard user effect triggered:", { userId: user?.id })
    if (user && !loading) { 
      loadUserData()
    }
  }, [user, loading])

  useEffect(() => {
    if (
      tutorialDone &&
      (!userProfile || !userProfile.display_name || !userProfile.avatar)
    ) {
      setShowProfileSetup(true)
    }
  }, [tutorialDone, userProfile])

  // ユーザーデータの読み込み
  const loadUserData = async () => {
    if (!user) {
      console.log("Cannot load user data: No user")
      return
    }

    console.log("Loading user data for:", user.id)
    setLoadError(null)

    try {
      setIsLoadingRiasec(true)
      setIsLoadingOcean(true)
      setIsLoadingPassionShuttle(true)
      setIsLoadingQuests(true)

      // 各データ取得を個別に try-catch で囲む
      try {
        console.log("Loading RIASEC data")
        const riasecData = await getUserRiasecResults(user.id)
        setRiasecResults(riasecData)
        setHasRiasecResults(!!riasecData)
        console.log("RIASEC data loaded:", !!riasecData)
      } catch (error) {
        console.error("Error loading RIASEC data:", error)
      } finally {
        setIsLoadingRiasec(false)
      }

      try {
        console.log("Loading OCEAN data")
        const oceanData = await getUserOceanResults(user.id)
        setOceanResults(oceanData)
        setHasOceanResults(!!oceanData)
        console.log("OCEAN data loaded:", !!oceanData)
      } catch (error) {
        console.error("Error loading OCEAN data:", error)
      } finally {
        setIsLoadingOcean(false)
      }

      try {
        console.log("Loading passion shuttle data")
        const selectedShuttle = await getSelectedPassionShuttle(user.id)
        setPassionShuttle(selectedShuttle)
        console.log("Passion shuttle data loaded:", !!selectedShuttle)
      } catch (error) {
        console.error("Error loading passion shuttle:", error)
      } finally {
        setIsLoadingPassionShuttle(false)
      }

      try {
        console.log("Loading quests data")
        const userQuests = await getUserQuests(user.id)
        setQuests(userQuests || [])
        console.log("Quests data loaded:", userQuests?.length || 0, "quests")

        // アクティブなクエストを設定
        const currentQuest = userQuests.find((q) => q.current)
        if (currentQuest && typeof currentQuest.id === 'number') {
          setActiveQuest(currentQuest.id)
          console.log("Active quest set:", currentQuest.id)
        } else if (userQuests.length > 0 && typeof userQuests[0].id === 'number') {
          setActiveQuest(userQuests[0].id)
          console.log("Default active quest set:", userQuests[0].id)
        } else {
          setActiveQuest(null); // Ensure it's set to null if no valid quest id is found
        }
      } catch (error) {
        console.error("Error loading quests:", error)
      } finally {
        setIsLoadingQuests(false)
      }
    } catch (error) {
      console.error("Error loading user data:", error)
      setLoadError("データの読み込み中にエラーが発生しました。再読み込みしてください。")
      // すべてのローディング状態を解除
      setIsLoadingRiasec(false)
      setIsLoadingOcean(false)
      setIsLoadingPassionShuttle(false)
      setIsLoadingQuests(false)
    }
  }

  const handleSignOut = async () => {
    console.log("Signing out")
    await signOut()
    router.push("/")
  }

  // RIASECの上位3つの次元を取得
  const getTopRiasecDimensions = () => {
    if (!riasecResults?.results?.sortedDimensions) return []
    return riasecResults.results.sortedDimensions.slice(0, 3)
  }

  // RIASECの次元名を取得
  const getRiasecDimensionName = (code: string) => {
    const names: { [key: string]: string } = {
      R: "現実的タイプ",
      I: "研究的タイプ",
      A: "芸術的タイプ",
      S: "社会的タイプ",
      E: "企業的タイプ",
      C: "慣習的タイプ",
    }
    return names[code] || code
  }

  // OCEANの上位3つの次元を取得
  const getTopOceanDimensions = (): string[] => {
    if (!oceanResults?.results?.scores) return []

    const scores = oceanResults.results.scores
    const dimensions = Object.keys(scores);

    return dimensions.sort((a, b) => scores[b] - scores[a]).slice(0, 3)
  }

  // OCEANの次元名を取得
  const getOceanDimensionName = (code: string) => {
    const names: { [key: string]: string } = {
      O: "開放性タイプ",
      C: "誠実性タイプ",
      E: "外向性タイプ",
      A: "協調性タイプ",
      N: "神経症的傾向タイプ",
    }
    return names[code] || code
  }

  return (
    <AuthCheck>
      <div className="flex h-screen">
        {/* Stars background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <AnimatePresence>
            {showStars &&
              Array.from({ length: 100 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 star rounded-full"
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

        {/* Sidebar */}
        <motion.div
          className="w-64 bg-gray-900/60 backdrop-blur-xl border-r border-primary/10 z-10 shadow-2xl"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Logo */}
          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center p-3 rounded-xl shadow-lg">
              <div className="w-8 h-8 bg-white flex items-center justify-center mr-2 rounded-lg shadow-inner">
                <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-transparent bg-clip-text font-bold">
                  L
                </span>
              </div>
              <span className="text-white font-bold text-lg tracking-wide">LimitFree</span>
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-8 px-4">
            <motion.div
              className="mb-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-3 flex items-center text-blue-400 border border-blue-500/30"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
            >
              <div className="bg-gradient-to-br from-orange-400 to-amber-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-600/20">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">ダッシュボード</span>
            </motion.div>

            <motion.div
              className="mb-2 hover:bg-white/5 rounded-xl p-3 flex items-center text-gray-400 transition-all duration-300 border border-transparent hover:border-white/10"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/quests")}
            >
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-blue-600/20">
                <Award className="w-5 h-5 text-white" />
              </div>
              <span>クエスト</span>
            </motion.div>

            <motion.div
              className="mb-2 hover:bg-white/5 rounded-xl p-3 flex items-center text-gray-400 transition-all duration-300 border border-transparent hover:border-white/10"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/ai-chat")}
            >
              <div className="bg-gradient-to-br from-gray-700 to-gray-900 w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-gray-900/30 border border-gray-700">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span>AIとチャット</span>
            </motion.div>

            <motion.div
              className="mb-2 hover:bg-white/5 rounded-xl p-3 flex items-center text-gray-400 transition-all duration-300 border border-transparent hover:border-white/10"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/quest-setup/direction")}
            >
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-purple-600/20">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <span>クエスト設定</span>
            </motion.div>
          </div>

          {/* User profile */}
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="bg-white/5 rounded-xl p-3 flex items-center border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mr-3 overflow-hidden">
                {userProfile?.avatar ? (
                  <img src={userProfile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white font-bold">
                    {userProfile?.display_name ? userProfile.display_name.charAt(0).toUpperCase() : "U"}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">{userProfile?.display_name || user?.email}</div>
                <div className="text-xs text-gray-400">レベル 1</div>
              </div>
              <button
                onClick={() => setShowProfileSetup(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors mr-2"
                title="プロフィール編集"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
                title="ログアウト"
              >
                <LogOut className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-8 py-10">
            {/* Header */}
            <motion.div
              className="relative mb-10"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-blue-600/20 text-center border border-white/10 backdrop-blur-sm">
                <span className="mr-2">✨</span> {userProfile?.display_name || "ようこそ"}のダッシュボード{" "}
                <span className="ml-2">✨</span>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-4">
                <motion.div
                  className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2 rounded-full shadow-lg shadow-orange-600/30 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Flame className="w-5 h-5 text-white mr-2" />
                  <span className="text-white text-xl font-bold">5</span>
                </motion.div>
                <motion.div
                  className="flex items-center bg-gradient-to-r from-blue-400 to-cyan-500 px-4 py-2 rounded-full shadow-lg shadow-blue-600/30 border border-white/10"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Diamond className="w-5 h-5 text-white mr-2" />
                  <span className="text-white text-xl font-bold">0</span>
                </motion.div>
              </div>
            </motion.div>

            {/* Error message */}
            {loadError && (
              <motion.div
                className="bg-red-500/20 border border-red-500/30 text-red-100 p-4 rounded-lg mb-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center">
                  <div className="mr-3">⚠️</div>
                  <div>{loadError}</div>
                </div>
                <Button
                  variant="outline"
                  className="mt-2 border-red-500/30 text-red-100 hover:bg-red-500/30"
                  onClick={loadUserData}
                >
                  再読み込み
                </Button>
              </motion.div>
            )}

            {/* Content grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* RIASEC & OCEAN Types */}
              <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-5 text-foreground flex items-center">
                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-transparent bg-clip-text">
                      RIASECタイプ
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">（キャリア興味は？）</span>
                  </h3>

                  {isLoadingRiasec ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : hasRiasecResults ? (
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-orange-600/20 border border-white/20">
                        <span className="text-2xl">🎨</span>
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center">
                          1. {getRiasecDimensionName(getTopRiasecDimensions()[0] || "A")}
                          <motion.span
                            className="text-primary text-sm ml-2 cursor-pointer hover:text-primary/80"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => router.push("/riasec/results")}
                          >
                            詳しくみる <ChevronRight className="w-3 h-3 inline" />
                          </motion.span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          2. {getRiasecDimensionName(getTopRiasecDimensions()[1] || "S")}　 3.{" "}
                          {getRiasecDimensionName(getTopRiasecDimensions()[2] || "R")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-muted-foreground text-center mb-4">
                        あなたのキャリア興味を分析して、最適な進路選択をサポートします。
                      </p>
                      <Button
                        className="bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700"
                        onClick={() => router.push("/riasec/assessment")}
                      >
                        RIASEC分析をはじめる！
                      </Button>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-5 text-foreground flex items-center">
                    <span className="bg-gradient-to-r from-purple-400 to-indigo-500 text-transparent bg-clip-text">
                      OCEANタイプ
                    </span>
                    <span className="text-muted-foreground text-sm ml-2">（性格特性は？）</span>
                  </h3>

                  {isLoadingOcean ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : hasOceanResults ? (
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-indigo-600/20 border border-white/20">
                        <span className="text-2xl">🧠</span>
                      </div>
                      <div>
                        <div className="font-bold text-foreground flex items-center">
                          1. {getOceanDimensionName(getTopOceanDimensions()[0] || "O")}
                          <motion.span
                            className="text-primary text-sm ml-2 cursor-pointer hover:text-primary/80"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => router.push("/ocean/results")}
                          >
                            詳しくみる <ChevronRight className="w-3 h-3 inline" />
                          </motion.span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          2. {getOceanDimensionName(getTopOceanDimensions()[1] || "E")}　 3.{" "}
                          {getOceanDimensionName(getTopOceanDimensions()[2] || "A")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-muted-foreground text-center mb-4">
                        あなたの性格特性を分析して、自己理解を深めましょう。
                      </p>
                      <Button
                        className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700"
                        onClick={() => router.push("/ocean/assessment")}
                      >
                        OCEAN分析をはじめる！
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>

             {/* Avatar */}
             <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 p-6 flex flex-col items-center justify-center relative overflow-hidden"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 via-transparent to-purple-500/10 opacity-50" />

                <motion.div
                  className="flex mb-6 relative z-10"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-lg" />
                  <Star className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-lg" />
                </motion.div>

                <motion.div
                  className="relative w-48 h-48 rounded-full overflow-hidden border border-white/20 shadow-xl"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <img
                    src={userProfile?.avatar || "/placeholder-user.jpg"}
                    alt="avatar"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </motion.div>


                <motion.div
                  className="mt-6 text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 1 }}
                >
                  <h3 className="text-xl font-bold text-foreground">モンスターレベル</h3>
                  <div className="text-cyan-400 font-bold mt-1">レベル 1</div>
                </motion.div>
              </motion.div>

              {/* Passion & XP */}
              <motion.div
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 overflow-hidden"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-5 text-foreground flex items-center">
                    <span className="bg-gradient-to-r from-red-400 to-pink-500 text-transparent bg-clip-text">
                      パッションシャトル
                    </span>
                  </h3>

                  {isLoadingPassionShuttle ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : passionShuttle ? (
                    <div className="flex items-start mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-red-600/20 border border-white/20">
                        <span className="text-2xl">🚀</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-foreground flex items-center">
                          「{passionShuttle.title}」
                          <motion.span
                            className="text-primary text-sm ml-2 cursor-pointer hover:text-primary/80"
                            whileHover={{ x: 2 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => router.push("/passion-shuttle")}
                          >
                            変更する <ChevronRight className="w-3 h-3 inline" />
                          </motion.span>
                        </div>
                        <div className="flex gap-2 mt-2">
                          {passionShuttle.tags.slice(0, 2).map((tag: string, index: number) => (
                            <span
                              key={index}
                              className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30"
                            >
                              #{tag}
                            </span>
                          ))}
                          {passionShuttle.tags.length > 2 && (
                            <span className="text-xs bg-gray-500/20 text-gray-300 px-2 py-1 rounded-full border border-gray-500/30">
                              +{passionShuttle.tags.length - 2}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 w-full h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "40%" }}
                            transition={{ duration: 1, delay: 1 }}
                          />
                        </div>
                        <div className="text-right text-xs text-muted-foreground mt-1">フローメーター</div>
                      </div>
                    </div>
                  ) : hasRiasecResults && hasOceanResults ? (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-muted-foreground text-center mb-4">
                        あなたの興味と才能を掛け合わせた、独自のキャリアパスを探索しましょう。
                      </p>
                      <Button
                        className="bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700"
                        onClick={() => setShowIssueSetup(true)}
                      >
                        パッションシャトルを設定する
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4">
                      <p className="text-muted-foreground text-center mb-4">
                        パッションシャトルを設定するには、まずRIASECとOCEANの分析を完了してください。
                      </p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent" />

                <div className="p-6">
                  <h3 className="text-xl font-bold mb-5 text-foreground flex items-center">
                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-transparent bg-clip-text">
                      経験値 XP
                    </span>
                  </h3>
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg shadow-amber-500/20 border border-white/20">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-foreground font-medium flex items-center">
                        これまでのアクション数！
                        <Sparkles className="w-4 h-4 text-amber-400 ml-1" />
                      </div>
                      <div className="mt-3 w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: "65%" }}
                          transition={{ duration: 1, delay: 1.2 }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <div className="text-xs text-muted-foreground">次のレベルまで</div>
                        <div className="text-amber-400 font-bold">0/20 XP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Quest Roadmap */}
            <motion.div
              className="card-gradient rounded-2xl shadow-xl border border-primary/10 relative overflow-hidden p-8"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-transparent to-purple-600/5" />

              <div className="flex justify-between items-center mb-10 relative z-10">
                <h3 className="text-2xl font-bold text-center">
                  <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                    クエストロードマップ
                  </span>
                </h3>

                <div className="flex space-x-4">
                  <motion.button
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-300 border border-white/10 group flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/quest-setup/direction")}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    クエスト設定
                  </motion.button>

                  <motion.button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 group flex items-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/quests")}
                  >
                    詳細を見る
                    <ChevronRight className="w-4 h-4 inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                  </motion.button>
                </div>
              </div>

              {isLoadingQuests ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : quests.length > 0 ? (
                <>
                  {/* Path line */}
                  <div className="absolute left-1/2 top-32 bottom-32 w-1 bg-gradient-to-b from-gray-700 via-blue-600 to-purple-600 rounded-full z-0"></div>

                  {/* Planets */}
                  <div className="relative flex flex-col items-center z-10">
                    <div className="grid grid-cols-1 gap-20 mt-4">
                      {quests.map((quest, index) => (
                        <motion.div
                          key={quest.id}
                          className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"} items-center relative`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.7 + index * 0.1 }}
                        >
                          <motion.div
                            className={`absolute left-1/2 -translate-x-1/2 ${
                              activeQuest === quest.id ? "scale-125 z-10" : "scale-100"
                            } transition-all duration-500`}
                            whileHover={{ scale: activeQuest === quest.id ? 1.3 : 1.1 }}
                          >
                            <div
                              className={`w-20 h-20 rounded-full flex items-center justify-center relative cursor-pointer
                              ${quest.completed ? "border-2 border-white/20" : "border border-white/10"}
                              shadow-xl`}
                              style={{
                                background:
                                  quest.difficulty === 1
                                    ? "linear-gradient(to bottom, #4ade80, #22c55e)"
                                    : quest.difficulty === 2
                                      ? "linear-gradient(to bottom, #2dd4bf, #0d9488)"
                                      : quest.difficulty === 3
                                        ? "linear-gradient(to bottom, #3b82f6, #1d4ed8)"
                                        : quest.difficulty === 4
                                          ? "linear-gradient(to bottom, #a855f7, #7e22ce)"
                                          : "linear-gradient(to bottom, #ef4444, #b91c1c)",
                                boxShadow:
                                  activeQuest === quest.id
                                    ? `0 0 20px 5px ${
                                        quest.difficulty === 1
                                          ? "rgba(74, 222, 128, 0.5)"
                                          : quest.difficulty === 2
                                            ? "rgba(45, 212, 191, 0.5)"
                                            : quest.difficulty === 3
                                              ? "rgba(59, 130, 246, 0.5)"
                                              : quest.difficulty === 4
                                                ? "rgba(168, 85, 247, 0.5)"
                                                : "rgba(239, 68, 68, 0.5)"
                                      }`
                                    : "none",
                              }}
                              onClick={() => setActiveQuest(quest.id)}
                            >
                              {/* Planet rings */}
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                <div
                                  className="absolute w-28 h-6 bg-white/10 rounded-full left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                  style={{ transform: "translate(-50%, -50%) rotate(30deg)" }}
                                ></div>
                              </div>

                              {activeQuest === quest.id && (
                                <motion.div
                                  className="absolute -top-10 left-1/2 -translate-x-1/2"
                                  initial={{ y: -10, opacity: 0 }}
                                  animate={{ y: 0, opacity: 1 }}
                                  transition={{ delay: 0.2 }}
                                >
                                  <div className="relative">
                                    <Flag className="w-6 h-6 text-green-400 filter drop-shadow-lg" />
                                    <div className="absolute inset-0 animate-pulse bg-green-400 rounded-full filter blur-xl opacity-30"></div>
                                  </div>
                                </motion.div>
                              )}

                              {quest.completed ? (
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  initial={{ rotate: 0 }}
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                                >
                                  <Star className="w-8 h-8 text-amber-400 fill-amber-400 filter drop-shadow-lg" />
                                </motion.div>
                              ) : quest.id !== activeQuest ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-full">
                                  <Lock className="w-8 h-8 text-white/70" />
                                </div>
                              ) : (
                                <motion.div
                                  className="absolute inset-0 flex items-center justify-center"
                                  animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.8, 1, 0.8],
                                  }}
                                  transition={{
                                    duration: 2,
                                    repeat: Number.POSITIVE_INFINITY,
                                    ease: "easeInOut",
                                  }}
                                >
                                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                    <Sparkles className="w-5 h-5 text-white" />
                                  </div>
                                </motion.div>
                              )}

                              {/* Planet details */}
                              <div className="absolute inset-0 rounded-full overflow-hidden">
                                {quest.difficulty === 1 && (
                                  <div className="absolute inset-0">
                                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-green-300 rounded-full"></div>
                                    <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-green-300 rounded-full"></div>
                                    <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-green-300 rounded-full"></div>
                                  </div>
                                )}

                                {quest.difficulty === 2 && (
                                  <div className="absolute inset-0">
                                    <div className="absolute top-1/4 w-full h-1 bg-teal-500 opacity-30"></div>
                                    <div className="absolute top-1/2 w-full h-2 bg-teal-500 opacity-20"></div>
                                    <div className="absolute bottom-1/4 w-full h-1 bg-teal-500 opacity-30"></div>
                                  </div>
                                )}

                                {quest.difficulty === 3 && (
                                  <div className="absolute inset-0">
                                    <div className="absolute top-1/3 left-1/4 w-8 h-8 bg-blue-300 rounded-full opacity-40"></div>
                                    <div className="absolute bottom-1/3 right-1/4 w-6 h-6 bg-blue-300 rounded-full opacity-40"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          <div className={`w-1/2 ${index % 2 === 0 ? "pr-16 text-right" : "pl-16 text-left"}`}>
                            <motion.div
                              className={`p-5 rounded-xl backdrop-blur-sm border ${
                                activeQuest === quest.id
                                  ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-foreground border-white/20 shadow-lg shadow-blue-600/10"
                                  : "bg-secondary/30 text-muted-foreground border-primary/5"
                              }`}
                              whileHover={{
                                scale: 1.02,
                                transition: { duration: 0.2 },
                              }}
                            >
                              <h4 className="font-bold text-lg">{quest.title}</h4>
                              {activeQuest === quest.id && (
                                <motion.p
                                  className="text-sm mt-2 text-blue-200"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.1 }}
                                >
                                  {quest.description}
                                </motion.p>
                              )}
                              {activeQuest === quest.id && (
                                <motion.button
                                  className="mt-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 group flex items-center"
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ delay: 0.2 }}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => router.push("/quests")}
                                >
                                  詳細を見る
                                  <ChevronRight className="w-4 h-4 inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                                </motion.button>
                              )}
                            </motion.div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6 border border-white/10">
                    <MapPin className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-300 mb-4">クエストが設定されていません</h3>
                  <p className="text-gray-400 text-center max-w-md mb-8">
                    パッションシャトルに基づいたクエストを設定して、あなたの探究活動をスタートしましょう。
                  </p>
                  <Button
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700"
                    onClick={() => router.push("/quest-setup/direction")}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    クエスト設定を始める
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <DashboardTutorial
        onComplete={() => setTutorialDone(true)}
        force={!userProfile || !userProfile.display_name || !userProfile.avatar}
      />
      <ProfileSetupDialog open={showProfileSetup} onClose={() => setShowProfileSetup(false)} />
      <SocialIssueDialog
        open={showIssueSetup}
        onOpenChange={(o) => !o && setShowIssueSetup(false)}
        onComplete={() => {
          setShowIssueSetup(false)
          router.push("/passion-shuttle")
        }}
      />
    </AuthCheck>
  )
}
