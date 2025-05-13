import type { Message } from "ai";
import { streamText } from "ai"; // streamText is still a top-level export
import { anthropic } from '@ai-sdk/anthropic';
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const maxDuration = 30;

// サーバーサイド専用のSupabaseクライアントを作成
function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required. Please check your environment variables.");
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

export async function POST(req: Request) {
  try { // <<< MAIN TRY BLOCK STARTS HERE (around line 20 in your original)
    // APIキーが設定されているか確認
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // リクエストボディを取得
    const { messages } = (await req.json()) as { messages: Message[] };

    // サーバーサイドのSupabaseクライアントを作成
    const supabase = createServerSupabaseClient();

    // ユーザーセッションを取得
    const cookieStore = cookies();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // デモモードの確認
    const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    // ユーザーIDを取得（デモモードの場合はデモユーザーID）
    const userId = isDemo ? "demo-user-id" : session?.user?.id;

    if (!userId && !isDemo) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ユーザープロファイルを取得
    const { data: userProfile } = await supabase.from("user_profiles").select("*").eq("user_id", userId).single();

    // RIASEC結果を取得
    const { data: riasecResults } = await supabase
      .from("riasec_results")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    // RIASECの結果を安全に取得
    const riasecCode =
      riasecResults && riasecResults.length > 0 && riasecResults[0].results
        ? riasecResults[0].results.threeLetterCode
        : "不明";

    // パッションシャトルを取得
    const { data: passionShuttle } = await supabase
      .from("passion_shuttles")
      .select("*")
      .eq("user_id", userId)
      .eq("selected", true)
      .single();

    // クエストを取得
    const { data: quests } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", userId)
      .order("order", { ascending: true });

    // 現在のクエストを取得
    const currentQuest = quests && quests.length > 0 ? quests.find((quest: any) => quest.current) : null;

    // チャット履歴を保存
    if (!isDemo) {
      await supabase.from("chat_history").insert({
        user_id: userId,
        message: messages[messages.length - 1]?.content || "",
        role: "user",
        created_at: new Date().toISOString(),
      });
    }

    // システムプロンプトを作成
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

    // デモモードの場合は、ハードコードされた応答を返す
    // You had a duplicate "if (isDemo)" block here. I'm removing the outer one.
    // The inner one is what we want.
    if (isDemo) {
      const demoResponse = `こんにちは！LimitFreeのAIアシスタントだよ。何か質問があれば気軽に聞いてね！

パッションシャトルやクエストについて相談したいことがあれば、いつでも手伝うよ。

例えば、こんなことを聞いてみてね：
- 「アート x 人助け」のクエストを考えて
- パッションシャトルのアイデアが欲しい
- クエストの進め方を教えて
- 探究活動のヒントを教えて

デモモードでは実際のAI応答は制限されているけど、本番環境では完全な機能が使えるよ！`;

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          for (const char of demoResponse) {
            // Properly format the stream chunk for AI SDK data stream
            const streamChunk = `data: ${JSON.stringify({ type: "text", text: char })}\n\n`;
            controller.enqueue(encoder.encode(streamChunk));
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
          controller.close();
        },
      });
      // Standard Web API Response for a stream
      return new Response(stream, {
        headers: { "Content-Type": "text/event-stream; charset=utf-8" },
      });
    } // <<< END OF isDemo IF BLOCK

    // AI SDKを使用してテキストをストリーミング
    // This try...catch is for the AI call itself.
    try {
      const result = await streamText({
        model: anthropic('claude-3-haiku-20240307'),
        messages: messages as Message[],
        system: systemPrompt,
        temperature: 0.7,
        maxTokens: 1000,
        onFinish: async ({ text, toolCalls, toolResults, usage, finishReason }) => {
          if (!isDemo) { // Check isDemo again, or pass userId carefully if it could be undefined here
            const currentUserId = isDemo ? "demo-user-id" : session?.user?.id; // Re-evaluate userId or ensure it's correctly scoped
            if (currentUserId) { // Ensure userId is valid before inserting
                 await supabase.from("chat_history").insert({
                    user_id: currentUserId,
                    message: text,
                    role: "assistant",
                    created_at: new Date().toISOString(),
                });
            }
          }
        },
      });

      return result.toDataStreamResponse();

    } catch (aiError) { // <<< CATCH FOR THE AI SDK CALL TRY BLOCK
      console.error("Error calling Anthropic API with AI SDK:", aiError);
      return new Response(
        JSON.stringify({
          error: "Error calling Anthropic API with AI SDK",
          details: aiError instanceof Error ? aiError.message : String(aiError),
        }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    } // <<< END OF AI SDK CALL TRY...CATCH
  
  // The error " 'catch' or 'finally' expected" usually means the block above this comment
  // is not properly closed, or the main try block isn't closed.
  // Based on your original error pointing to line 218, the issue is likely the main try block.

  } catch (error) { // <<< THIS IS THE CATCH FOR THE MAIN TRY BLOCK (started around line 20)
    console.error("Error in chat API:", error);
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred in chat API",
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  } // <<< END OF MAIN TRY...CATCH
} // <<< END OF POST FUNCTION