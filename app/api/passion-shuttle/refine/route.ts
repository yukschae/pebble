/**
 * パッションシャトル提案の「洗練」 API
 * POST /api/passion-shuttle/refine
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { parseJsonSafe } from "@/lib/utils"

export const maxDuration = 30 // Vercel edge timeout

/* helper for Anthropic headers */
const anthropicHeaders = (key: string) => ({
  "Content-Type": "application/json",
  "x-api-key": key,
  "anthropic-version": "2023-06-01",
})

export async function POST(req: NextRequest) {
  /* ── 0. env check ─────────────────────────────────────────────── */
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 },
    )
  }

  /* ── 1. parse body ────────────────────────────────────────────── */
  const { feedback = "", suggestions = [] } = await req.json()

  /* ── 2. build Supabase client ─────────────────────────────────── */
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined

  const supabase =
    token
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } },
        )
      : createRouteHandlerClient({ cookies })

  /* ── 3. verify user (header JWT > cookie session) ─────────────── */
  let userId: string | null = null
  let supaErr: Error | null  = null

  if (token) {
    const { data, error } = await supabase.auth.getUser()
    supaErr = error ?? null
    userId  = data.user?.id ?? null
  } else {
    const { data, error } = await supabase.auth.getSession()
    supaErr = error ?? null
    userId  = data.session?.user?.id ?? null
  }

  if (supaErr) console.warn("[refine] supabase auth warning:", supaErr.message)
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    /* ── 4. fetch user data in parallel ─────────────────────────── */
    const [
      { data: profile },
      { data: riasec },
      { data: dbSuggest },
    ] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("riasec_results")
        .select("results")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("passion_shuttle_suggestions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
    ])

    const riasecCode = riasec?.[0]?.results?.threeLetterCode ?? "不明"
    const latest     = dbSuggest?.[0]?.suggestions ?? suggestions /* fall back to body */

    /* ── 5. craft prompt ────────────────────────────────────────── */
    const prompt = `
あなたはキャリア探究アプリ **LimitFree** の AI アシスタントです。以下の「パッションシャトル」提案をユーザーのフィードバックに基づき全て刷新してください。
**「動き + 対象/手段 + 意図/視点 + 人」**\u200bで 1行に凝縮した "パッションシャトル" を提案してください。  
（例）「里山と都会をぐるっと循環でつなげる人」、「古着で誰でも自己表現！ジェンダーフリーリメイクを広める人"

▼ ユーザー情報
- 名前          : ${profile?.display_name ?? "ゲスト"}
- RIASECタイプ   : ${riasecCode}
▼ 現在の提案
${JSON.stringify(latest, null, 2)}

▼ フィードバック
${feedback}

▼ 指示
1. 5件の提案それぞれを改善せよ。
2. 各提案は { "title", "informative_description", "colloquial_description", "tags": [] } を含む。
3. 回答は **下記 JSON フォーマットのみ** で返すこと。

{
  "suggestions": [
    { "title": "", "informative_description": "", "colloquial_description": "", "tags": [] },
    { "title": "", "informative_description": "", "colloquial_description": "", "tags": [] },
    { "title": "", "informative_description": "", "colloquial_description": "", "tags": [] },
    { "title": "", "informative_description": "", "colloquial_description": "", "tags": [] },
    { "title": "", "informative_description": "", "colloquial_description": "", "tags": [] }
  ]
}`

    /* ── 6. call Anthropic ──────────────────────────────────────── */
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthropicHeaders(process.env.ANTHROPIC_API_KEY!),
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        messages: [{ role: "user", content: prompt }],
        temperature: 1.0,
        max_tokens: 3000,
      }),
    })

    const aiJson = await aiRes.json()
    const raw    = aiJson.content?.[0]?.text ?? ""

    let refined
    try {
      refined = parseJsonSafe(raw)
    } catch (parseErr) {
      console.error("[refine] JSON parse error:", parseErr, "raw:", raw)
      return NextResponse.json(
        { error: "Failed to parse AI JSON", details: raw.slice(0, 200) },
        { status: 502 },
      )
    }

    /* ── 7. persist & respond ───────────────────────────────────── */
    await supabase.from("passion_shuttle_suggestions").insert({
      user_id: userId,
      suggestions: refined.suggestions,
      feedback,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(refined)
  } catch (err) {
    console.error("[refine] unexpected error:", err)
    return NextResponse.json(
      { error: "Unhandled error", details: (err as Error).message },
      { status: 500 },
    )
  }
}
