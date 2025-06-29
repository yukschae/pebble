"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface CommanderNamePromptProps {
  onSave: (name: string) => Promise<void>
  onClose?: () => void
}

export function CommanderNamePrompt({ onSave, onClose }: CommanderNamePromptProps) {
  const [name, setName] = useState("")
  const [saving, setSaving] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [typewriterText, setTypewriterText] = useState("")

  const message = "ようこそ、新しい宇宙飛行士よ。あなたのコールサインを教えてください。"

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
      setTimeout(() => setShowContent(true), 800)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!showContent) return
    setTypewriterText("")
    let index = 0
    const timer = setInterval(() => {
      if (index < message.length) {
        setTypewriterText(message.slice(0, index + 1))
        index++
      } else {
        clearInterval(timer)
      }
    }, 30)
    return () => clearInterval(timer)
  }, [showContent])

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    await onSave(name.trim())
    setSaving(false)
  }

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
            className="relative bg-gradient-to-br from-gray-800/95 to-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-cyan-500/30 max-w-lg w-full overflow-hidden"
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
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsVisible(false)
                    setTimeout(() => onClose?.(), 300)
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>
            <div className="p-8">
              <AnimatePresence mode="wait">
                {showContent && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                  >
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
                    <div className="space-y-4">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white"
                        placeholder="表示名を入力"
                      />
                      <button
                        onClick={handleSave}
                        disabled={saving || !name.trim()}
                        className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-xl text-white font-medium shadow-lg disabled:opacity-50"
                      >
                        保存
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}