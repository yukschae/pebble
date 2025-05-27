import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { Message } from 'ai';

// ─────────────────────────────────────────────────────────────────────────
// POST /api/chat               – stream AI reply & persist chat history
// ─────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    /* ── 1. Parse body ──────────────────────────────────────────────── */
    const { messages } = (await req.json()) as { messages: Message[] };

    /* ── 2. Build Supabase server-client tied to the user’s cookies ─── */
    const supabase = createRouteHandlerClient({ cookies });

    /* ── 3. Get current session / user ──────────────────────────────── */
    const {
      data: { session },
      error: sessionErr,
    } = await supabase.auth.getSession();

    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
    const userId = isDemo ? 'demo-user-id' : session?.user?.id;

    if (!userId && !isDemo) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (sessionErr) console.warn('[chat] getSession warning:', sessionErr?.message);

    /* ── 4. Fetch auxiliary data (profile, RIASEC, etc.) ────────────── */
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    const { data: riasecResults } = await supabase
      .from('riasec_results')
      .select('results')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    const riasecCode =
      riasecResults?.[0]?.results?.threeLetterCode ?? '不明';

    const { data: passionShuttle } = await supabase
      .from('passion_shuttles')
      .select('*')
      .eq('user_id', userId)
      .eq('selected', true)
      .single();

    const { data: quests } = await supabase
      .from('quests')
      .select('*')
      .eq('user_id', userId)
      .order('order', { ascending: true });

    const currentQuest = quests?.find((q: any) => q.current);

    /* ── 5. Persist the user’s incoming message ─────────────────────── */
    if (!isDemo) {
      await supabase.from('chat_history').insert({
        user_id: userId,
        message: messages[messages.length - 1]?.content ?? '', 
        role: 'user',
        created_at: new Date().toISOString(),
      });
    }

    /* ── 6. Build system prompt ─────────────────────────────────────── */
    const systemPrompt = `あなたはLimitFreeというキャリア教育アプリのAIアシスタントです。
    ユーザーの「パッションシャトル」に関連するクエストのアイデアを提案したり、探究活動のヒントを提供します。
    回答は必ず日本語で、見やすいマークダウン形式で提供してください。
    クエストを提案する場合は、テーマ、内容、具体的なクエスト（目的、行動例、成果物）の形式で構造化してください。
    回答は常に具体的で実行可能なアドバイスを含めてください。

    以下はユーザーに関する情報です：
    ユーザー名: ${userProfile?.display_name || "ゲスト"}
    RIASECタイプ: ${riasecCode}
    
    以下はユーザーのパッションシャトルに関する情報です：
    タイトル: ${passionShuttle?.title || "未設定"}
    説明: ${passionShuttle?.description || "未設定"}
    タグ: ${passionShuttle?.tags?.join(", ") || "未設定"}
    
    以下はユーザーのクエスト一覧です：
    ${
      quests && quests.length > 0
        ? quests
            .map(
              (quest: any) => `
    クエスト${quest.id}: ${quest.title}
    状態: ${quest.completed ? "完了済み" : quest.current ? "進行中" : "未開始"}
    説明: ${quest.description}
    行動例: ${quest.actions.join(" / ")}
    成果物: ${quest.outcome}
    `,
            )
            .join("\n")
        : "クエストはまだ設定されていません"
    }
    
    現在進行中のクエスト: ${currentQuest ? `クエスト${currentQuest.id}: ${currentQuest.title}` : "なし"}
    
    ユーザーがクエストについて質問した場合は、上記の情報を参照して回答してください。
    クエストの難易度調整や代替案を求められた場合は、現在のクエスト内容を踏まえた上で、より適切な提案をしてください。
    ユーザーの質問に直接関係のない情報は開示しないでください。
    最も重要な点として、敬語はなしで同じ高校生のような、フレンドリーで親しみやすい口調を使い、ユーザーの探究活動をサポートしてください。`;

    /* ── 7. Stream AI reply (Anthropic Claude) ─────────────────────── */
    const result = await streamText({
      model: anthropic('claude-3-haiku-20240307'),
      messages,
      system: systemPrompt,
      temperature: 0.7,
      maxTokens: 1000,
      onFinish: async ({ text }) => {
        /* save assistant reply */
        if (!isDemo) {
          await supabase.from('chat_history').insert({
            user_id: userId,
            message: text,
            role: 'assistant',
            created_at: new Date().toISOString(),
          });
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (err) {
    console.error('[chat] unexpected error:', err);
    return NextResponse.json(
      {
        error: 'Unhandled error in /api/chat',
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}





