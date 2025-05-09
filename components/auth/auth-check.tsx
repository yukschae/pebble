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

  // デモモードの確認
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // ローディング中は何もしない
    if (loading) return

    // デモモードの場合は認証をスキップ
    if (isDemoMode) return

    // ユーザーがログインしていない場合はログインページにリダイレクト
    if (!user && mounted && !loading) {
      router.push("/")
    }
  }, [user, loading, mounted, router, isDemoMode])

  // ローディング中は読み込み表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // デモモードの場合は常に子コンポーネントを表示
  if (isDemoMode) return <>{children}</>

  // ユーザーがログインしていない場合は何も表示しない
  if (!user) return null

  // ユーザーがログインしている場合は子コンポーネントを表示
  return <>{children}</>
}
