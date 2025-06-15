/*  AI Chat page — simplified, no demo-mode  */
"use client"
import { useState, useRef, useEffect, FormEvent, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import {
  Home, Award, MessageCircle, MoreHorizontal, ChevronDown, Send,
  Sparkles, Flame, Diamond, ChevronLeft, AlertCircle,
} from "lucide-react"
import { motion } from "framer-motion"
import { useChat } from "@ai-sdk/react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"
import { useAuthContext, getSupabaseClient, getChatHistory } from "@/lib/supabase"

export default function AIChat() {
  /* ── auth -------------------------------------------------------- */
  const { user, loading } = useAuthContext()
  const router             = useRouter()
  const [token, setToken]   = useState<string | null>(null)
  const [historyLoaded, setHistoryLoaded] = useState(false)

  /* fetch the JWT once */
  useEffect(() => {
    if (loading) return
    getSupabaseClient().auth
      .getSession()
      .then(({ data }) => setToken(data.session?.access_token ?? null))
  }, [loading])

  /* ── chat hook (called on every render) -------------------------- */
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error: chatErr,
    reload,
    setMessages,
  } = useChat({
    api: "/api/chat",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    onResponse: (r) => { if (!r.ok) console.error("API error:", r.status) },
  })

  /* ── local ui state ---------------------------------------------- */
  const [uiErr, setUiErr] = useState<string | null>(null)
  const [isTyping, setTyping] = useState(false)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }) },
    [messages, isTyping])

  useEffect(() => {
    if (chatErr) setUiErr(`AIアシスタントとの通信に問題が発生しました: ${chatErr.message}`)
  }, [chatErr])

    // fetch existing chat history once the token is available
    useEffect(() => {
      if (!token || !user || historyLoaded) return
      getChatHistory(user.id, token)
        .then((msgs) => setMessages(msgs))
        .catch((err) => console.error("[ai-chat] history fetch error:", err))
        .finally(() => setHistoryLoaded(true))
    }, [token, user, historyLoaded, setMessages])
  
  /* helpers */
  const username = user?.email?.split("@")[0] ?? "ゲスト"
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim()) return
    setUiErr(null)
    handleSubmit(e)
    setTyping(true)
    setTimeout(() => setTyping(false), 900)
  }
  const sendSuggestion = (s: string) =>
    handleInputChange({ target: { value: s } } as ChangeEvent<HTMLInputElement>)

  /* ── RENDER ------------------------------------------------------ */
  if (loading || !token || !historyLoaded)
    return (
      <div className="flex h-screen items-center justify-center text-white">
        初期化中…
      </div>
    )
  /* ── render ─────────────────────────────────────────────────────── */
  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
      {/* Sidebar  ---------------------------------------------------- */}
      <motion.aside
        className="w-64 bg-gray-900/60 backdrop-blur-xl border-r border-white/10 z-10 shadow-2xl"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
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
        {/* Nav items */}
        {[
          { icon: Home, label: "ダッシュボード", path: "/dashboard" },
          { icon: Award, label: "クエスト", path: "/quests" },
          { icon: MessageCircle, label: "AIとチャット", path: "" },
          { icon: MoreHorizontal, label: "その他", path: "" },
        ].map(({ icon: Icon, label, path }) => (
          <motion.div
            key={label}
            className={cn(
              "mx-4 mb-2 rounded-xl p-3 flex items-center transition-all duration-300",
              label === "AIとチャット"
                ? "bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30"
                : "hover:bg-white/5 text-gray-400 border border-transparent hover:border-white/10",
            )}
            whileHover={{ x: 5 }}
            onClick={() => path && router.push(path)}
          >
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-3 bg-gradient-to-br from-gray-700 to-gray-900 shadow-lg shadow-gray-900/30 border border-gray-700">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <span>{label}</span>
          </motion.div>
        ))}
        {/* Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="bg-white/5 rounded-xl p-3 flex items-center border border-white/10">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mr-3">
              <span className="text-white font-bold">{username[0]}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{username}</div>
              <div className="text-xs text-gray-400">レベル 5</div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      </motion.aside>

      {/* Main column -------------------------------------------------- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <motion.header
          className="p-4 border-b border-white/10 bg-gray-900/60 backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                className="mr-4 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10"
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
            <div className="flex space-x-4">
              {[{ Icon: Flame, val: 5, bg: "from-amber-500 to-orange-600" },
                { Icon: Diamond, val: 0, bg: "from-blue-400 to-cyan-500" }].map(
                ({ Icon, val, bg }) => (
                  <motion.div
                    key={val}
                    className={`flex items-center bg-gradient-to-r ${bg} px-3 py-1 rounded-full shadow-lg border border-white/10`}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className="w-4 h-4 text-white mr-1" />
                    <span className="text-white text-sm font-bold">{val}</span>
                  </motion.div>
                ),
              )}
            </div>
          </div>
        </motion.header>

        {/* Chat feed */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-5xl mx-auto space-y-6">
            {uiErr && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center text-red-200">
                <AlertCircle className="w-5 h-5 mr-2" />
                <div className="flex-1">{uiErr}</div>
                {messages.length > 0 && (
                  <button
                    onClick={() => reload()} 
                    className="ml-4 px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded-md text-sm"
                  >
                    再試行
                  </button>
                )}
              </div>
            )}

            {messages.length === 0 ? (
              /* --- empty-state ------------------------------------------------ */
              <div className="flex flex-col items-center justify-center h-full py-20">
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
                  ].map((s) => (
                    <motion.button
                      key={s}
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-3 text-left text-sm text-gray-300"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => sendSuggestion(s)}
                    >
                      {s}
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              /* --- message list ---------------------------------------------- */
              <>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    {m.role === "assistant" && (
                      <div className="w-10 h-10 mr-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center border border-white/20" />
                    )}
                    <div
                      className={cn(
                        "max-w-3xl rounded-2xl p-4 shadow-md",
                        m.role === "user"
                          ? "bg-gradient-to-r from-blue-600/80 to-indigo-600/80 text-white border border-white/10"
                          : "bg-gray-800/80 backdrop-blur-sm border border-white/10 text-gray-100",
                      )}
                    >
                      {m.role === "assistant" ? (
                        <ReactMarkdown className="prose prose-invert">{m.content}</ReactMarkdown>
                      ) : (
                        m.content
                      )}
                    </div>
                    {m.role === "user" && (
                      <div className="w-10 h-10 ml-3 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center border border-white/20">
                        <span className="text-white font-bold">{username[0]}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="w-10 h-10 mr-3 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full flex items-center justify-center border border-white/20" />
                    <div className="bg-gray-800/80 backdrop-blur-sm border border-white/10 text-gray-100 rounded-2xl p-6 shadow-md max-w-3xl">
                      <div className="flex space-x-2">
                        {[0, 150, 300].map((d) => (
                          <div
                            key={d}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${d}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
            <div ref={endRef} />
          </div>
        </div>

        {/* Composer */}
        <motion.form
          id="chat-form"
          onSubmit={onSubmit}
          className="p-4 border-t border-white/10 bg-gray-900/60 backdrop-blur-xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="max-w-5xl mx-auto relative">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="AIアシスタントに質問してみましょう..."
              className="w-full bg-gray-800/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <motion.button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-full text-white shadow-lg shadow-blue-600/20 border border-white/10 disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
