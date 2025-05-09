/**
 * AIチャットページコンポーネント
 *
 * このファイルは、AIアシスタントとのチャット機能を提供するページを実装しています。
 * ユーザーはAIとチャットして、パッションシャトルやクエストに関するアドバイスを得ることができます。
 *
 * 主な機能：
 * - AIとのチャットインターフェース
 * - メッセージの送信と受信
 * - チャット履歴の表示
 * - サジェスション機能
 *
 * 使用している主要なライブラリ：
 * - React (useState, useEffect, useRef)
 * - Next.js (useRouter)
 * - Framer Motion (アニメーション)
 * - AI SDK (@ai-sdk/react)
 * - ReactMarkdown (マークダウン表示)
 *
 * データフロー：
 * 1. ユーザーがメッセージを入力
 * 2. メッセージをAPIに送信
 * 3. AIの応答を受信してストリーミング表示
 * 4. チャット履歴をデータベースに保存
 *
 * 関連ファイル：
 * - lib/supabase.ts (データベース操作)
 * - app/api/chat/route.ts (チャットAPI)
 */

"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Home,
  Award,
  MessageCircle,
  MoreHorizontal,
  ChevronDown,
  Send,
  Sparkles,
  Flame,
  Diamond,
  ChevronLeft,
  AlertCircle,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"
// 既存のインポートに追加
import { useAuth } from "@/lib/supabase"
import { getSupabaseClient } from "@/lib/supabase"

