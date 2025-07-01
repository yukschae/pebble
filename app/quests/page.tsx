"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  MessageCircle,
  ChevronDown,
  Star,
  Flame,
  Diamond,
  CheckCircle,
  BookOpen,
  Target,
  Lightbulb,
  Users,
  Sparkles,
  Zap,
  Satellite,
  Search,
  Rocket,
  X,
  ArrowRight,
  MapPin,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import {
  useAuth,
  getUserQuests,
  getSelectedQuestDirection,
  getSelectedPassionShuttle,
} from "@/lib/supabase"

// タイプライター効果のコンポーネント
function TypewriterText({ text, speed = 20, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex])
        setCurrentIndex((prev) => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    } else if (onComplete) {
      onComplete()
    }
  }, [currentIndex, text, speed, onComplete])

  return <span>{displayText}</span>
}

// 司令官キャラクター
const COMMANDER = {
  name: "Pebble交信官",
  emoji: "👩‍✈️",
  avatar: "from-blue-400 to-cyan-500",
  personality: "friendly",
}

const POSITIONS = [
  { x: 10, y: 20 },
  { x: 30, y: 35 },
  { x: 50, y: 50 },
  { x: 70, y: 35 },
  { x: 90, y: 20 },
]

const PLANET_EMOJI = "🪐"

