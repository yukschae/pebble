/**
 * パッションシャトル保存 API
 * POST /api/passion-shuttle/save
 */

import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function POST(req: NextRequest) {
  /* 1. body */
  const { title, informative_description, colloquial_description, tags } = await req.json()
  if (!title || !informative_description || !colloquial_description || !tags)
    return NextResponse.json(
      { error: "title, informative_description, colloquial_description and tags are required" },
      { status: 400 },
    )

  /* 2. Supabase client */
  const token = req.headers.get("authorization")?.replace("Bearer ", "") ?? undefined
  const supabase =
    token
      ? createClient(

          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { global: { headers: { Authorization: `Bearer ${token}` } } },
        )
      : createRouteHandlerClient({ cookies })

  /* 3. user id n */
  let userId: string | null = null
  if (token) {
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } else {
    const { data } = await supabase.auth.getSession()
    userId = data.session?.user?.id ?? null
  }
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  /* 4. save directly */
  try {
    await supabase.from("passion_shuttles").upsert(
      {
        user_id: userId,
        title,
        informative_description,
        colloquial_description,
        tags,
        selected: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }, // one shuttle per user
    )
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("[save] db error:", err)
    return NextResponse.json(
      { error: "Failed to save passion shuttle", details: (err as Error).message },
      { status: 500 },
    )
  }
}
