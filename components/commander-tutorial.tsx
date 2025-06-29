"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronRight, X, Check, Rocket, Brain, Target, MessageCircle, Map, Sparkles } from "lucide-react"

interface TutorialStep {
  id: number
  title: string
  content: string
  icon: string
  highlight?: string
  action?: {
    text: string
    description: string
  }
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: "宇宙ステーションへようこそ！",
    content:
      "私は司令官ノヴァです。あなたの宇宙探索をサポートします。LimitFreeは、あなたの可能性を無限に広げる宇宙探索プラットフォームです。",
    icon: "👩‍✈️",
    highlight: "無限の可能性を探索",
  },
  {
    id: 2,
    title: "適性分析システム",
    content:
      "まずはRIASEC分析とOCEAN分析で、あなたの宇宙飛行士としての特性を把握しましょう。これにより、最適な探索ルートを提案できます。",
    icon: "🧠",
    highlight: "科学的な自己分析",
    action: {
      text: "分析を開始",
      description: "あなたの適性を詳しく調べます",
    },
  },
  {
    id: 3,
    title: "パッションシャトル設定",
    content: "あなた専用の探索シャトルを設定します。情熱と興味を推進力に変えて、宇宙を駆け抜けましょう！",
    icon: "🚀",
    highlight: "個人専用シャトル",
    action: {
      text: "シャトル設定",
      description: "あなたの情熱を形にします",
    },
  },
  {
    id: 4,
    title: "惑星探索クエスト",
    content: "様々な惑星でクエストを実行し、新しいスキルや知識を獲得します。各惑星には独自の挑戦が待っています。",
    icon: "🌍",
    highlight: "実践的な成長",
    action: {
      text: "惑星マップ",
      description: "探索可能な惑星を確認",
    },
  },
  {
    id: 5,
    title: "AI司令部との連携",
    content: "困ったときはAI司令部にご相談ください。高度なAIがあなたの探索をリアルタイムでサポートします。",
    icon: "🤖",
    highlight: "24/7 AIサポート",
    action: {
      text: "AI司令部",
      description: "いつでも相談できます",
    },
  },
  {
    id: 6,
    title: "パッションシャトルへの",
    content:
      "探索を通じてレベルアップし、バッジを獲得しましょう。あなたの成長が可視化され、モチベーションを維持できます。",
    icon: "🏆",
    highlight: "継続的な成長",
    action: {
      text: "成長記録",
      description: "あなたの進歩を確認",
    },
  },
]

interface CommanderTutorialProps {
  onComplete: () => void
}

export function CommanderTutorial({ onComplete }: CommanderTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")
  const [showNextButton, setShowNextButton] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  const currentTutorial = tutorialSteps[currentStep]

  useEffect(() => {
    if (!showContent || !currentTutorial) return
    setTypewriterText("")
    setShowNextButton(false)
    let index = 0
    const text = currentTutorial.content
    const timer = setInterval(() => {
      if (index < text.length) {
        setTypewriterText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
        setTimeout(() => setShowNextButton(true), 500)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [currentTutorial, showContent])

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setShowContent(true), 800)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setShowContent(false)
      setTimeout(() => {
        setCurrentStep(currentStep + 1)
        setShowContent(true)
      }, 300)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem("limitfree_tutorial_completed", "true")
    }
    setIsVisible(false)
    setTimeout(onComplete, 500)
  }

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem("limitfree_tutorial_completed", "true")
    }
    setIsVisible(false)
    setTimeout(onComplete, 500)
  }

  const progress = ((currentStep + 1) / tutorialSteps.length) * 100

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.5, 1.5, 0.5] }}
                transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                style={{ top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%` }}
              />
            ))}
          </div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 max-w-4xl w-full max-h-[90vh] overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-cyan-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 text-2xl shadow-lg border border-white/20"
                    animate={{
                      boxShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.3)",
                        "0 0 30px rgba(6, 182, 212, 0.5)",
                        "0 0 20px rgba(6, 182, 212, 0.3)",
                      ],
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    👩‍✈️
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">司令官ノヴァ</h2>
                    <p className="text-cyan-300">宇宙ステーション司令官</p>
                    <div className="flex items-center mt-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-xs text-gray-300">オンライン</span>
                    </div>
                  </div>
                </div>
                <button onClick={handleSkip} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-300">チュートリアル進行状況</span>
                  <span className="text-sm text-cyan-400 font-bold">
                    {currentStep + 1} / {tutorialSteps.length}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>
            </div>
            <div className="p-8">
              <AnimatePresence mode="wait">
                {showContent && currentTutorial && (
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <motion.div
                        className="text-6xl mb-4"
                        animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        {currentTutorial.icon}
                      </motion.div>
                      <h3 className="text-2xl font-bold text-white mb-2">{currentTutorial.title}</h3>
                      {currentTutorial.highlight && (
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full border border-cyan-500/30">
                          <Sparkles className="w-4 h-4 text-cyan-400 mr-2" />
                          <span className="text-cyan-300 text-sm font-medium">{currentTutorial.highlight}</span>
                        </div>
                      )}
                    </div>
                    <div className="bg-gradient-to-br from-gray-700/50 to-gray-800/50 rounded-2xl p-6 border border-gray-600/30">
                      <div className="flex items-start">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 text-xl flex-shrink-0">
                          👩‍✈️
                        </div>
                        <div className="flex-1">
                          <div className="bg-white/10 rounded-2xl p-4 relative">
                            <p className="text-gray-200 leading-relaxed min-h-[60px]">
                              {typewriterText}
                              <motion.span
                                animate={{ opacity: [1, 0] }}
                                transition={{ duration: 0.8, repeat: Infinity }}
                                className="inline-block w-0.5 h-5 bg-cyan-400 ml-1"
                              />
                            </p>
                            <div className="absolute -left-2 top-4 w-4 h-4 bg-white/10 rotate-45"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {currentTutorial.action && showNextButton && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-xl p-4 border border-blue-500/30"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-white font-semibold">{currentTutorial.action.text}</h4>
                            <p className="text-gray-300 text-sm">{currentTutorial.action.description}</p>
                          </div>
                          <div className="flex items-center text-blue-400">
                            {currentStep === 1 && <Brain className="w-6 h-6" />}
                            {currentStep === 2 && <Rocket className="w-6 h-6" />}
                            {currentStep === 3 && <Map className="w-6 h-6" />}
                            {currentStep === 4 && <MessageCircle className="w-6 h-6" />}
                            {currentStep === 5 && <Target className="w-6 h-6" />}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-6 border-t border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="dontShowAgain"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <label htmlFor="dontShowAgain" className="ml-2 text-sm text-gray-300">
                    次回以降このチュートリアルを表示しない
                  </label>
                </div>
                <div className="flex items-center space-x-3">
                  <button onClick={handleSkip} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">
                    スキップ
                  </button>
                  <AnimatePresence>
                    {showNextButton && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleNext}
                        className="flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white font-medium shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {currentStep === tutorialSteps.length - 1 ? (
                          <>
                            <Check className="w-5 h-5 mr-2" />探索開始！
                          </>
                        ) : (
                          <>
                            次へ<ChevronRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
