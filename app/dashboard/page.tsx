"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  MessageCircle,
  BarChart3,
  Target,
  Rocket,
  Flame,
  ChevronRight,
  Sparkles,
  Zap,
  Globe,
  Brain,
  Compass,
  Trophy,
  Clock,
  Map,
  CheckCircle,
} from "lucide-react"
import {
  useAuth,
  getUserRiasecResults,
  getUserOceanResults,
  getSelectedPassionShuttle,
  getUserQuests,
  getAdventureStories,
} from "@/lib/supabase"
import { CommanderMessageBoard } from "@/components/commander-message-board"
import { AuthCheck } from "@/components/auth/auth-check"
import { EXPLORER_TYPES, getEnergyForNextLevel } from "@/lib/space-rpg-system"
import { CommanderTutorial } from "@/components/commander-tutorial"
import { CommanderNamePrompt } from "@/components/commander-name-prompt"

interface DashboardData {
  riasecResults: any
  oceanResults: any
  passionShuttle: any
  quests: any[]
  adventureStories: any[]
}

export default function Dashboard() {
  const router = useRouter()
  const { user, userProfile, signOut, updateUserProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showTutorial, setShowTutorial] = useState(false)
  const [showNameDialog, setShowNameDialog] = useState(false)
  const [data, setData] = useState<DashboardData>({
    riasecResults: null,
    oceanResults: null,
    passionShuttle: null,
    quests: [],
    adventureStories: [],
  })

  useEffect(() => {
    if (user) {
      loadDashboardData()
    }
  }, [user])

  useEffect(() => {
    if (user && userProfile) {
      if (!userProfile.display_name) {
        setShowNameDialog(true)
      } else {
        const completed = localStorage.getItem("limitfree_tutorial_completed")
        if (!completed) setShowTutorial(true)
      }
    }
  }, [user, userProfile])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      const [riasecResults, oceanResults, passionShuttle, quests, adventureStories] = await Promise.all([
        getUserRiasecResults(user.id),
        getUserOceanResults(user.id),
        getSelectedPassionShuttle(user.id),
        getUserQuests(user.id),
        getAdventureStories(user.id, 5),
      ])
      setData({ riasecResults, oceanResults, passionShuttle, quests, adventureStories })
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  const handleSaveName = async (name: string) => {
    await updateUserProfile(name)
    setShowNameDialog(false)
    const completed = localStorage.getItem("limitfree_tutorial_completed")
    if (!completed) setShowTutorial(true)
  }

  const level = userProfile?.level || 1
  const energy = userProfile?.xp || 0
  const explorerType = (userProfile?.character_type as keyof typeof EXPLORER_TYPES) || "astronaut"
  const badges = userProfile?.badges || []

  const explorer = EXPLORER_TYPES[explorerType] || EXPLORER_TYPES.astronaut
  const energyInfo = getEnergyForNextLevel(energy)

  const currentQuest = data.quests.find((q) => q.current)
  const completedQuests = data.quests.filter((q) => q.completed).length
  const progressPercentage = energyInfo.progress
  const questProgress = data.quests.length ? (completedQuests / data.quests.length) * 100 : 0

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
        {/* ヘッダー */}
        <motion.header
          className="bg-gray-900/60 backdrop-blur-xl border-b border-cyan-500/30 sticky top-0 z-50"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center mr-4 shadow-lg"
                >
                  <span className="text-white font-bold">🛰️</span>
                </motion.div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Pebbleステーション司令室</h1>
                  <p className="text-cyan-300 text-sm">
                    {currentTime.toLocaleString("ja-JP", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gray-800/60 px-4 py-2 rounded-xl border border-gray-600/30">
                  <Flame className="w-5 h-5 text-orange-400 mr-2" />
                  <span className="text-white font-bold">{energy}</span>
                  <span className="text-gray-400 text-sm ml-1">/{energyInfo.required}</span>
                </div>
                <div className="flex items-center bg-gray-800/60 px-4 py-2 rounded-xl border border-gray-600/30">
                  <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                  <span className="text-white font-bold">Lv.{level}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* メインコンテンツ */}
            <div className="lg:col-span-2 space-y-8">
              {/* ウェルカムセクション */}
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-white mb-2">おかえりなさい、{userProfile?.display_name || "Explorer"}飛行士！</h2>
                      <p className="text-cyan-300">宇宙探索の準備はいかがですか？</p>
                    </div>
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                      className="text-6xl"
                    >
                      {explorer.emoji}
                    </motion.div>
                  </div>
                  {/* エネルギーバー */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-300 text-sm">宇宙飛行士エネルギー</span>
                      <span className="text-cyan-400 font-bold">{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                        transition={{ duration: 2, delay: 0.5 }}
                      />
                    </div>
                  </div>
                  {/* クイックアクション */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.button
                      onClick={() => router.push("/quests")}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-xl border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Map className="w-8 h-8 text-orange-400 mb-2" />
                      <span className="text-white font-medium text-sm">惑星マップ</span>
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/ai-chat")}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <MessageCircle className="w-8 h-8 text-blue-400 mb-2" />
                      <span className="text-white font-medium text-sm">AI司令部</span>
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/passion-shuttle")}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-xl border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Rocket className="w-8 h-8 text-purple-400 mb-2" />
                      <span className="text-white font-medium text-sm">シャトル</span>
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/riasec/assessment")}
                      className="flex flex-col items-center p-4 bg-gradient-to-br from-green-500/20 to-teal-600/20 rounded-xl border border-green-500/30 hover:border-green-400/50 transition-all duration-300"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                      <span className="text-white font-medium text-sm">分析</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>

              {/* 現在のミッション */}
              {currentQuest && (
                <motion.div
                  className="bg-gradient-to-br from-orange-900/40 to-red-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-500/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Target className="w-6 h-6 text-orange-400 mr-2" />
                        アクティブミッション
                      </h3>
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full border border-orange-500/30">
                        進行中
                      </span>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold text-white mb-2">{currentQuest.title}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-300 text-sm">進捗状況</span>
                        <span className="text-orange-400 font-bold">{currentQuest.progress || 0}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${currentQuest.progress || 0}%` }}
                          transition={{ duration: 2, delay: 0.7 }}
                        />
                      </div>
                    </div>
                    <motion.button
                      onClick={() => router.push(`/quest-reflection/${currentQuest.id}`)}
                      className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl text-white font-medium shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      ミッションを完了する
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* パッションシャトル */}
              {data.passionShuttle && (
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-2xl shadow-2xl border border-purple-500/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-white flex items-center">
                        <Rocket className="w-6 h-6 text-purple-400 mr-2" />
                        パッションシャトル
                      </h3>
                      <motion.button
                        onClick={() => router.push("/passion-shuttle")}
                        className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30 hover:bg-purple-500/30 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        変更
                      </motion.button>
                    </div>
                    <div className="flex items-center mb-4">
                      <div
                        className={`w-16 h-16 bg-gradient-to-br ${data.passionShuttle.color} rounded-xl flex items-center justify-center mr-4 text-2xl shadow-lg`}
                      >
                        {data.passionShuttle.emoji}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{data.passionShuttle.name}</h4>
                        <p className="text-purple-300 text-sm">{data.passionShuttle.type}</p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm">{data.passionShuttle.description}</p>
                  </div>
                </motion.div>
              )}

              {/* 統計カード */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 backdrop-blur-xl rounded-xl p-4 border border-blue-500/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Globe className="w-6 h-6 text-blue-400" />
                    <span className="text-2xl font-bold text-white">{completedQuests}</span>
                  </div>
                  <p className="text-blue-300 text-sm">発見した惑星</p>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-br from-yellow-900/40 to-amber-900/40 backdrop-blur-xl rounded-xl p-4 border border-yellow-500/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                    <span className="text-2xl font-bold text-white">{badges.length}</span>
                  </div>
                  <p className="text-yellow-300 text-sm">獲得バッジ</p>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 backdrop-blur-xl rounded-xl p-4 border border-green-500/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-2xl font-bold text-white">{questProgress.toFixed(0)}%</span>
                  </div>
                  <p className="text-green-300 text-sm">探索進捗</p>
                </motion.div>
                <motion.div
                  className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.7 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Zap className="w-6 h-6 text-purple-400" />
                    <span className="text-2xl font-bold text-white">Lv.{level}</span>
                  </div>
                  <p className="text-purple-300 text-sm">飛行士レベル</p>
                </motion.div>
              </div>

              {/* 最近の活動 */}
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Clock className="w-6 h-6 text-cyan-400 mr-2" />
                    最近の活動
                  </h3>
                  <div className="space-y-3">
                    {data.adventureStories.map((story: any, index: number) => (
                      <motion.div
                        key={story.id}
                        className="flex items-center p-3 bg-gray-800/40 rounded-lg border border-gray-600/30"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.9 + index * 0.1 }}
                      >
                        <div className="text-2xl mr-3">🌌</div>
                        <div className="flex-1">
                          <p className="text-white font-medium text-sm whitespace-pre-line">{story.story_content}</p>
                          <p className="text-gray-400 text-xs">{new Date(story.created_at).toLocaleString("ja-JP")}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* 司令官メッセージボード */}
              <CommanderMessageBoard userProfile={userProfile} dashboardData={data} />

              {/* 分析結果 */}
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Brain className="w-6 h-6 text-cyan-400 mr-2" />
                    適性分析結果
                  </h3>
                  <div className="space-y-4">
                    {data.riasecResults && (
                      <div className="p-4 bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl border border-blue-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-blue-300 text-sm">RIASEC分析</span>
                          <span className="text-blue-400 font-bold">{data.riasecResults.score}%</span>
                        </div>
                        <p className="text-white font-medium">{data.riasecResults.type}</p>
                        <p className="text-gray-300 text-xs">{data.riasecResults.description}</p>
                      </div>
                    )}
                    {data.oceanResults && (
                      <div className="p-4 bg-gradient-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-purple-300 text-sm">OCEAN分析</span>
                          <span className="text-purple-400 font-bold">{data.oceanResults.score}%</span>
                        </div>
                        <p className="text-white font-medium">{data.oceanResults.type}</p>
                        <p className="text-gray-300 text-xs">{data.oceanResults.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* クイックナビゲーション */}
              <motion.div
                className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Compass className="w-6 h-6 text-cyan-400 mr-2" />
                    ナビゲーション
                  </h3>
                  <div className="space-y-2">
                    <motion.button
                      onClick={() => router.push("/riasec/assessment")}
                      className="w-full flex items-center p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                      whileHover={{ x: 5 }}
                    >
                      <BarChart3 className="w-5 h-5 mr-3 text-blue-400" />
                      <span>RIASEC分析</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/ocean/assessment")}
                      className="w-full flex items-center p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                      whileHover={{ x: 5 }}
                    >
                      <Brain className="w-5 h-5 mr-3 text-purple-400" />
                      <span>OCEAN分析</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </motion.button>
                    <motion.button
                      onClick={() => router.push("/quest-setup/direction")}
                      className="w-full flex items-center p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300 border border-transparent hover:border-white/10"
                      whileHover={{ x: 5 }}
                    >
                      <Target className="w-5 h-5 mr-3 text-green-400" />
                      <span>新しいクエスト</span>
                      <ChevronRight className="w-4 h-4 ml-auto" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      {showNameDialog && (
        <CommanderNamePrompt onSave={handleSaveName} onClose={() => setShowNameDialog(false)} />
      )}
      {showTutorial && (
        <CommanderTutorial onComplete={() => setShowTutorial(false)} />
      )}
    </AuthCheck>
  )
}
