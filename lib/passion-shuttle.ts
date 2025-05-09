/**
 * パッションシャトルロジック
 *
 * このファイルは、パッションシャトル（興味と才能を掛け合わせたキャリアコンセプト）の
 * 生成と修正に関するロジックを提供します。
 *
 * 主な機能：
 * - AIプロンプトの生成
 * - AIレスポンスの解析と構造化
 *
 * 主要な関数：
 * - generatePassionShuttlePrompt: RIASEC/OCEAN結果に基づいてプロンプトを生成
 * - generateRefinementPrompt: フィードバックに基づいて修正プロンプトを生成
 * - parsePassionShuttleSuggestions: AIレスポンスを解析して構造化
 *
 * データフロー：
 * 1. ユーザーのRIASEC/OCEAN結果を取得
 * 2. 結果に基づいてプロンプトを生成
 * 3. AIの応答を解析して構造化
 *
 * 関連ファイル：
 * - app/api/passion-shuttle/suggest/route.ts (候補生成API)
 * - app/api/passion-shuttle/refine/route.ts (候補修正API)
 * - app/passion-shuttle/page.tsx (パッションシャトルUI)
 */

import { getUserRiasecResults, getUserOceanResults } from "./supabase"

// パッションシャトル提案のためのプロンプトを生成する関数
export async function generatePassionShuttlePrompt(userId: string) {
  try {
    // RIASECとOCEANの結果を取得
    const riasecResults = await getUserRiasecResults(userId)
    const oceanResults = await getUserOceanResults(userId)

    if (!riasecResults || !oceanResults) {
      throw new Error("RIASEC or OCEAN results not found")
    }

    // RIASECの上位3つの因子を取得
    const riasecTopFactors = riasecResults.results.sortedDimensions.slice(0, 3)
    const riasecScores = riasecResults.results.dimensionScores

    // OCEANのスコアを取得
    const oceanScores = oceanResults.results.scores

    // プロンプトを生成
    const prompt = `
あなたは、キャリア教育アプリ「LimitFree」のAIアシスタントです。ユーザーのRIASECタイプとOCEAN（ビッグファイブ）の分析結果に基づいて、「パッションシャトル」と呼ばれる創造的なキャリアコンセプトを5つ提案してください。

パッションシャトルとは、従来の「医者」「弁護士」のような具体的な職業ではなく、ユーザーの興味・関心と才能を掛け合わせた、より抽象的で創造的なキャリアコンセプトです。例えば「アート×人助け」「テクノロジー×環境保護」のような組み合わせです。

以下はユーザーの分析結果です：

## RIASECタイプ（キャリア興味）
上位3つの因子：${riasecTopFactors.join(", ")}
スコア：
${Object.entries(riasecScores)
  .map(([key, value]) => `- ${key}: ${value}%`)
  .join("\n")}

## OCEANタイプ（性格特性）
スコア：
${Object.entries(oceanScores)
  .map(([key, value]) => `- ${key}: ${value}%`)
  .join("\n")}

これらの結果に基づいて、以下の形式で5つのパッションシャトル候補を提案してください：

1. タイトル: [簡潔なタイトル、例：「アート×人助け」]
   説明: [100-150文字程度の説明。どのような活動や価値観が含まれるかを具体的に]
   タグ: [関連するキーワードを3-5個、カンマ区切り]

2. タイトル: ...
   ...

5. タイトル: ...
   ...

注意点：
- 従来の職業名（医者、教師など）ではなく、より創造的で抽象的な概念を提案してください
- ユーザーの強みや興味を最大限に活かせる提案を心がけてください
- 社会的インパクトや自己実現の可能性を考慮してください
- 多様な選択肢を提供するため、5つの提案はそれぞれ異なる方向性を持つようにしてください

JSON形式で回答してください。
`

    return prompt
  } catch (error) {
    console.error("Error generating passion shuttle prompt:", error)
    throw error
  }
}

// パッションシャトル修正のためのプロンプトを生成する関数
export function generateRefinementPrompt(previousSuggestions: any, feedback: string) {
  try {
    // プロンプトを生成
    const prompt = `
あなたは、キャリア教育アプリ「LimitFree」のAIアシスタントです。以前提案したパッションシャトル候補に対するユーザーのフィードバックに基づいて、新たな提案を行ってください。

## 以前の提案
${JSON.stringify(previousSuggestions, null, 2)}

## ユーザーのフィードバック
${feedback}

このフィードバックを踏まえて、ユーザーの興味・関心により合致した5つの新しいパッションシャトル候補を提案してください。以前の提案の中で気に入った要素は残しつつ、フィードバックに基づいて改良や新しい方向性を提示してください。

以下の形式で5つのパッションシャトル候補を提案してください：

1. タイトル: [簡潔なタイトル、例：「アート×人助け」]
   説明: [100-150文字程度の説明。どのような活動や価値観が含まれるかを具体的に]
   タグ: [関連するキーワードを3-5個、カンマ区切り]

2. タイトル: ...
   ...

5. タイトル: ...
   ...

注意点：
- 従来の職業名（医者、教師など）ではなく、より創造的で抽象的な概念を提案してください
- ユーザーの強みや興味を最大限に活かせる提案を心がけてください
- 社会的インパクトや自己実現の可能性を考慮してください
- 多様な選択肢を提供するため、5つの提案はそれぞれ異なる方向性を持つようにしてください
- ユーザーのフィードバックを最大限に反映させてください

JSON形式で回答してください。
`

    return prompt
  } catch (error) {
    console.error("Error generating refinement prompt:", error)
    throw error
  }
}

// APIレスポンスをパースする関数
export function parsePassionShuttleSuggestions(response: string) {
  try {
    // JSONレスポンスをパース
    return JSON.parse(response)
  } catch (error) {
    console.error("Error parsing passion shuttle suggestions:", error)

    // JSONパースに失敗した場合、テキストから構造化データを抽出する
    const suggestions = []
    const regex = /(\d+)\.\s+タイトル:\s+(.+?)[\r\n]+\s*説明:\s+(.+?)[\r\n]+\s*タグ:\s+(.+?)(?=[\r\n]+\d+\.|$)/gs

    let match
    while ((match = regex.exec(response)) !== null) {
      suggestions.push({
        title: match[2].trim(),
        description: match[3].trim(),
        tags: match[4].split(",").map((tag) => tag.trim()),
      })
    }

    if (suggestions.length === 0) {
      throw new Error("Failed to parse passion shuttle suggestions")
    }

    return suggestions
  }
}
