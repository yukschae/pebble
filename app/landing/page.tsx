"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, AnimatePresence, useInView } from "framer-motion"
import { ChevronRight, Rocket, Star, Sparkles, Brain, Users, Award, BarChart3, Zap, ArrowRight } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LandingPage() {
  const router = useRouter()
  const [showStars, setShowStars] = useState(false)
  const { scrollY } = useScroll()
  const mainRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const heroInView = useInView(heroRef)

  // Parallax effects
  const y1 = useTransform(scrollY, [0, 1000], [0, -200])
  const y2 = useTransform(scrollY, [0, 1000], [0, -100])
  const opacity1 = useTransform(scrollY, [0, 300], [1, 0])
  const scale1 = useTransform(scrollY, [0, 300], [1, 0.9])

  // Features data
  const features = [
    {
      title: "パッションシャトル",
      description: "あなたの興味と才能を組み合わせて、独自のキャリアパスを探索しましょう。",
      icon: Rocket,
      color: "from-pink-500 to-rose-600",
    },
    {
      title: "クエストシステム",
      description: "ゲーム感覚で実践的なスキルを身につけるための段階的なミッション。",
      icon: Award,
      color: "from-blue-500 to-indigo-600",
    },
    {
      title: "AIアシスタント",
      description: "24時間いつでも質問に答え、あなたの探究をサポートする知的パートナー。",
      icon: Brain,
      color: "from-teal-500 to-emerald-600",
    },
    {
      title: "コミュニティ",
      description: "同じ興味を持つ仲間と繋がり、互いに刺激し合える環境。",
      icon: Users,
      color: "from-amber-500 to-orange-600",
    },
    {
      title: "パーソナル分析",
      description: "RIASECタイプやOCEANモデルに基づく、あなたの強みと可能性の発見。",
      icon: BarChart3,
      color: "from-purple-500 to-violet-600",
    },
    {
      title: "フローメーター",
      description: "没入感と充実感を測定し、あなたの「ゾーン」を見つけるツール。",
      icon: Zap,
      color: "from-cyan-500 to-blue-600",
    },
  ]

  useEffect(() => {
    setShowStars(true)
  }, [])

  const launchApp = () => {
    router.push("/dashboard")
  }

  return (
    <div ref={mainRef} className="min-h-screen overflow-x-hidden">
      {/* Stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <AnimatePresence>
          {showStars &&
            Array.from({ length: 150 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 star rounded-full"
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

      {/* Navbar */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 nav-gradient border-b border-primary/10"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center p-2 rounded-xl shadow-lg mr-3">
              <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg shadow-inner">
                <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-transparent bg-clip-text font-bold">
                  L
                </span>
              </div>
            </div>
            <span className="text-foreground font-bold text-xl tracking-wide">LimitFree</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              機能
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              概要
            </a>
            <a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">
              体験談
            </a>
            <ThemeToggle className="mr-4" />
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={launchApp}
            >
              打ち上げる
              <Rocket className="w-4 h-4 inline-block ml-1" />
            </motion.button>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <ThemeToggle />
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-300 border border-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={launchApp}
            >
              打ち上げる
              <Rocket className="w-4 h-4 inline-block ml-1" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={heroRef}>
        <motion.div className="absolute inset-0 z-0" style={{ y: y1, opacity: opacity1 }}>
          <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-indigo-900/50 dark:from-indigo-900/50 light:from-indigo-100/50 to-transparent" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-blue-500/20 via-indigo-500/10 to-purple-500/20 blur-3xl" />
        </motion.div>

        <motion.div className="container mx-auto px-6 pt-32 pb-20 text-center relative z-10" style={{ scale: scale1 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 text-transparent bg-clip-text text-lg font-medium px-4 py-1 rounded-full border border-blue-500/30 bg-blue-500/10">
              キャリア探究の新時代
            </span>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-500 to-indigo-500 text-transparent bg-clip-text leading-tight max-w-5xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            LimitFreeプログラム
            <br />
            探究型キャリア教育ソフト
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            あなたの情熱と才能を宇宙に打ち上げ、未知の可能性を探索する旅に出かけましょう。
            LimitFreeは、ゲーム感覚でキャリア探究を楽しく、効果的に進めるための革新的なプラットフォームです。
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 flex items-center group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={launchApp}
            >
              パッションシャトルを打ち上げる
              <motion.div
                className="ml-2"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
              >
                <Rocket className="w-5 h-5" />
              </motion.div>
            </motion.button>

            <a
              href="#features"
              className="text-muted-foreground hover:text-foreground transition-colors flex items-center group"
            >
              詳しく見る
              <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </motion.div>
        </motion.div>

        {/* Floating rocket */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-20 h-40 bg-gradient-to-t from-blue-500 via-indigo-400 to-transparent opacity-50 blur-xl rounded-full"
              animate={{
                height: [30, 60, 30],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
            />
            <div className="relative w-20 h-40">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-24 bg-gradient-to-b from-white via-blue-100 to-blue-300 rounded-full" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-500 rounded-full" />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-8 bg-gradient-to-b from-blue-400 to-blue-600 rounded-b-full" />
              <div className="absolute bottom-0 left-1/4 w-2 h-6 bg-blue-700 rounded-b-full" />
              <div className="absolute bottom-0 right-1/4 w-2 h-6 bg-blue-700 rounded-b-full" />
            </div>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
        >
          <motion.div
            className="w-8 h-12 border-2 border-primary/30 rounded-full flex justify-center"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <motion.div
              className="w-2 h-2 bg-primary rounded-full mt-2"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              宇宙のような無限の可能性を探索
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LimitFreeは、あなたのキャリア探究をゲーム感覚で楽しく、効果的に進めるための革新的な機能を提供します。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 p-6 hover:border-primary/30 transition-colors group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div
                  className={`w-14 h-14 mb-6 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-110 transition-transform duration-300`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="py-20 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
                なぜLimitFreeなのか？
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                従来のキャリア教育は、単なる職業選択や進路指導に留まっていました。LimitFreeは、あなたの内側にある情熱と才能を引き出し、本当の意味での「やりがい」と「幸せ」を見つける旅をサポートします。
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-full p-1 mr-3 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">ゲーミフィケーション</h4>
                    <p className="text-muted-foreground">探究活動をゲーム感覚で楽しく継続できる仕組み</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full p-1 mr-3 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">パーソナライズ</h4>
                    <p className="text-muted-foreground">一人ひとりの興味・関心に合わせたカスタマイズされた体験</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-full p-1 mr-3 mt-1">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">コミュニティ</h4>
                    <p className="text-muted-foreground">同じ興味を持つ仲間との出会いと相互成長の場</p>
                  </div>
                </div>
              </div>

              <motion.button
                className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 flex items-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={launchApp}
              >
                今すぐ始める
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative z-10 card-gradient rounded-2xl border border-primary/10 overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 z-0" />

                <div className="relative z-10 p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-blue-600/20 border border-white/20">
                      <Star className="w-6 h-6 text-white fill-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground">パッションシャトル</h3>
                      <p className="text-muted-foreground text-sm">あなたの情熱を宇宙へ</p>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/5">
                      <h4 className="font-bold text-foreground mb-2 flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mr-2 text-xs">
                          1
                        </span>
                        興味と才能の発見
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        RIASECタイプやOCEANモデルに基づく自己分析で、あなたの強みを発見します。
                      </p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/5">
                      <h4 className="font-bold text-foreground mb-2 flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mr-2 text-xs">
                          2
                        </span>
                        パッションシャトルの設計
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        あなたの興味と才能を掛け合わせた、独自のキャリアパスを設計します。
                      </p>
                    </div>

                    <div className="bg-secondary/50 rounded-xl p-4 border border-primary/5">
                      <h4 className="font-bold text-foreground mb-2 flex items-center">
                        <span className="w-6 h-6 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center mr-2 text-xs">
                          3
                        </span>
                        クエストによる実践
                      </h4>
                      <p className="text-muted-foreground text-sm">
                        段階的なクエストを通じて、実践的なスキルと経験を積み重ねます。
                      </p>
                    </div>
                  </div>

                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: "65%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <div className="text-xs text-muted-foreground">探究進捗度</div>
                    <div className="text-cyan-400 font-bold">65%</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl z-0" />
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl z-0" />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div id="testimonials" className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 text-transparent bg-clip-text">
              利用者の声
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              LimitFreeを使って、自分の可能性を広げた人たちの体験談をご紹介します。
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "田中 美咲",
                role: "高校2年生",
                quote:
                  "自分の「好き」を深掘りすることで、将来の方向性が見えてきました。クエストをクリアするたびに自信がついていきます。",
                avatar: "M",
              },
              {
                name: "佐藤 健太",
                role: "大学1年生",
                quote:
                  "AIアシスタントとの対話が、自分の考えを整理するのに役立ちました。パッションシャトルのおかげで、自分だけの道を見つけられました。",
                avatar: "K",
              },
              {
                name: "鈴木 先生",
                role: "高校教師",
                quote:
                  "生徒たちが自主的に探究活動に取り組むようになりました。ゲーム感覚で学べる仕組みが、モチベーション維持に効果的です。",
                avatar: "S",
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="card-gradient rounded-2xl shadow-xl border border-primary/10 p-6 hover:border-primary/30 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center mr-4 shadow-lg shadow-purple-600/20 border border-white/20">
                    <span className="text-white font-bold text-lg">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{testimonial.name}</h3>
                    <p className="text-muted-foreground text-sm">{testimonial.role}</p>
                  </div>
                </div>

                <p className="text-muted-foreground italic mb-4">"{testimonial.quote}"</p>

                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 relative">
        <div className="container mx-auto px-6">
          <motion.div
            className="card-gradient rounded-3xl border border-primary/10 overflow-hidden shadow-2xl relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-purple-500/10 z-0" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 z-0" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 z-0" />

            <div className="relative z-10 p-12 md:p-16 text-center">
              <motion.h2
                className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-blue-400 to-indigo-400 text-transparent bg-clip-text max-w-4xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                あなたのパッションシャトルを打ち上げる準備はできましたか？
              </motion.h2>

              <motion.p
                className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                LimitFreeで、あなただけの探究の旅を始めましょう。
                無限の可能性が広がる宇宙で、あなたの情熱と才能が輝く瞬間を見つけてください。
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.button
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-medium hover:shadow-xl hover:shadow-blue-600/20 transition-all duration-300 border border-white/10 flex items-center mx-auto group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={launchApp}
                >
                  <span className="mr-2">今すぐ打ち上げる</span>
                  <motion.div
                    animate={{
                      y: [0, -5, 0],
                      rotate: [0, 10, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  >
                    <Rocket className="w-6 h-6" />
                  </motion.div>
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-primary/10 relative">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center p-2 rounded-xl shadow-lg mr-3">
                  <div className="w-8 h-8 bg-white flex items-center justify-center rounded-lg shadow-inner">
                    <span className="bg-gradient-to-br from-blue-600 to-indigo-600 text-transparent bg-clip-text font-bold">
                      L
                    </span>
                  </div>
                </div>
                <span className="text-foreground font-bold text-xl tracking-wide">LimitFree</span>
              </div>
              <p className="text-muted-foreground mb-4">LimitFreeプログラム、探究型キャリア教育ソフトウェア</p>
              <div className="flex space-x-4">
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-foreground font-bold mb-4">機能</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    パッションシャトル
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    クエストシステム
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    AIアシスタント
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    コミュニティ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-bold mb-4">リソース</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    ヘルプセンター
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    ドキュメント
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    コミュニティフォーラム
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-foreground font-bold mb-4">会社情報</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    私たちについて
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    ブログ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    お問い合わせ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                    採用情報
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-primary/10 text-center">
            <p className="text-muted-foreground">© 2025 LimitFree. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
