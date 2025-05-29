/**
 * パッションシャトル提案 API
 * POST /api/passion-shuttle/suggest
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export const maxDuration = 30 // Vercel edge-function timeout

/* ────────────────────────────────────────────────────────────────── */
/* Helpers                                                            */
/* ────────────────────────────────────────────────────────────────── */

function anthroHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  }
}

/* ────────────────────────────────────────────────────────────────── */
/* Route handler                                                      */
/* ────────────────────────────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  /* 1. environment checks */
  if (!process.env.ANTHROPIC_API_KEY)
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured" },
      { status: 500 },
    )

  /* 2. build Supabase client (with or without JWT) */
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined

  const supabase =
    token
      ? createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } },
        )
      : createRouteHandlerClient({ cookies })

  /* 3. verify user */
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)
  if (userErr || !userData?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const userId = userData.user.id

  try {
    /* 4. fetch auxiliary user data in parallel --------------------- */
    const [
      { data: profile },
      { data: riasec },
      { data: ocean },
    ] = await Promise.all([
      supabase.from("user_profiles").select("*").eq("user_id", userId).single(),
      supabase
        .from("riasec_results")
        .select("results")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
      supabase
        .from("ocean_results")
        .select("results")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1),
    ])

    const riasecCode    = riasec?.[0]?.results?.threeLetterCode ?? "不明"
    const riasecDetail  = riasec?.[0]?.results ? JSON.stringify(riasec[0].results, null, 2) : "{}"
    const oceanDetail   = ocean?.[0]?.results ? JSON.stringify(ocean[0].results, null, 2) : "{}"

    /* 5. craft prompt --------------------------------------------- */
    const prompt = `
あなたはキャリア教育アプリのAIアシスタントです。ユーザーの「パッションシャトル」を提案します。

▼ パッションシャトルとは
ユーザーの興味を掛け合わせて生み出す新しい活動・探究テーマ
例: 「音楽 x プログラミング」「環境問題 x デザイン」「スポーツ x 国際交流」

▼ ユーザー情報
- 名前: ${profile?.display_name ?? "ゲスト"}
- RIASECタイプ: ${riasecCode}
- RIASEC詳細: ${riasecDetail}
- OCEAN詳細:  ${oceanDetail}

▼ 指示
1. ユーザーの興味・特性を踏まえて **3件** のパッションシャトルを提案せよ。
2. 提案ごとに以下のキーを含むこと:
   - title        : タイトル
   - description  : 詳細説明
   - tags         : キーワード配列
3. **JSONのみ** を返すこと。余計な文は書かない。

▼ フォーマット
{
  "suggestions": [
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] },
    { "title": "", "description": "", "tags": [] }
  ]
}
`

    /* 6. call Anthropic ------------------------------------------- */
    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthroHeaders(process.env.ANTHROPIC_API_KEY!),
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    const aiJson = await aiRes.json()
    const raw    = aiJson.content?.[0]?.text ?? ""
    let suggestions

    try {
      suggestions = JSON.parse(raw)
    } catch (parseErr) {
      console.error("[passion-shuttle] JSON parse error:", parseErr, "raw:", raw)
      return NextResponse.json(
        { error: "Failed to parse AI JSON", details: raw.slice(0, 200) },
        { status: 502 },
      )
    }

    /* 7. persist & respond ---------------------------------------- */
    await supabase.from("passion_shuttle_suggestions").insert({
      user_id: userId,
      suggestions: suggestions.suggestions,
      created_at: new Date().toISOString(),
    })

    return NextResponse.json(suggestions)
  } catch (err) {
    console.error("[passion-shuttle] unexpected error:", err)
    return NextResponse.json(
      { error: "Unhandled error", details: (err as Error).message },
      { status: 500 },
    )
  }
}