// 2D惑星コンポーネント
function Planet2D({
  planet,
  isSelected,
  onClick,
  status,
}: {
  planet: any
  isSelected: boolean
  onClick: () => void
  status: string
}) {

  return (
    <motion.div
      className="absolute cursor-pointer"
      style={{
        left: `${planet.position.x}%`,
        top: `${planet.position.y}%`,
        transform: "translate(-50%, -50%)",
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      {/* 惑星のグロー効果 */}
      <div
        className="absolute inset-0 rounded-full blur-xl w-24 h-24 -translate-x-2 -translate-y-2"
        style={{ backgroundColor: planet.glowColor }}
      />

      {/* 惑星本体 */}
      <motion.div
        className={`relative w-20 h-20 rounded-full bg-gradient-to-br ${planet.bgColor} border-2 border-blue-300/30 shadow-2xl flex items-center justify-center ${isSelected ? 'z-30' : 'z-10'}`}
        animate={{
          boxShadow: isSelected
            ? `0 0 30px ${planet.glowColor}, 0 0 60px ${planet.glowColor}`
            : status === "current"
              ? `0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)`
              : `0 4px 15px rgba(0, 0, 0, 0.3)`,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* 惑星の絵文字 */}
        <div className="text-2xl filter drop-shadow-lg">{PLANET_EMOJI}</div>

        {/* 状態インジケーター */}
        {status === "completed" && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}

        {status === "current" && (
          <motion.div
            className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white shadow-lg"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
          >
            <Rocket className="w-4 h-4 text-white" />
          </motion.div>
        )}

        {status === "locked" && (
          <div className="absolute inset-0 bg-gray-900/70 rounded-full flex items-center justify-center border-2 border-gray-600">
            <div className="text-lg">🔒</div>
          </div>
        )}

        {/* 惑星の輪（リング） */}
        {planet.id % 2 === 0 && (
          <div className="absolute inset-0 border-2 border-blue-300/20 rounded-full scale-150"></div>
        )}
      </motion.div>

      {/* 惑星名ラベル */}
      <motion.div
       className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-blue-400/30 z-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: isSelected ? 1 : 0.9, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="text-xs font-medium text-blue-100 text-center whitespace-nowrap">{planet.title}</div>
      </motion.div>
    </motion.div>
  )
}

// パス（宇宙航路）コンポーネント
function PlanetPath({ from, to, isActive }: { from: any; to: any; isActive: boolean }) {
  const pathLength = Math.sqrt(
    Math.pow(to.position.x - from.position.x, 2) + Math.pow(to.position.y - from.position.y, 2),
  )

  const angle = Math.atan2(to.position.y - from.position.y, to.position.x - from.position.x) * (180 / Math.PI)

  return (
    <div
      className="absolute"
      style={{
        left: `${from.position.x}%`,
        top: `${from.position.y}%`,
        width: `${pathLength}%`,
        height: "4px",
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
      }}
    >
      <motion.div
        className={`h-full rounded-full ${
          isActive ? "bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 shadow-lg" : "bg-gray-600/50"
        }`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0.3 }}
        transition={{ duration: 1, delay: 0.5 }}
      />

      {/* エネルギー粒子エフェクト */}
      {isActive && (
        <motion.div
          className="absolute top-1/2 w-2 h-2 bg-cyan-300 rounded-full shadow-lg"
          animate={{ x: ["0%", "100%"] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        />
      )}
    </div>
  )
}

// 司令官の導入シーケンス
function CommanderIntroSequence({
  onComplete,
  shuttle,
}: {
  onComplete: () => void
  shuttle?: any | null
}) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [showContinue, setShowContinue] = useState(false)

  const introSteps = [
    {
      text: `こんにちは！私は${COMMANDER.name}です。`,
      delay: 1000,
    },
    {
      text: "素敵なパッションシャトルだね！それに向かって、できるクエストから取り組んでみよう！",
      delay: 1500,
    },
    {
      text: "この美しい星系には5つの惑星があるよ。それぞれの惑星であなたを待つクエストを完了し、宇宙の謎を解き明かして！",
      delay: 2000,
    },
    {
      text: "そしたらパッションシャトルのエンジンを始動して、最初の惑星へ向かおう。きっと素晴らしい発見が待ってるよ！",
      delay: 1500,
    },
  ]

  const currentIntro = introSteps[currentStep]

  const handleContinue = () => {
    if (currentStep < introSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setIsTyping(true)
      setShowContinue(false)
    } else {
      onComplete()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-indigo-900/95 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-400/30 max-w-2xl w-full overflow-hidden"
      >
        {/* 司令官セクション */}
        <div className="p-8">
          <div className="flex items-start space-x-6">
            {/* 司令官アバター */}
            <motion.div
              className={`w-20 h-20 bg-gradient-to-br ${COMMANDER.avatar} rounded-full flex items-center justify-center text-3xl shadow-lg border-4 border-blue-300/30`}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 30px rgba(59, 130, 246, 0.5)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              {COMMANDER.emoji}
            </motion.div>

            {/* 対話エリア */}
            <div className="flex-1">
              <div className="mb-4">
                <h3 className="text-lg font-bold text-blue-100 mb-2">{COMMANDER.name}</h3>
                <div className="bg-gradient-to-r from-blue-900/60 to-indigo-900/60 rounded-2xl p-4 border border-blue-400/30 min-h-[120px] flex items-center">
                  <div className="text-blue-100 leading-relaxed">
                    {isTyping ? (
                      <TypewriterText
                        text={currentIntro.text}
                        speed={20}
                        onComplete={() => {
                          setIsTyping(false)
                          setTimeout(() => setShowContinue(true), 500)
                        }}
                      />
                    ) : (
                      currentIntro.text
                    )}
                  </div>
                </div>
              </div>

              {/* 続行ボタン */}
              <AnimatePresence>
                {showContinue && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-right">
                    <motion.button
                      onClick={handleContinue}
                      className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-full text-white font-medium flex items-center ml-auto shadow-lg"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {currentStep < introSteps.length - 1 ? (
                        <>
                          続ける
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          宇宙探索開始！
                          <Rocket className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* パッションシャトル演出 */}
        {currentStep >= 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="px-8 pb-8">
            <div className="bg-gradient-to-r from-purple-900/60 to-indigo-900/60 rounded-2xl p-4 border border-purple-400/30">
              <div className="flex items-center">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                  className="text-3xl mr-4"
                >
                  🚀
                </motion.div>
                <div>
                  <h4 className="text-blue-100 font-bold">
                    {shuttle?.title || ""}
                  </h4>
                  <p className="text-purple-300 text-sm">パッションシャトル準備完了</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs">エンジン稼働中</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 進行状況インジケーター */}
        <div className="px-8 pb-6">
          <div className="flex items-center space-x-2">
            {introSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  index <= currentStep ? "bg-blue-400" : "bg-gray-600"
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function PlanetMapPage() {
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const [username, setUsername] = useState<string>("")
  const [planets, setPlanets] = useState<any[]>([])
  const [direction, setDirection] = useState<any | null>(null)
  const [selectedPlanet, setSelectedPlanet] = useState<number | null>(null)
  const [showExplorationLog, setShowExplorationLog] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const toggleSidebar = () => setSidebarOpen((o) => !o)
  const [funRating, setFunRating] = useState<Record<number, number>>({})
  const [confidenceRating, setConfidenceRating] = useState<Record<number, number>>({})
  const [passionShuttle, setPassionShuttle] = useState<any | null>(null)

  const completedPlanets = planets.filter((p) => p.completed).length
  const totalPlanets = planets.length
  const explorationProgress = totalPlanets ? (completedPlanets / totalPlanets) * 100 : 0
  const currentPlanet = planets.find((p) => p.current)
  const remainingPlanets = totalPlanets - completedPlanets
  const energy = userProfile?.xp || 0
  const level = userProfile?.level || 1

  useEffect(() => {
    if (!user) return

    setUsername(userProfile?.display_name || "宇宙飛行士")

    const load = async () => {
      try {
        const [dir, qs, shuttle] = await Promise.all([
          getSelectedQuestDirection(user.id),
          getUserQuests(user.id),
          getSelectedPassionShuttle(user.id),
        ])
        setPassionShuttle(shuttle)
        setDirection(dir)
        const mapped = qs.map((q, idx) => ({
          ...q,
          bgColor: q.color || "from-blue-600 to-cyan-700",
          glowColor: "rgba(59, 130, 246, 0.4)",
          position: POSITIONS[idx % POSITIONS.length],
        }))
        setPlanets(mapped)

        const initialFunRating: Record<number, number> = {}
        const initialConfidenceRating: Record<number, number> = {}
        mapped.forEach((p) => {
          initialFunRating[p.id] = p.funRating || 0
          if (p.confidenceRating !== undefined) initialConfidenceRating[p.id] = p.confidenceRating
        })
        setFunRating(initialFunRating)
        setConfidenceRating(initialConfidenceRating)

        const cur = mapped.find((p) => p.current)
        if (cur) setSelectedPlanet(cur.id)
      } catch (err) {
        console.error("Error loading quests", err)
      }
    }

    load()
  }, [user, userProfile])

  const handleFunRatingChange = (planetId: number, value: number) => {
    setFunRating((prev) => ({
      ...prev,
      [planetId]: value,
    }))
  }

  const handleConfidenceRatingChange = (planetId: number, value: number) => {
    setConfidenceRating((prev) => ({
      ...prev,
      [planetId]: value,
    }))
  }

  const getPlanetStatus = (planet: any) => {
    if (planet.completed) return "completed"
    if (planet.current) return "current"
    if (planet.id <= completedPlanets + 2) return "available"
    return "locked"
  }
  const handleWarpToPlanet = (planetId: number) => {
    const planet = planets.find((p) => p.id === planetId)
    if (planet?.current) {
      router.push(`/planet-exploration/${planetId}`)
    }
  }

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-blue-100 overflow-hidden">
      {/* 司令官の導入シーケンス */}
      <AnimatePresence>
        {showIntro && (
          <CommanderIntroSequence onComplete={handleIntroComplete} shuttle={passionShuttle} />
        )}
      </AnimatePresence>

      {/* サイドバー - 宇宙ステーション */}
      <motion.div
        className="fixed top-0 bottom-0 w-64 bg-gray-900/80 backdrop-blur-xl border-r border-blue-400/30 z-10 shadow-2xl overflow-y-auto"
        initial={false}
        animate={{ x: sidebarOpen ? 0 : -256 }}
        transition={{ duration: 0.3 }}
      >
        {/* ヘッダー */}
        <div className="p-4 relative">
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700/70 p-1 rounded-r-lg border border-blue-400/30"
          >
            <ChevronDown className="w-4 h-4 rotate-90 text-blue-300" />
          </button>
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 flex items-center p-4 rounded-2xl shadow-lg border border-blue-400/30">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-10 h-10 bg-white flex items-center justify-center mr-3 rounded-xl shadow-inner"
            >
              <span className="text-2xl">🛰️</span>
            </motion.div>
            <div>
              <span className="text-white font-bold text-lg tracking-wide">宇宙ステーション</span>
              <p className="text-blue-100 text-xs">優しい2D惑星マップ</p>
            </div>
          </div>
        </div>

        {/* 探索統計 */}
        <div className="px-6 mb-6">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 border border-blue-400/30 shadow-sm">
            <h3 className="text-blue-100 font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2 text-cyan-400" />
              宇宙探索進捗
            </h3>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-blue-200">星系探索率</span>
                  <span className="text-cyan-400 font-bold">{explorationProgress.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${explorationProgress}%` }}
                    transition={{ duration: 2, delay: 0.5 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400">{completedPlanets}</div>
                  <div className="text-xs text-blue-300">探索完了</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-400">{remainingPlanets}</div>
                  <div className="text-xs text-blue-300">利用可能</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 現在のミッション */}
        {currentPlanet && (
          <div className="px-6 mb-6">
            <div className="bg-gradient-to-br from-orange-900/60 to-red-900/60 rounded-2xl p-4 border border-orange-400/30">
              <h3 className="text-blue-100 font-semibold mb-3 flex items-center">
                <Rocket className="w-5 h-5 mr-2 text-orange-400" />
                アクティブミッション
              </h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{PLANET_EMOJI}</div>
                  <div>
                    <div className="font-medium text-blue-100 text-sm">{currentPlanet.title}</div>
                  </div>
                </div>
                <motion.button
                  onClick={() => handleWarpToPlanet(currentPlanet.id)}
                  className="w-full flex items-center justify-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl text-white text-sm font-medium shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  惑星を探索する
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* ナビゲーション */}
        <div className="px-6 mb-6">
          <h3 className="text-blue-300 text-sm font-medium mb-3 uppercase tracking-wide">ワープゲート</h3>
          <div className="space-y-2">
            <motion.div
              className="flex items-center p-3 rounded-xl text-blue-200 hover:bg-blue-800/30 hover:text-blue-100 transition-all duration-300 border border-transparent hover:border-blue-400/30 cursor-pointer"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/dashboard")}
            >
              <div className="bg-gradient-to-br from-orange-500 to-yellow-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Home className="w-5 h-5 text-white" />
              </div>
              <span className="font-medium">司令室</span>
            </motion.div>

            <motion.div
              className="flex items-center p-3 rounded-xl text-blue-200 hover:bg-blue-800/30 hover:text-blue-100 transition-all duration-300 border border-transparent hover:border-blue-400/30 cursor-pointer"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/ai-chat")}
            >
              <div className="bg-gradient-to-br from-purple-500 to-indigo-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span>AI司令部</span>
            </motion.div>

            <motion.div
              className="flex items-center p-3 rounded-xl text-blue-200 hover:bg-blue-800/30 hover:text-blue-100 transition-all duration-300 border border-transparent hover:border-blue-400/30 cursor-pointer"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => router.push("/quest-setup/quests")}
            >
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span>マップ変更</span>
            </motion.div>

            <motion.div
              className="flex items-center p-3 rounded-xl text-blue-200 hover:bg-blue-800/30 hover:text-blue-100 transition-all duration-300 border border-transparent hover:border-blue-400/30 cursor-pointer"
              whileHover={{ x: 5, transition: { duration: 0.2 } }}
              onClick={() => setShowExplorationLog(true)}
            >
              <div className="bg-gradient-to-br from-cyan-500 to-blue-600 w-10 h-10 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <Satellite className="w-5 h-5 text-white" />
              </div>
              <span>探索ログ</span>
            </motion.div>
          </div>
        </div>

        {/* ユーザープロファイル */}
        <div className="sticky bottom-0 left-0 right-0 p-6 z-10 bg-transparent">
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl p-4 flex items-center border border-blue-400/30">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold">{username.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-100">{username}</div>
              <div className="text-xs text-blue-300 flex items-center">
                <Zap className="w-3 h-3 mr-1 text-yellow-400" />
                レベル {level} 宇宙飛行士
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-blue-300" />
          </div>
        </div>
      </motion.div>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-1/2 left-0 -translate-y-1/2 bg-gray-800/70 hover:bg-gray-700/70 p-2 rounded-r-lg border border-blue-400/30 z-20"
        >
          <ChevronDown className="w-4 h-4 -rotate-90 text-blue-300" />
        </button>
      )}

   {/* メイン2D宇宙マップエリア */}
   <div className="flex-1 relative">
        {/* ヘッダー */}
        <motion.div
          className="absolute top-0 z-20 p-4 transition-all"
          style={{ left: sidebarOpen ? "16rem" : 0, right: 0 }}
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center justify-between">
            <div className="bg-gray-900/80 backdrop-blur-xl text-blue-100 px-3 py-2 rounded-2xl shadow-lg border border-blue-400/30 flex items-center text-sm">
              <span className="mr-1">🌌</span>
              <span className="font-bold">{direction?.title || "クエストマップ"}</span>
              <span className="ml-1">🎨</span>
            </div>

            <div className="flex items-center space-x-2 text-xs">
              <div className="bg-gray-900/80 backdrop-blur-xl px-3 py-1 rounded-xl border border-blue-400/30 flex items-center">
                <Flame className="w-4 h-4 text-orange-400 mr-1" />
                <span className="text-blue-100 font-bold">{energy}</span>
              </div>
              <div className="bg-gray-900/80 backdrop-blur-xl px-3 py-1 rounded-xl border border-blue-400/30 flex items-center">
                <Diamond className="w-4 h-4 text-cyan-400 mr-1" />
                <span className="text-blue-100 font-bold">{completedPlanets}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2D宇宙背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          {/* 星々 */}
          <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-32 left-1/3 w-1 h-1 bg-cyan-200 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-1/4 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 right-1/3 w-1 h-1 bg-cyan-200 rounded-full animate-pulse"></div>

          {/* 星雲 */}
          <div className="absolute top-16 right-16 w-32 h-20 bg-purple-500/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
        </div>

        {/* 2D惑星マップ */}
        <div className="relative w-full h-full">
          {/* 宇宙航路（パス） */}
          {planets.map((planet, index) => {
            if (index === 0) return null
            const prevPlanet = planets[index - 1]
            const isPathActive = prevPlanet.completed

            return <PlanetPath key={`path-${planet.id}`} from={prevPlanet} to={planet} isActive={isPathActive} />
          })}

          {/* 惑星 */}
          {planets.map((planet) => (
            <Planet2D
              key={planet.id}
              planet={planet}
              isSelected={selectedPlanet === planet.id}
              onClick={() => {
                const status = getPlanetStatus(planet)
                if (status !== "locked") {
                  setSelectedPlanet(selectedPlanet === planet.id ? null : planet.id)
                }
              }}
              status={getPlanetStatus(planet)}
            />
          ))}
        </div>
      </div>

      {/* 惑星詳細パネル */}
      <AnimatePresence>
        {selectedPlanet && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-0 bottom-0 w-96 bg-gray-900/90 backdrop-blur-xl border-l border-blue-400/30 z-30 overflow-y-auto"
          >
            {(() => {
              const planet = planets.find((p) => p.id === selectedPlanet)
              if (!planet) return null

              const status = getPlanetStatus(planet)

              return (
                <div className="p-6">
                  {/* ヘッダー */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${planet.bgColor} flex items-center justify-center mr-4 text-2xl shadow-lg border-2 border-blue-300/30`}
                      >
                        {status === "completed" ? <CheckCircle className="w-8 h-8 text-green-400" /> : PLANET_EMOJI}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-blue-100">{planet.title}</h3>
                        <div className="flex items-center mt-1">
                          {status === "current" && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded-full border border-yellow-400/30">
                              探索中
                            </span>
                          )}
                          {status === "completed" && (
                            <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full border border-green-400/30">
                              探索完了
                            </span>
                          )}
                          {status === "available" && (
                            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full border border-blue-400/30">
                              探索可能
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedPlanet(null)}
                      className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-700/50 border border-blue-400/30"
                    >
                      <X className="w-4 h-4 text-blue-300" />
                    </button>
                  </div>

                  {/* 惑星情報 */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-blue-100 mb-2">惑星概要</h4>
                      <p className="text-blue-200 text-sm leading-relaxed">{planet.description}</p>
                    </div>

                    {/* 探索評価 */}
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm text-blue-200 flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1 fill-yellow-400" />
                            探索の楽しさ
                          </label>
                          <span className="text-yellow-400 font-bold">{funRating[planet.id]}%</span>
                        </div>
                        <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${funRating[planet.id]}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                          />
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={funRating[planet.id]}
                            onChange={(e) => handleFunRatingChange(planet.id, Number.parseInt(e.target.value))}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={status === "locked"}
                          />
                        </div>
                      </div>

                      {status === "current" && (
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-sm text-blue-200 flex items-center">
                              <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                              成功への自信
                            </label>
                            <span className="text-green-400 font-bold">{confidenceRating[planet.id]}%</span>
                          </div>
                          <div className="relative h-2 bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${confidenceRating[planet.id]}%` }}
                              transition={{ duration: 1, delay: 0.6 }}
                            />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={confidenceRating[planet.id]}
                              onChange={(e) => handleConfidenceRatingChange(planet.id, Number.parseInt(e.target.value))}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 探索活動 */}
                    <div>
                      <h4 className="font-semibold text-blue-100 mb-3">探索活動</h4>
                      <ul className="space-y-2 text-blue-200 text-sm">
                        {planet.actions.map((action, i) => (
                          <li key={i} className="flex items-start">
                            <span className="text-cyan-400 mr-2 mt-1">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* 期待される発見 */}
                    <div>
                      <h4 className="font-semibold text-blue-100 mb-2">期待される発見</h4>
                      <p className="text-blue-200 text-sm">{planet.outcome}</p>
                    </div>

                    {/* アクションボタン */}
                    <div className="pt-4 border-t border-gray-700">
                      {status === "current" && (
                        <motion.button
                          onClick={() => handleWarpToPlanet(planet.id)}
                          className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-2xl text-white font-medium shadow-lg"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Rocket className="w-5 h-5 mr-2" />
                          この惑星を探索する
                        </motion.button>
                      )}

                      {status === "available" && !planet.current && (
                        <div className="bg-blue-900/30 border border-blue-500/30 rounded-2xl p-4 text-blue-300 text-sm text-center">
                          この惑星は探索準備中です。前の惑星を完了すると利用可能になります。
                        </div>
                      )}

                      {status === "completed" && (
                        <div className="bg-green-900/30 border border-green-500/30 rounded-2xl p-4 text-green-300 text-sm text-center flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                          この惑星の探索は完了しています！
                        </div>
                      )}

                      {status === "locked" && (
                        <div className="bg-gray-800/50 border border-gray-600/30 rounded-2xl p-4 text-gray-400 text-sm text-center">
                          🔒 この惑星はまだ発見されていません
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 探索ログモーダル */}
      <AnimatePresence>
        {showExplorationLog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowExplorationLog(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gray-900/95 backdrop-blur-xl rounded-3xl p-8 max-w-2xl w-full border border-blue-400/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-4">📡</div>
                <h2 className="text-2xl font-bold text-blue-100 mb-2">宇宙探索ログ</h2>
                <p className="text-blue-200">あなたの星系探索の記録</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {planets
                  .filter((planet) => planet.completed)
                  .map((planet, index) => (
                    <motion.div
                      key={planet.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-blue-900/50 to-indigo-900/50 rounded-2xl border border-blue-400/30"
                    >
                      <div className="flex items-center mb-2">
                        <div className="text-lg mr-2">{PLANET_EMOJI}</div>
                        <div className="font-medium text-blue-100">{planet.title}</div>
                        <div className="ml-auto text-green-400">
                          <CheckCircle className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="text-sm text-blue-200">{planet.description}</div>
                      <div className="text-xs text-blue-300 mt-2 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        探索完了 - 楽しさ: {planet.funRating}%
                      </div>
                    </motion.div>
                  ))}

                {planets.filter((planet) => planet.completed).length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">🌌</div>
                    <p className="text-blue-300">まだ探索完了した惑星がありません</p>
                    <p className="text-blue-400 text-sm">新しい惑星を探索してログを作成しましょう</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowExplorationLog(false)}
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 rounded-full text-white font-medium"
                >
                  閉じる
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
