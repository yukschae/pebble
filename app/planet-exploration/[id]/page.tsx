"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  Star,
  Zap,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react"
import {
  getUserQuests,
  saveQuestReflection,
  saveAdventureStory,
  updateRPGProfile,
  getUserStats,
  useAuth,
} from "@/lib/supabase"
import {
  type PlanetQuest,
  calculateEnergyGain,
  checkEarnedSpaceBadges,
  calculateExplorerLevel,
  generateSpaceStory,
} from "@/lib/space-rpg-system"
import { AuthCheck } from "@/components/auth/auth-check"

interface Quest {
  id: number
  title: string
  description: string
  actions: string[]
  outcome: string
  difficulty: number
}

export default function PlanetExplorationPage() {
  const router = useRouter()
  const params = useParams()
  const { user, userProfile } = useAuth()
  const questId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [quest, setQuest] = useState<Quest | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentPhase, setCurrentPhase] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)
  const [earnedBadges, setEarnedBadges] = useState<any[]>([])
  const [energyGained, setEnergyGained] = useState(0)

  // フォームデータ
  const [preFlightForm, setPreFlightForm] = useState({
    success_rate: 70,
    excitement: 3,
    importance: 3,
    difficulty: 3,
  })

  const [landingForm, setLandingForm] = useState({
    success_rate: 70,
    excitement: 3,
    importance: 3,
    difficulty: 3,
  })

  const [explorationForm, setExplorationForm] = useState({
    what_discovered: "",
    what_could_improve: "",
    cosmic_insights: "",
    next_destination: "",
  })

  useEffect(() => {
    if (user && questId) {
      loadQuest()
    }
  }, [user, questId])

  const loadQuest = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const quests = await getUserQuests(user.id)
      const foundQuest = quests.find((q: Quest) => q.id === questId)

      if (!foundQuest) {
        setError("惑星が見つかりません。")
        return
      }

      setQuest(foundQuest)
      setPreFlightForm((prev) => ({
        ...prev,
        difficulty: foundQuest.difficulty || 3,
      }))
    } catch (error) {
      console.error("Error loading quest:", error)
      setError("惑星データの読み込み中にエラーが発生しました。")
    } finally {
      setLoading(false)
    }
  }

  const handlePhaseComplete = async () => {
    if (currentPhase < 3) {
      setCurrentPhase(currentPhase + 1)
    } else {
      await handleMissionComplete()
    }
  }

  const handleMissionComplete = async () => {
    if (!user || !quest) return

    try {
      setSaving(true)
      setError(null)

      // 惑星探索データを作成
      const exploration: PlanetQuest = {
        user_id: user.id,
        planet_id: quest.id,
        planet_name: quest.title,
        planet_description: quest.description,
        planet_type: "exploration",
        expected_success_rate: preFlightForm.success_rate,
        expected_excitement: preFlightForm.excitement,
        expected_importance: preFlightForm.importance,
        expected_difficulty: preFlightForm.difficulty,
        actual_success_rate: landingForm.success_rate,
        actual_excitement: landingForm.excitement,
        actual_importance: landingForm.importance,
        actual_difficulty: landingForm.difficulty,
        what_discovered: explorationForm.what_discovered,
        what_could_improve: explorationForm.what_could_improve,
        cosmic_insights: explorationForm.cosmic_insights,
        next_destination: explorationForm.next_destination,
        energy_gained: 0,
        badges_earned: [],
        completed: true,
      }

      // エネルギー計算
      const energy = calculateEnergyGain(exploration)
      exploration.energy_gained = energy
      setEnergyGained(energy)

      // 探索者統計取得
      const explorerStats = await getUserStats(user.id)

      // バッジ判定
      const badges = checkEarnedSpaceBadges(exploration, explorerStats)
      exploration.badges_earned = badges
      setEarnedBadges(badges)

      // 探索記録を保存
      const savedExploration = await saveQuestReflection(exploration)

      // RPGプロファイル更新
      const newEnergy = (userProfile?.xp || 0) + energy
      const newLevel = calculateExplorerLevel(newEnergy)
      const allBadges = [...(userProfile?.badges || []), ...badges]

      await updateRPGProfile(user.id, newEnergy, newLevel, allBadges)

      // 宇宙ログに記録
      const explorerType = userProfile?.character_type || "astronaut"
      const landingStory = generateSpaceStory(
        "landing",
        {
          planet_name: quest.title,
          actual_success_rate: landingForm.success_rate,
          energy_gained: energy,
          badges_earned: badges,
        },
        explorerType,
      )

      const explorationLogStory = generateSpaceStory("exploration_log", explorationForm, explorerType)

      await saveAdventureStory(user.id, savedExploration.id as number, landingStory, "landing")
      await saveAdventureStory(user.id, savedExploration.id as number, explorationLogStory, "exploration_log")

      // 着陸成功演出
      setShowCelebration(true)

      // 3秒後にダッシュボードに戻る
      setTimeout(() => {
        router.push("/dashboard")
      }, 4000)
    } catch (error) {
      console.error("Error saving exploration:", error)
      setError("探索記録の保存中にエラーが発生しました。")
    } finally {
      setSaving(false)
    }
  }

  const getStarRating = (value: number, onChange: (value: number) => void) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className={`text-2xl transition-colors ${star <= value ? "text-yellow-400" : "text-gray-600"}`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      ))}
    </div>
  )

  const getSlider = (value: number, onChange: (value: number) => void, min = 0, max = 100) => (
    <div className="space-y-2">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number.parseInt(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="text-center text-lg font-semibold text-cyan-400">{value}%</div>
    </div>
  )

  if (loading) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="text-6xl mb-4"
            >
              🛰️
            </motion.div>
            <p className="text-blue-200">惑星スキャン中...</p>
          </div>
        </div>
      </AuthCheck>
    )
  }

  if (error || !quest) {
    return (
      <AuthCheck>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">通信エラー</h2>
            <p className="text-blue-200 mb-6">{error}</p>
            <button
              onClick={() => router.push("/quests")}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
            >
              宇宙ステーションに戻る
            </button>
          </div>
        </div>
      </AuthCheck>
    )
  }

  return (
    <AuthCheck>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-blue-100 relative overflow-hidden">
        {/* 宇宙背景 */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {Array.from({ length: 150 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0.1, 1, 0.1],
                scale: [0.5, 1.5, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Number.POSITIVE_INFINITY,
                delay: Math.random() * 5,
              }}
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                boxShadow: `0 0 ${Math.random() * 6 + 2}px rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`,
              }}
            />
          ))}
        </div>

        {/* 着陸成功演出 */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
            >
              <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: 2,
                  }}
                  className="text-8xl mb-6"
                >
                  🌍
                </motion.div>
                <h2 className="text-4xl font-bold text-white mb-4">惑星探索完了！</h2>
                <div className="text-2xl text-cyan-400 mb-2">+{energyGained} エネルギー</div>
                {earnedBadges.length > 0 && (
                  <div className="flex justify-center gap-2 mb-4">
                    {earnedBadges.map((badge, index) => (
                      <motion.div
                        key={badge.id}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="text-3xl"
                      >
                        {badge.icon}
                      </motion.div>
                    ))}
                  </div>
                )}
                <p className="text-blue-200">宇宙ステーションに帰還中...</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <button
              onClick={() => router.push("/quests")}
              className="flex items-center px-4 py-2 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg text-white border border-cyan-500/30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              宇宙ステーション
            </button>
            <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 text-transparent bg-clip-text">
              惑星探索ミッション
            </h1>
            <div className="w-32"></div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-300">フェーズ {currentPhase} / 3</span>
              <span className="text-sm text-blue-300">{Math.round((currentPhase / 3) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-3 rounded-full"
                initial={{ width: "33%" }}
                animate={{ width: `${(currentPhase / 3) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Planet Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-cyan-500/30 mb-8"
          >
            <div className="flex items-start">
              <motion.div
                className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 border border-cyan-500/30"
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                    "0 0 30px rgba(59, 130, 246, 0.5)",
                    "0 0 20px rgba(59, 130, 246, 0.3)",
                  ],
                }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              >
                <Globe className="w-8 h-8 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-white mb-2">惑星 {quest.title}</h2>
                <p className="text-blue-200 mb-3">{quest.description}</p>
                <div className="flex items-center text-sm text-blue-300">
                  <Zap className="w-4 h-4 mr-1" />
                  危険度: {quest.difficulty}/5 | タイプ: 探索惑星 🌍
                </div>
              </div>
            </div>
          </motion.div>

          {/* Phase Content */}
          <AnimatePresence mode="wait">
            {currentPhase === 1 && (
              <motion.div
                key="phase1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-cyan-500/30"
              >
                <div className="text-center mb-8">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    className="text-4xl mb-4"
                  >
                    🚀
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-2">打ち上げ前チェック</h3>
                  <p className="text-blue-200">この惑星探索に対する期待値を設定してください</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-medium text-white mb-4">探索成功の確率はどのくらいだと思いますか？</label>
                    {getSlider(preFlightForm.success_rate, (value) =>
                      setPreFlightForm((prev) => ({ ...prev, success_rate: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                      どのくらいワクワクしていますか？
                    </label>
                    {getStarRating(preFlightForm.excitement, (value) =>
                      setPreFlightForm((prev) => ({ ...prev, excitement: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      この探索はどのくらい重要ですか？
                    </label>
                    {getStarRating(preFlightForm.importance, (value) =>
                      setPreFlightForm((prev) => ({ ...prev, importance: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-red-400" />
                      どのくらい困難だと予想しますか？
                    </label>
                    {getStarRating(preFlightForm.difficulty, (value) =>
                      setPreFlightForm((prev) => ({ ...prev, difficulty: value })),
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentPhase === 2 && (
              <motion.div
                key="phase2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-cyan-500/30"
              >
                <div className="text-center mb-8">
                  <motion.div
                    animate={{
                      rotate: [0, 360],
                    }}
                    transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="text-4xl mb-4"
                  >
                    🌍
                  </motion.div>
                  <h3 className="text-2xl font-semibold text-white mb-2">惑星着陸完了</h3>
                  <p className="text-blue-200">実際の探索結果はどうでしたか？</p>
                </div>

                <div className="space-y-8">
                  <div>
                    <label className="block text-lg font-medium text-white mb-4">実際の探索成功度はどのくらいでしたか？</label>
                    {getSlider(landingForm.success_rate, (value) =>
                      setLandingForm((prev) => ({ ...prev, success_rate: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Sparkles className="w-5 h-5 mr-2 text-cyan-400" />
                      実際にどのくらいワクワクしましたか？
                    </label>
                    {getStarRating(landingForm.excitement, (value) =>
                      setLandingForm((prev) => ({ ...prev, excitement: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Star className="w-5 h-5 mr-2 text-yellow-400" />
                      実際にどのくらい重要でしたか？
                    </label>
                    {getStarRating(landingForm.importance, (value) =>
                      setLandingForm((prev) => ({ ...prev, importance: value })),
                    )}
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-4 flex items-center">
                      <Zap className="w-5 h-5 mr-2 text-red-400" />
                      実際にどのくらい困難でしたか？
                    </label>
                    {getStarRating(landingForm.difficulty, (value) =>
                      setLandingForm((prev) => ({ ...prev, difficulty: value })),
                    )}
                  </div>
                </div>

                {/* 期待vs現実の比較 */}
                <div className="mt-8 p-6 bg-gray-900/50 rounded-lg border border-cyan-500/20">
                  <h4 className="text-lg font-semibold text-white mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                    期待 vs 現実
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-blue-300 mb-2">成功率</div>
                      <div className="flex items-center">
                        <span className="text-cyan-400">期待: {preFlightForm.success_rate}%</span>
                        <ArrowRight className="w-4 h-4 mx-2 text-gray-500" />
                        <span className="text-green-400">実際: {landingForm.success_rate}%</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-blue-300 mb-2">ワクワク度</div>
                      <div className="flex items-center">
                        <span className="text-cyan-400">期待: {preFlightForm.excitement}/5</span>
                        <ArrowRight className="w-4 h-4 mx-2 text-gray-500" />
                        <span className="text-green-400">実際: {landingForm.excitement}/5</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentPhase === 3 && (
              <motion.div
                key="phase3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-cyan-500/30"
              >
                <div className="text-center mb-8">
                  <div className="text-4xl mb-4">📡</div>
                  <h3 className="text-2xl font-semibold text-white mb-2">探索ログ記録</h3>
                  <p className="text-blue-200">この惑星で何を発見しましたか？</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-medium text-white mb-3">どんな発見をしましたか？ 🔍</label>
                    <textarea
                      value={explorationForm.what_discovered}
                      onChange={(e) => setExplorationForm((prev) => ({ ...prev, what_discovered: e.target.value }))}
                      rows={4}
                      className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="新しい発見や成果について記録しましょう..."
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">改善できることは何ですか？ 🔧</label>
                    <textarea
                      value={explorationForm.what_could_improve}
                      onChange={(e) => setExplorationForm((prev) => ({ ...prev, what_could_improve: e.target.value }))}
                      rows={4}
                      className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="次回の探索でより良くできることを記録しましょう..."
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">宇宙的な洞察は何ですか？ 💫</label>
                    <textarea
                      value={explorationForm.cosmic_insights}
                      onChange={(e) => setExplorationForm((prev) => ({ ...prev, cosmic_insights: e.target.value }))}
                      rows={4}
                      className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="この探索から得た深い気づきや学びを記録しましょう..."
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-medium text-white mb-3">次はどの惑星を探索しますか？ 🚀</label>
                    <textarea
                      value={explorationForm.next_destination}
                      onChange={(e) => setExplorationForm((prev) => ({ ...prev, next_destination: e.target.value }))}
                      rows={4}
                      className="w-full bg-gray-900/50 border border-cyan-500/30 rounded-lg p-4 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                      placeholder="この経験を活かして次に探索したい惑星や目標を記録しましょう..."
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentPhase(Math.max(1, currentPhase - 1))}
              disabled={currentPhase === 1}
              className="flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed border border-gray-600"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              前へ
            </button>

            <button
              onClick={handlePhaseComplete}
              disabled={saving}
              className="flex items-center px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white font-medium disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  記録中...
                </>
              ) : currentPhase === 3 ? (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  探索完了
                </>
              ) : (
                <>
                  次へ
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start mt-6"
            >
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        <style jsx>{`
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            border: 2px solid #0891b2;
          }

          .slider::-moz-range-thumb {
            height: 20px;
            width: 20px;
            border-radius: 50%;
            background: #06b6d4;
            cursor: pointer;
            border: 2px solid #0891b2;
          }
        `}</style>
      </div>
    </AuthCheck>
  )
}