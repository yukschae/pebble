/**
 * 認証チェックコンポーネント
 *
 * このコンポーネントは、ユーザーが認証されているかどうかをチェックし、
 * 認証されていない場合はログインページにリダイレクトします。
 * デモモードが有効な場合は、認証チェックをバイパスします。
 *
 * 主な機能：
 * - ユーザーの認証状態のチェック
 * - 未認証ユーザーのリダイレクト
 * - デモモードのサポート
 * - ローディング状態の表示
 *
 * 使用している主要なライブラリ：
 * - React (useEffect, useState)
 * - Next.js (useRouter)
 *
 * データフロー：
 * 1. useAuthフックからユーザー情報とローディング状態を取得
 * 2. ユーザーが認証されていない場合、ログインページにリダイレクト
 * 3. デモモードの場合、認証チェックをスキップ
 *
 * 関連ファイル：
 * - lib/supabase.ts (認証ロジック)
 */

"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabase"

interface AuthCheckProps {
  children: React.ReactNode
}

export function AuthCheck({ children }: AuthCheckProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)

  // デモモードの確認
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  useEffect(() => {
    console.log("AuthCheck mounted, auth state:", { user: !!user, loading, isDemoMode })
    setMounted(true)

    // ローディングが長すぎる場合のタイムアウト処理
    const timer = setTimeout(() => {
      if (loading) {
        console.error("Authentication check timeout - redirecting to login")
        setLoadingTimeout(true)
        router.push("/")
      }
    }, 10000) // 10秒後にタイムアウト

    return () => clearTimeout(timer)
  }, [loading, router])

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return

    // デモモードの場合は認証をスキップ
    if (isDemoMode) {
      console.log("Demo mode enabled, skipping auth check")
      return
    }

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user && mounted && !loading) {
      console.log("User not authenticated, redirecting to login page")
      router.push("/")
    } else if (user && mounted && !loading) {
      console.log("User authenticated:", user.id)
    }
  }, [user, loading, mounted, router, isDemoMode])

  // ローディングタイムアウトの場合
  if (loadingTimeout) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
        <div className="text-white mb-4">認証に時間がかかっています</div>
        <button onClick={() => router.push("/")} className="px-4 py-2 bg-blue-600 text-white rounded-md">
          ログインページに戻る
        </button>
      </div>
    )
  }

  // ローディング中は読み込み表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // デモモードの場合は常に子コンポーネントを表示
  if (isDemoMode) {
    console.log("Rendering children in demo mode")
    return <>{children}</>
  }

  // ユーザーがログインしていない場合は何も表示しない
  if (!user) {
    console.log("User not authenticated, not rendering children")
    return null
  }

  // ユーザーがログインしている場合は子コンポーネントを表示
  console.log("User authenticated, rendering children")
  return <>{children}</>
}
