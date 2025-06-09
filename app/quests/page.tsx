/**
 * クエストページコンポーネント
 *
 * このファイルは、ユーザーのクエスト（探究活動の段階的なミッション）を
 * 表示するページを実装しています。
 *
 * 主な機能：
 * - クエスト一覧の表示
 * - クエストの詳細表示
 * - クエストの進捗管理
 * - 自己評価機能（面白さ、達成できる自信）
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 *
 * データフロー：
 * 1. データベースからクエスト情報を取得
 * 2. クエスト情報を表示
 * 3. ユーザーの自己評価を収集
 * 4. 評価データをデータベースに保存
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - app/quest-setup/quests/page.tsx (クエスト設定ページ)
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Award,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  Star,
  ChevronRight,
  Flame,
  Diamond,
  CheckCircle,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Sparkles,
  ArrowLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import {
  getSelectedPassionShuttle,
  getSelectedQuestDirection,
  getUserQuests,
  useAuthContext,
} from "@/lib/supabase"

interface QuestData {
  id: number
  title: string
  completed: boolean
  current: boolean
  description: string
  actions: string[]
  outcome: string
  difficulty: number
  order: number
  planet?: string
  funRating?: number
  confidenceRating?: number
  icon?: React.ComponentType<any>
  color?: string
}

const ICONS = [BookOpen, Target, Lightbulb, Users, Sparkles]
const COLOR_MAP: Record<string, string> = {
  gray: "from-gray-600 to-gray-800",
  blue: "from-blue-500 to-indigo-600",
  green: "from-green-500 to-emerald-600",
  orange: "from-orange-500 to-amber-600",
  "orange-red": "from-red-500 to-orange-600",
  purple: "from-purple-500 to-pink-600",
  red: "from-red-600 to-orange-600",
  yellow: "from-yellow-500 to-amber-500",
  "blue-green": "from-teal-500 to-cyan-600",
  pink: "from-pink-500 to-fuchsia-600",
}


export default function QuestsPage() {
  const router = useRouter()
  const { user, userProfile } = useAuthContext()
  const [passionShuttle, setPassionShuttle] = useState<any>(null)
  const [questDirection, setQuestDirection] = useState<any>(null)
  const [quests, setQuests] = useState<any[]>([])
  const [showStars, setShowStars] = useState(false)
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null)
  const [funRating, setFunRating] = useState<Record<number, number>>({})
  const [confidenceRating, setConfidenceRating] = useState<Record<number, number>>({})


  useEffect(() => {
    if (!user) return

    const loadData = async () => {
      try {
        const [shuttle, direction, userQuests] = await Promise.all([
          getSelectedPassionShuttle(user.id),
          getSelectedQuestDirection(user.id),
          getUserQuests(user.id),
        ])

        const questsArray = userQuests || []

        setPassionShuttle(shuttle)
        setQuestDirection(direction)

        const questsWithExtras = questsArray.map((q, idx) => {
          const planetKey = q.planet ?? ""
          return {
            ...q,
            icon: ICONS[idx % ICONS.length],
            color: COLOR_MAP[planetKey] || "from-gray-600 to-gray-800",
          }
        })

        const initialFunRating: Record<number, number> = {}
        const initialConfidenceRating: Record<number, number> = {}

        questsWithExtras.forEach((quest: QuestData) => {
          initialFunRating[quest.id] = quest.funRating || 0
          if (quest.confidenceRating) {
            initialConfidenceRating[quest.id] = quest.confidenceRating
          }
        })

        setQuests(questsWithExtras)
        setFunRating(initialFunRating)
        setConfidenceRating(initialConfidenceRating)

        const currentQuest = questsWithExtras.find((q: QuestData) => q.current)
        if (currentQuest) setSelectedQuest(currentQuest.id)
      } catch (err) {
        console.error("Error loading quests:", err)
      } finally {
        setShowStars(true)
      }
      
    }
    loadData()
  }, [user])

  const username = userProfile?.display_name || user?.email || "ユーザー"
  const userInitial = username.charAt(0).toUpperCase()


  const handleFunRatingChange = (questId: number, value: number) => {
    setFunRating((prev) => ({
      ...prev,
      [questId]: value,
    }))
  }

  const handleConfidenceRatingChange = (questId: number, value: number) => {
    setConfidenceRating((prev) => ({
      ...prev,
      [questId]: value,
    }))
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {showStars &&
             Array.from({ length: 100 }).map((_, i: number) => (
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

      {/* Sidebar */}
      <motion.div
        className="w-64 bg-gray-900/60 backdrop-blur-xl border-r border-white/10 z-10 shadow-2xl"
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
            className="mb-2 hover:bg-white/5 rounded-xl p-3 flex items-center text-gray-400 transition-all duration-300 border border-transparent hover:border-white/10"
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
            onClick={() => router.push("/dashboard")}
          >
            <div className="bg-gradient-to-br from-orange-400 to-amber-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-orange-600/20">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">ダッシュボード</span>
          </motion.div>

          <motion.div
            className="mb-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-3 flex items-center text-blue-400 border border-blue-500/30"
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
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
          >
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-10 h-10 rounded-full flex items-center justify-center mr-3 shadow-lg shadow-purple-600/20">
              <MoreHorizontal className="w-5 h-5 text-white" />
            </div>
            <span>その他</span>
          </motion.div>
        </div>

        {/* User profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-white/5 rounded-xl p-3 flex items-center border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mr-3">
            <span className="text-white font-bold">{userInitial}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{username}</div>
              <div className="text-xs text-gray-400">レベル 5</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-10">
          {/* Header */}
          <motion.div
            className="relative mb-10 flex items-center"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.button
              className="mr-4 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="w-5 h-5 text-gray-300" />
            </motion.button>

            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-2xl font-bold py-5 px-8 rounded-2xl shadow-lg shadow-blue-600/20 text-center border border-white/10 backdrop-blur-sm flex-1">
            <span className="mr-2">🚀</span> パッションシャトル：「{passionShuttle?.title}」 <span className="ml-2">🎨</span>
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

          {/* Quest Description */}
          <motion.div
            className="bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-6 mb-10"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              探究テーマ
            </h3>
            <p className="text-gray-300 mb-6">
            {questDirection?.description}
            </p>

            <div className="flex flex-wrap gap-3">
            {questDirection?.focus_areas?.map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Quest List */}
          <div className="grid grid-cols-1 gap-6 mb-10">
          {quests.map((quest, index) => (
              <motion.div
                key={quest.id}
                className={`bg-gray-900/40 backdrop-blur-xl rounded-2xl shadow-xl border ${
                  quest.current
                    ? "border-blue-500/50 shadow-blue-500/20"
                    : quest.completed
                      ? "border-green-500/30"
                      : "border-white/10"
                } overflow-hidden`}
                initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              >
                <div className="p-6">
                  <div className="flex items-start">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${quest.color} rounded-xl flex items-center justify-center mr-4 flex-shrink-0 shadow-lg border border-white/20`}
                    >
                      {quest.completed ? (
                        <CheckCircle className="w-7 h-7 text-white" />
                      ) : (
                        (() => {
                          const Icon = quest.icon
                          return Icon ? <Icon className="w-7 h-7 text-white" /> : null
                        })()
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3
                          className={`text-xl font-bold ${
                            quest.current ? "text-blue-400" : quest.completed ? "text-green-400" : "text-white"
                          }`}
                        >
                          クエスト{quest.id}: {quest.title}
                          {quest.current && (
                            <span className="ml-3 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-500/30">
                              現在進行中
                            </span>
                          )}
                          {quest.completed && (
                            <span className="ml-3 text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-500/30">
                              完了済み
                            </span>
                          )}
                        </h3>

                        <motion.button
                          className={`p-2 rounded-full ${
                            selectedQuest === quest.id
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                              : "bg-white/5 text-gray-400 border-white/10"
                          } border hover:bg-white/10 transition-colors`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedQuest(selectedQuest === quest.id ? null : quest.id)}
                        >
                          <ChevronDown
                            className={`w-5 h-5 transition-transform duration-300 ${
                              selectedQuest === quest.id ? "rotate-180" : ""
                            }`}
                          />
                        </motion.button>
                      </div>

                      <p className="text-gray-400 mt-2">{quest.description}</p>

                      {/* Ratings */}
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-sm text-gray-400 flex items-center">
                              <Star className="w-4 h-4 text-amber-400 mr-1 fill-amber-400" />
                              クエストの面白さ
                            </label>
                            <span className="text-amber-400 font-bold">{funRating[quest.id]}%</span>
                          </div>
                          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${funRating[quest.id]}%` }}
                              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                            />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={funRating[quest.id]}
                              onChange={(e) => handleFunRatingChange(quest.id, Number.parseInt(e.target.value))}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              disabled={!quest.current && !quest.completed}
                            />
                          </div>
                        </div>

                        {quest.current && !quest.completed && (
                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-sm text-gray-400 flex items-center">
                                <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                                達成できる自信
                              </label>
                              <span className="text-green-400 font-bold">{confidenceRating[quest.id]}%</span>
                            </div>
                            <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${confidenceRating[quest.id]}%` }}
                                transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                              />
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={confidenceRating[quest.id]}
                                onChange={(e) =>
                                  handleConfidenceRatingChange(quest.id, Number.parseInt(e.target.value))
                                }
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {selectedQuest === quest.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-6 pt-6 border-t border-white/10">
                          <h4 className="font-bold text-white mb-3">行動例:</h4>
                          <ul className="space-y-2 text-gray-300 list-disc pl-5">
                          {quest.actions.map((action: string, i: number) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>

                          <h4 className="font-bold text-white mt-5 mb-3">成果物:</h4>
                          <p className="text-gray-300">{quest.outcome}</p>

                          {quest.current && !quest.completed && (
                            <motion.button
                              className="mt-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 group flex items-center"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              このクエストに取り組む
                              <ChevronRight className="w-5 h-5 inline-block ml-1 group-hover:translate-x-1 transition-transform duration-300" />
                            </motion.button>
                          )}

                          {!quest.current && !quest.completed && (
                            <div className="mt-6 bg-gray-800/50 border border-white/10 rounded-xl p-4 text-gray-400 text-sm">
                              このクエストは前のクエストを完了すると解放されます。
                            </div>
                          )}

                          {quest.completed && (
                            <div className="mt-6 bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-green-300 text-sm flex items-center">
                              <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                              このクエストは完了しています！おめでとうございます！
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