export default function AIChat() {
  const router = useRouter()
  const { user } = useAuth()
  const [username] = useState("ユーダイ")
  const [showStars, setShowStars] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI Chat integration with Claude
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatError,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      if (response.ok) {
        setIsTyping(true)
        setError(null)
        // Simulate typing effect
        setTimeout(() => setIsTyping(false), 1000)
      } else {
        setError(`エラー: APIリクエストが失敗しました (${response.status}: ${response.statusText})`)
        console.error("API Response Error:", response.status, response.statusText)
      }
    },
    onError: (err) => {
      console.error("Chat error:", err)
      setError(`AIアシスタントとの通信に問題が発生しました: ${err.message || "不明なエラー"}`)
    },
  })

  // チャット履歴を取得
  useEffect(() => {
    const fetchChatHistory = async () => {
      if (!user && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return

      try {
        const supabase = getSupabaseClient()
        const { data, error } = await supabase
          .from("chat_history")
          .select("*")
          .eq("user_id", user?.id || "demo-user-id")
          .order("created_at", { ascending: true })
          .limit(50)

        if (error) {
          console.error("Error fetching chat history:", error)
          return
        }

        if (data && data.length > 0) {
          // チャット履歴をフォーマット
          const formattedMessages = data.map((item) => ({
            id: item.id.toString(),
            content: item.message,
            role: item.role as "user" | "assistant",
          }))

          setMessages(formattedMessages)
        }
      } catch (err) {
        console.error("Error in fetchChatHistory:", err)
      }
    }

    fetchChatHistory()
  }, [user, setMessages])

  useEffect(() => {
    setShowStars(true)
  }, [])

  // エラーが発生した場合にエラーメッセージを表示
  useEffect(() => {
    if (chatError) {
      console.error("Chat error from state:", chatError)
      setError(`AIアシスタントとの通信に問題が発生しました: ${chatError.message || "不明なエラー"}`)
    }
  }, [chatError])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // フォーム送信ハンドラーをカスタマイズ
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input || !input.trim()) return

    setError(null)
    try {
      handleSubmit(e)
    } catch (err) {
      console.error("Form submission error:", err)
      setError(`メッセージの送信中にエラーが発生しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // サジェスションボタンのクリックハンドラー
  const handleSuggestionClick = (suggestion: string) => {
    try {
      // 入力値を設定
      const fakeEvent = { target: { value: suggestion } } as React.ChangeEvent<HTMLInputElement>
      handleInputChange(fakeEvent)

      // フォーム送信をトリガー
      setTimeout(() => {
        const form = document.getElementById("chat-form") as HTMLFormElement
        if (form) {
          form.requestSubmit()
        } else {
          console.error("Chat form element not found")
          setError("フォームが見つかりません。ページを再読み込みしてください。")
        }
      }, 100)
    } catch (err) {
      console.error("Suggestion click error:", err)
      setError(`サジェスションの処理中にエラーが発生しました: ${err instanceof Error ? err.message : "不明なエラー"}`)
    }
  }

  // リトライボタンのハンドラー
  const handleRetry = () => {
    setError(null)
    if (messages.length > 0) {
      reload()
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
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
            className="mb-2 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm rounded-xl p-3 flex items-center text-blue-400 border border-blue-500/30"
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
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
              <span className="text-white font-bold">ユ</span>
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
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.div
          className="p-4 border-b border-white/10 bg-gray-900/60 backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                className="mr-4 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push("/dashboard")}
              >
                <ChevronLeft className="w-5 h-5 text-gray-300" />
              </motion.button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                AIアシスタント
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div
                className="flex items-center bg-gradient-to-r from-amber-500 to-orange-600 px-3 py-1 rounded-full shadow-lg shadow-orange-600/30 border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Flame className="w-4 h-4 text-white mr-1" />
                <span className="text-white text-sm font-bold">5</span>
              </motion.div>
              <motion.div
                className="flex items-center bg-gradient-to-r from-blue-400 to-cyan-500 px-3 py-1 rounded-full shadow-lg shadow-blue-600/30 border border-white/10"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Diamond className="w-4 h-4 text-white mr-1" />
                <span className="text-white text-sm font-bold">0</span>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Chat area */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto">
            <div className="space-y-6">
              {/* エラーメッセージ表示 */}
              {error && (
                <motion.div
                  className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center text-red-200"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p>{error}</p>
                    {error.includes("API") && (
                      <p className="text-sm mt-2">
                        環境変数 ANTHROPIC_API_KEY が正しく設定されているか確認してください。
                      </p>
                    )}
                  </div>
                  {messages.length > 0 && (
                    <button
                      onClick={handleRetry}
                      className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-md text-sm transition-colors"
                    >
                      再試行
                    </button>
                  )}
                </motion.div>
              )}

              {messages.length === 0 ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full py-20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-xl shadow-teal-500/30 flex items-center justify-center border border-white/20 mb-6 relative">
                    {/* 顔の上部の光沢 */}
                    <div className="absolute top-0 left-0 w-full h-1/3 bg-teal-300/30 rounded-t-full" />

                    {/* 左目 - サイズを小さく */}
                    <div className="absolute top-1/3 left-1/4 w-1/5 h-1/5 bg-white rounded-full" />
                    <div className="absolute top-1/3 left-1/4 w-1/10 h-1/10 bg-gray-900 rounded-full ml-1 mt-1" />

                    {/* 右目 - サイズを小さく */}
                    <div className="absolute top-1/3 right-1/4 w-1/5 h-1/5 bg-white rounded-full" />
                    <div className="absolute top-1/3 right-1/4 w-1/10 h-1/10 bg-gray-900 rounded-full mr-1 mt-1" />

                    {/* 口 - 位置調整 */}
                    <div className="absolute bottom-1/4 left-1/3 w-1/3 h-1/12 bg-white rounded-full" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">AIアシスタント</h2>
                  <p className="text-gray-400 text-center max-w-md mb-8">
                    パッションシャトルに関するクエストのアイデアや、探究活動のヒントを聞いてみましょう。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-lg">
                    {[
                      "「アート x 人助け」のクエストを考えて",
                      "パッションシャトルのアイデアが欲しい",
                      "クエストの進め方を教えて",
                      "探究活動のヒントを教えて",
                    ].map((suggestion, i) => (
                      <motion.button
                        key={i}
                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-left text-sm text-gray-300 transition-colors"
                        whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      {message.role === "assistant" && (
                        <div className="w-10 h-10 mr-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center border border-white/20 flex-shrink-0 relative">
                          {/* 小さな目と口のキャラクター */}
                          <div className="absolute top-1/4 left-1/4 w-1/5 h-1/5 bg-white rounded-full"></div>
                          <div className="absolute top-1/4 right-1/4 w-1/5 h-1/5 bg-white rounded-full"></div>
                          <div className="absolute bottom-1/3 left-1/3 w-1/3 h-1/8 bg-white rounded-full"></div>
                        </div>
                      )}
                      <div
                        className={cn(
                          "max-w-3xl rounded-2xl p-4 shadow-md",
                          message.role === "user"
                            ? "bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white border border-white/10"
                            : "bg-gray-800/80 backdrop-blur-sm border border-white/10 text-gray-100",
                        )}
                      >
                        {message.role === "assistant" ? (
                          <div className="prose prose-invert max-w-none">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p>{message.content}</p>
                        )}
                      </div>
                      {message.role === "user" && (
                        <div className="w-10 h-10 ml-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 border border-white/20">
                          <span className="text-white font-bold">ユ</span>
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {isTyping && (
                    <motion.div
                      className="flex justify-start"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-10 h-10 mr-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full shadow-lg shadow-teal-500/30 flex items-center justify-center border border-white/20 flex-shrink-0 relative">
                        {/* 小さな目と口のキャラクター */}
                        <div className="absolute top-1/4 left-1/4 w-1/5 h-1/5 bg-white rounded-full"></div>
                        <div className="absolute top-1/4 right-1/4 w-1/5 h-1/5 bg-white rounded-full"></div>
                        <div className="absolute bottom-1/3 left-1/3 w-1/3 h-1/8 bg-white rounded-full"></div>
                      </div>
                      <div className="bg-gray-800/80 backdrop-blur-sm border border-white/10 text-gray-100 rounded-2xl p-6 shadow-md max-w-3xl">
                        <div className="flex space-x-2">
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>

        {/* Input area */}
        <motion.div
          className="p-4 border-t border-white/10 bg-gray-900/60 backdrop-blur-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="max-w-5xl mx-auto">
            <form id="chat-form" onSubmit={handleFormSubmit} className="relative">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="AIアシスタントに質問してみましょう..."
                className="w-full bg-gray-800/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <motion.button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full text-white shadow-lg shadow-blue-600/20 border border-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isLoading || !input || !input.trim()}
              >
                {isLoading ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
