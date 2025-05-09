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

// クエストデータ
const questsData = [
  {
    id: 1,
    title: "アートセラピーの基礎理解",
    completed: true,
    current: false,
    description: "アートセラピーとは何かを理解し、活動の土台を作る。",
    actions: [
      "書籍やオンライン資料を通じて「アートセラピー」の歴史や理論を調べる。",
      "メンタルケアや自己表現において、アートがどのような役割を果たすかを学ぶ。",
      "専門家や学校のカウンセラーにインタビューを申し込み、基礎知識や注意点を聞いてみる。",
    ],
    outcome: "アートセラピーに関するミニレポートやまとめスライド。",
    funRating: 45,
    icon: BookOpen,
    color: "from-gray-600 to-gray-800",
  },
  {
    id: 2,
    title: "対象とゴールの設定",
    completed: false,
    current: true,
    description: "どのような人をサポートしたいのか、そのためにどんな形のアートを活用したいのかを具体化する。",
    actions: [
      "「友人やクラスメイト向け」「地域の高齢者向け」「幼稚園児向け」など、支援したい層をイメージし、ニーズを考える。",
      "学校・地域・施設の協力を得られるか下調べし、アプローチ可能な場所を確認する。",
      "活用したいアートのジャンルを検討（絵画、粘土、音楽、演劇など）し、その理由や必要な準備をリストアップする。",
    ],
    outcome: "対象（ターゲット）とゴールを明文化した企画書の草案。",
    funRating: 70,
    confidenceRating: 80,
    icon: Target,
    color: "from-orange-500 to-amber-600",
  },
  {
    id: 3,
    title: "具体的アクティビティの設計",
    completed: false,
    current: false,
    description: "実際に行う活動内容をプログラム化する。",
    actions: [
      "1回あたりのセッション内容（所要時間、使用する道具、手順、テーマ）を組み立てる。",
      "安全面やプライバシー、個人情報保護など、注意すべき項目を洗い出す。",
      "参加者がストレスなく取り組めるように、難易度や手順をできるだけシンプルに調整する。",
      "必要な物品をリストアップし、予算や購入先を検討する。",
    ],
    outcome: "アクティビティの進行プラン（タイムテーブル、役割分担、使用道具リストなど）。",
    funRating: 60,
    icon: Lightbulb,
    color: "from-blue-500 to-indigo-600",
  },
  {
    id: 4,
    title: "実践（ワークショップまたは交流イベントの実施）",
    completed: false,
    current: false,
    description: "実際にアートを用いたセラピー活動を開催してみる。",
    actions: [
      "学校や地域施設、オンラインなど、可能な形式で開催日を設定し、告知・募集を行う。",
      "当日、アクティビティを進行し、参加者の様子を見ながら臨機応変に調整する。",
      "アンケート用紙や簡易チェックリストを準備し、活動後の感想・満足度や気づきを収集する。",
    ],
    outcome: "ワークショップやイベントの実施写真・動画、参加者アンケートやフィードバックの記録",
    funRating: 92,
    icon: Users,
    color: "from-red-500 to-orange-600",
  },
  {
    id: 5,
    title: "振り返りと発信",
    completed: false,
    current: false,
    description: "プロジェクト全体を振り返り、学びや成果をまとめる。さらに今後の発展につなげる。",
    actions: [
      "アンケート結果や参加者の声を分析し、「アートセラピー」にどのような効果・インパクトがあったか検証する。",
      "自分自身が感じた成長や課題を整理し、次のステップ（さらなる企画や進学・将来プランとのつながり）を考える。",
      "SNSや校内新聞などで活動報告を行い、周りに共有する。必要があれば参加者や協力者へお礼のメッセージを送る。",
    ],
    outcome: "活動レポート、事後分析資料、今後のプラン提案書",
    funRating: 65,
    icon: Sparkles,
    color: "from-purple-500 to-pink-600",
  },
]

export default function QuestsPage() {
  const router = useRouter()
  const [username] = useState("ユーダイ")
  const [showStars, setShowStars] = useState(false)
  const [selectedQuest, setSelectedQuest] = useState<number | null>(null)
  const [funRating, setFunRating] = useState<Record<number, number>>({})
  const [confidenceRating, setConfidenceRating] = useState<Record<number, number>>({})

  // 初期値を設定
  useEffect(() => {
    const initialFunRating: Record<number, number> = {}
    const initialConfidenceRating: Record<number, number> = {}

    questsData.forEach((quest) => {
      initialFunRating[quest.id] = quest.funRating || 0
      if (quest.confidenceRating) {
        initialConfidenceRating[quest.id] = quest.confidenceRating
      }
    })

    setFunRating(initialFunRating)
    setConfidenceRating(initialConfidenceRating)

    // 現在のクエストを自動選択
    const currentQuest = questsData.find((q) => q.current)
    if (currentQuest) {
      setSelectedQuest(currentQuest.id)
    }

    setShowStars(true)
  }, [])

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
              <span className="mr-2">🚀</span> パッションシャトル：「アート×人助け」 <span className="ml-2">🎨</span>
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
              アート（絵画、工作、音楽、演劇など）を使った表現活動を通じて、人々（友人・地域・福祉施設等）をサポートする「アートセラピー」を探究したい！具体的には、小規模なワークショップや作品展示、交流イベントなどを企画・実施し、参加者の心の健康や自己表現を促す。
            </p>

            <div className="flex flex-wrap gap-3">
              <span className="text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
                #アートセラピー
              </span>
              <span className="text-sm bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full border border-purple-500/30">
                #イベント企画
              </span>
              <span className="text-sm bg-pink-500/20 text-pink-300 px-3 py-1 rounded-full border border-pink-500/30">
                #メンタルケア
              </span>
              <span className="text-sm bg-green-500/20 text-green-300 px-3 py-1 rounded-full border border-green-500/30">
                #地域貢献
              </span>
              <span className="text-sm bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">
                #自己表現
              </span>
            </div>
          </motion.div>

          {/* Quest List */}
          <div className="grid grid-cols-1 gap-6 mb-10">
            {questsData.map((quest, index) => (
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
                        <quest.icon className="w-7 h-7 text-white" />
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
                            {quest.actions.map((action, i) => (
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
