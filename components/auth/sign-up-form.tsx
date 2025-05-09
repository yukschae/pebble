"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import { saveUserProfile } from "@/lib/supabase" // 直接関数をインポート

export function SignUpForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const { signUp } = useAuth() // updateUserProfileは使用しない
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { user } = await signUp(email, password)

      if (user) {
        // サインアップ成功後、直接saveUserProfile関数を呼び出す
        try {
          await saveUserProfile(user.id, displayName)
          setSuccess(true)

          // 少し待ってからダッシュボードにリダイレクト
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        } catch (profileError) {
          console.error("Profile update error:", profileError)
          // プロファイル更新に失敗してもサインアップは成功しているので、エラーは表示せずに続行
          setSuccess(true)
          setTimeout(() => {
            router.push("/dashboard")
          }, 2000)
        }
      } else {
        // メール確認が必要な場合
        setSuccess(true)
      }
    } catch (error) {
      console.error("Sign up error:", error)
      setError(
        error instanceof Error
          ? error.message
          : "アカウント作成に失敗しました。別のメールアドレスを試すか、後でもう一度お試しください。",
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {success ? (
        <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded-lg">
          <p className="font-medium">アカウントが作成されました！</p>
          <p className="text-sm mt-1">
            メールアドレスの確認が必要な場合は、メールをご確認ください。自動的にダッシュボードにリダイレクトします...
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor="display-name">表示名</Label>
            <Input
              id="display-name"
              type="text"
              placeholder="あなたの名前"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-gray-800 border-gray-700"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">パスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-gray-800 border-gray-700"
            />
            <p className="text-xs text-gray-400">パスワードは6文字以上で設定してください</p>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
          >
            {loading ? "アカウント作成中..." : "アカウント作成"}
          </Button>
        </>
      )}
    </form>
  )
}
