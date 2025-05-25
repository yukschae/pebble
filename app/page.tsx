"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Rocket, ChevronRight, Sparkles } from "lucide-react"
import { SignInForm } from "@/components/auth/sign-in-form"
import { SignUpForm } from "@/components/auth/sign-up-form"
import { useAuthContext } from "@/lib/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  const router = useRouter()
  const { user, loading, signOut } = useAuthContext()
  const [showStars, setShowStars] = useState(false)

  useEffect(() => {
    setShowStars(true)
    console.log("Landing page - Auth state:", { user: !!user, loading })

    // ユーザーが既にログインしている場合はダッシュボードにリダイレクト
    if (!loading && user) {
      console.log("Redirecting to dashboard - user is logged in")
      router.push("/dashboard")
    }
  }, [user, loading, router])

  

  // 強制ログアウト機能を追加
  const handleForceSignOut = async () => {
    console.log("Force sign out requested")
    try {
      await signOut()
      console.log("Force sign out successful")
      window.location.reload()
    } catch (error) {
      console.error("Force sign out failed:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-950 to-purple-950 text-gray-100">
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

      <div className="container mx-auto px-4 py-12 flex flex-col min-h-screen">
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-12 py-12">
          {/* Left side - App description */}
          <motion.div
            className="w-full md:w-1/2 max-w-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center p-3 rounded-xl shadow-lg inline-block mb-6">
                <div className="w-8 h-8 bg-white flex items-center justify-center mr-2 rounded-lg shadow-inner">
                  <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-transparent bg-clip-text font-bold">
                    L
                  </span>
                </div>
                <span className="text-white font-bold text-lg tracking-wide">LimitFree</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-500 to-indigo-500 text-transparent bg-clip-text leading-tight">
                心から幸せな未来を共に創る、探究型キャリア教育アプリ
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                あなたの情熱と才能を宇宙に打ち上げ、未知の可能性を探索する旅に出かけましょう。
                LimitFreeは、ゲーム感覚でキャリア探究を楽しく、効果的に進めるための革新的なプラットフォームです。
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-2 mr-4 flex-shrink-0">
                  <Rocket className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">パッションシャトル</h3>
                  <p className="text-gray-300">
                    あなたの興味と才能を組み合わせた、独自のキャリアパスを探索します。AIが分析結果に基づいて、創造的なキャリアコンセプトを提案します。
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-full p-2 mr-4 flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">パーソナル分析</h3>
                  <p className="text-gray-300">
                    RIASECタイプやOCEANモデルに基づく、あなたの強みと可能性の発見。科学的な分析に基づいて、自己理解を深めます。
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-full p-2 mr-4 flex-shrink-0">
                  <ChevronRight className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">クエストシステム</h3>
                  <p className="text-gray-300">
                    ゲーム感覚で実践的なスキルを身につけるための段階的なミッション。あなたのパッションシャトルに合わせたクエストで、実践的な経験を積みます。
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right side - Auth forms */}
          <motion.div
            className="w-full md:w-1/2 max-w-md"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gray-900/80 backdrop-blur-sm rounded-xl border border-gray-700 shadow-xl p-8">
              <Tabs defaultValue="sign-in" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="sign-in">ログイン</TabsTrigger>
                  <TabsTrigger value="sign-up">アカウント作成</TabsTrigger>
                </TabsList>
                <TabsContent value="sign-in">
                  <SignInForm />
                </TabsContent>
                <TabsContent value="sign-up">
                  <SignUpForm />
                </TabsContent>
              </Tabs>
            </div>
          </motion.div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400 mb-2">プレビュー用デモモード</p>
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="border-white/10">
            デモモードでダッシュボードを表示
          </Button>

          {/* 強制ログアウトボタン */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleForceSignOut}
              className="border-red-500/30 text-red-400 hover:bg-red-900/20 text-xs"
            >
              ログイン状態をリセット
            </Button>
            <p className="text-xs text-gray-500 mt-1">ログインに問題がある場合はこちらをクリック</p>
          </div>
        </div>

        <footer className="py-6 text-center text-gray-400 text-sm">
          <p>© 2025 LimitFree. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}
