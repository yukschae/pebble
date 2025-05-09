/**
 * パッションシャトル提案APIルート
 */

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export const maxDuration = 30

// サーバーサイド専用のSupabaseクライアントを作成
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.")
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

export async function POST(req: Request) {
  try {
    // APIキーが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // サーバーサイドのSupabaseクライアントを作成
    const supabase = createServerSupabaseClient()

    // ユーザーセッションを取得
    const cookieStore = cookies()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // デモモードの確認
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true"

    // ユーザーIDを取得（デモモードの場合はデモユーザーID）
    const userId = isDemo ? "demo-user-id" : session?.user?.id

    if (!userId && !isDemo) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // ユーザープロファイルを取得
    const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single()

    // RIASEC結果を取得
    const { data: riasecResults } = await supabase
      .from("riasec_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    // RIASECの結果を安全に取得
    const riasecCode =
      riasecResults && riasecResults.length > 0 && riasecResults[0].results
        ? riasecResults[0].results.threeLetterCode
        : "不明"

    const riasecDetails =
      riasecResults && riasecResults.length > 0 && riasecResults[0].results
        ? JSON.stringify(riasecResults[0].results, null, 2)
        : "{}"

    // OCEAN結果を取得
    const { data: oceanResults } = await supabase
      .from("ocean_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)

    const oceanDetails =
      oceanResults && oceanResults.length > 0 && oceanResults[0].results
        ? JSON.stringify(oceanResults[0].results, null, 2)
        : "{}"

    // AIプロンプトを作成
    const prompt = `
    あなたはキャリア教育アプリのAIアシスタントです。ユーザーの「パッションシャトル」を提案します。
    
    パッションシャトルとは、ユーザーの興味・関心を掛け合わせた新しい活動や探究テーマのことです。
    例えば「音楽 x プログラミング」「環境問題 x デザイン」「スポーツ x 国際交流」などです。
    
    ユーザー情報:
    名前: ${userProfile?.display_name || "ゲスト"}
    RIASECタイプ: ${riasecCode}
    RIASEC詳細: ${riasecDetails}
    OCEAN詳細: ${oceanDetails}
    
    ユーザーのRIASECタイプと性格特性を考慮して、3つのパッションシャトルを提案してください。
    各提案には以下の要素を含めてください:
    - title: 提案のタイトル（例: "アート x 教育"）
    - description: 提案の詳細な説明
    - tags: 関連するキーワード（配列形式）
    
    回答は必ず以下のJSON形式で返してください:
    {
      "suggestions": [
        {
          "title": "提案1のタイトル",
          "description": "提案1の説明",
          "tags": ["タグ1", "タグ2", "タグ3"]
        },
        {
          "title": "提案2のタイトル",
          "description": "提案2の説明",
          "tags": ["タグ1", "タグ2", "タグ3"]
        },
        {
          "title": "提案3のタイトル",
          "description": "提案3の説明",
          "tags": ["タグ1", "タグ2", "タグ3"]
        }
      ]
    }
    
    JSONのみを返してください。説明や前置きは不要です。
    `

    // AIモデルを使用して提案を生成
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      })

      // レスポンスからJSONを取得
      const responseData = await response.json()

      // レスポンスからテキストを抽出
      const content = responseData.content[0].text

      // JSONをパース
      const suggestions = JSON.parse(content)

      // 提案を保存（デモモードでない場合）
      if (!isDemo) {
        await supabase.from("passion_shuttle_suggestions").insert({
          user_id: userId,
          suggestions: suggestions.suggestions,
          created_at: new Date().toISOString(),
        })
      }

      return new Response(JSON.stringify(suggestions), {
        headers: { "Content-Type": "application/json" },
      })
    } catch (aiError) {
      console.error("Error in AI processing:", aiError)
      return new Response(
        JSON.stringify({
          error: "Error processing with AI",
          details: aiError instanceof Error ? aiError.message : String(aiError),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }
  } catch (error) {
    console.error("Error in passion shuttle suggestion API:", error)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
