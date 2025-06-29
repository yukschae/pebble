"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  type CommanderMessage,
  SPACE_COMMANDERS,
  generateCommanderMessages,
  getMessagePriorityColor,
  getMessageTypeIcon,
} from "@/lib/space-commander"

interface CommanderMessageBoardProps {
  userProfile: any
  dashboardData: any
  commanderId?: keyof typeof SPACE_COMMANDERS
}

export function CommanderMessageBoard({
  userProfile,
  dashboardData,
  commanderId = "nova",
}: CommanderMessageBoardProps) {
  const router = useRouter()
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null)
  const [readMessages, setReadMessages] = useState<Set<string>>(new Set())

  const commander = SPACE_COMMANDERS[commanderId]
  const messages = generateCommanderMessages(userProfile, dashboardData, commanderId)

  const handleMessageClick = (messageId: string) => {
    setExpandedMessage(expandedMessage === messageId ? null : messageId)
    setReadMessages((prev) => new Set([...prev, messageId]))
  }

  const handleActionClick = (message: CommanderMessage) => {
    if (message.actionButton?.route) {
      router.push(message.actionButton.route)
    }
  }

  const unreadCount = messages.filter((msg) => !readMessages.has(msg.id)).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 backdrop-blur-xl rounded-2xl shadow-2xl border border-cyan-500/30 overflow-hidden"
    >
      {/* ヘッダー */}
      <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-6 border-b border-cyan-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <motion.div
              className={`w-16 h-16 bg-gradient-to-br ${commander.avatar} rounded-xl flex items-center justify-center mr-4 text-2xl shadow-lg border border-white/20`}
              whileHover={{ scale: 1.05 }}
              animate={{
                boxShadow: [
                  "0 0 20px rgba(6, 182, 212, 0.3)",
                  "0 0 30px rgba(6, 182, 212, 0.5)",
                  "0 0 20px rgba(6, 182, 212, 0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            >
              {commander.emoji}
            </motion.div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center">
                {commander.name}
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  className="ml-2"
                >
                  📡
                </motion.div>
              </h3>
              <p className="text-cyan-300 text-sm">{commander.rank}</p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-xs text-gray-300">オンライン</span>
              </div>
            </div>
          </div>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
            >
              {unreadCount}
            </motion.div>
          )}
        </div>
      </div>

      {/* メッセージリスト */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        <AnimatePresence>
          {messages.map((message, index) => {
            const isExpanded = expandedMessage === message.id
            const isRead = readMessages.has(message.id)
            const priorityColor = getMessagePriorityColor(message.priority)
            const typeIcon = getMessageTypeIcon(message.type)

            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative cursor-pointer transition-all duration-300 ${
                  isExpanded ? "transform scale-[1.02]" : ""
                }`}
                onClick={() => handleMessageClick(message.id)}
              >
                <div
                  className={`p-4 rounded-xl border backdrop-blur-sm ${priorityColor} ${
                    isRead ? "opacity-75" : ""
                  } hover:scale-[1.01] transition-transform`}
                >
                  {/* メッセージヘッダー */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{typeIcon}</span>
                      <div>
                        <h4 className="font-semibold text-white text-sm">{message.title}</h4>
                        <p className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString("ja-JP", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {!isRead && <div className="w-2 h-2 bg-cyan-400 rounded-full mr-2 animate-pulse"></div>}
                      <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </div>
                  </div>

                  {/* メッセージ内容 */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 border-t border-white/10">
                          <p className="text-gray-300 text-sm leading-relaxed mb-4">{message.message}</p>

                          {message.actionButton && (
                            <motion.button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleActionClick(message)
                              }}
                              className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 rounded-lg text-white text-sm font-medium shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <span>{message.actionButton.text}</span>
                              <ChevronRight className="w-4 h-4 ml-1" />
                            </motion.button>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 司令官の吹き出し風デザイン */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute -left-2 top-4 w-4 h-4 bg-gradient-to-br from-cyan-500/30 to-blue-600/30 rotate-45 border-l border-t border-cyan-500/50"
                  />
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {messages.length === 0 && (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📡</div>
            <p className="text-gray-400">現在、司令官からのメッセージはありません</p>
            <p className="text-gray-500 text-sm">新しい探索を開始すると、メッセージが届きます</p>
          </div>
        )}
      </div>

      {/* フッター */}
      <div className="bg-gradient-to-r from-gray-800/50 to-gray-900/50 p-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>宇宙ステーション通信システム</span>
          <div className="flex items-center">
            <div className="w-1 h-1 bg-green-400 rounded-full mr-1 animate-pulse"></div>
            <span>接続良好</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}