# LimitFree - 自己発見と成長のためのプラットフォーム

## 概要

LimitFreeは、ユーザーが自分自身の適性や性格を理解し、情熱を見つけ、具体的な行動計画（クエスト）を通じて成長するためのプラットフォームです。RIASEC職業適性診断、OCEAN性格分析、パッションシャトル、クエスト設計などの機能を提供し、AIチャットによるサポートも含まれています。

## 主な機能

- **ユーザー認証**: サインアップ、ログイン、ログアウト機能
- **RIASEC職業適性診断**: 6つの職業適性次元を測定
- **OCEAN性格分析**: 5つの性格特性を測定
- **パッションシャトル**: 興味・関心を組み合わせて新しい情熱を発見
- **クエスト設計**: 具体的な行動計画の作成と進捗管理
- **AIチャット**: 分析結果を踏まえたAIとの対話
- **ダークモード**: ダークテーマのサポート
- **デモモード**: 認証なしで機能を試せるモード

## 技術スタック

- **フロントエンド**: Next.js 14, React 19, Tailwind CSS
- **バックエンド**: Next.js API Routes, Supabase
- **認証**: Supabase Auth
- **データベース**: Supabase (PostgreSQL)
- **AI**: Anthropic Claude API
- **スタイリング**: Tailwind CSS, shadcn/ui
- **デプロイ**: Vercel

## プロジェクト構造と依存関係

### ディレクトリ構造

\`\`\`
limitfree/
├── app/                    # Next.js アプリケーションのルートディレクトリ
│   ├── ai-chat/            # AIチャット機能
│   ├── api/                # APIエンドポイント
│   ├── dashboard/          # ダッシュボード画面
│   ├── landing/            # ランディングページ
│   ├── ocean/              # OCEAN性格分析
│   │   ├── assessment/     # 評価ページ
│   │   └── results/        # 結果ページ
│   ├── passion-shuttle/    # パッションシャトル機能
│   ├── quest-setup/        # クエスト設定
│   │   ├── direction/      # 方向性設定
│   │   └── quests/         # クエスト一覧
│   ├── quests/             # クエスト管理
│   ├── riasec/             # RIASEC職業適性診断
│   │   ├── assessment/     # 評価ページ
│   │   └── results/        # 結果ページ
│   ├── globals.css         # グローバルCSS
│   ├── layout.tsx          # ルートレイアウト
│   └── page.tsx            # ホームページ
├── components/             # 再利用可能なコンポーネント
│   ├── auth/               # 認証関連コンポーネント
│   ├── theme-provider.tsx  # テーマプロバイダー
│   └── theme-toggle.tsx    # テーマ切り替えボタン
├── data/                   # 静的データ
│   └── app-data.json       # アプリケーションデータ
├── lib/                    # ユーティリティ関数とライブラリ
│   ├── app-data.ts         # アプリデータ操作
│   ├── ocean-data.ts       # OCEAN分析データ
│   ├── passion-shuttle.ts  # パッションシャトル機能
│   ├── riasec-data.ts      # RIASEC分析データ
│   ├── server-supabase.ts  # サーバーサイドSupabaseクライアント
│   ├── supabase.ts         # クライアントサイドSupabaseクライアント
│   └── utils.ts            # 汎用ユーティリティ
├── providers/              # Reactコンテキストプロバイダー
│   └── theme-provider.tsx  # テーマプロバイダー
├── public/                 # 静的ファイル
├── supabase/               # Supabase関連ファイル
│   └── migrations/         # データベースマイグレーション
├── tailwind.config.js      # Tailwind CSS設定
├── package.json            # 依存関係とスクリプト
└── README.md               # プロジェクト説明
\`\`\`

### 主要ファイルの説明

#### アプリケーションコア

| ファイル | 説明 |
|---------|------|
| `app/layout.tsx` | アプリケーションのルートレイアウト。メタデータ、プロバイダー、グローバルスタイルを設定 |
| `app/page.tsx` | ホームページ。認証状態に応じてダッシュボードまたはランディングページにリダイレクト |
| `app/dashboard/page.tsx` | ダッシュボード画面。ユーザーの進捗状況と利用可能な機能を表示 |
| `app/landing/page.tsx` | ランディングページ。未認証ユーザー向けの紹介ページ |

#### 認証関連

| ファイル | 説明 |
|---------|------|
| `components/auth/auth-check.tsx` | 認証状態を確認し、未認証ユーザーをリダイレクト |
| `components/auth/sign-in-form.tsx` | ログインフォーム |
| `components/auth/sign-up-form.tsx` | サインアップフォーム |
| `lib/supabase.ts` | クライアントサイドSupabaseクライアントと認証フック |
| `lib/server-supabase.ts` | サーバーサイドSupabaseクライアント |

#### RIASEC職業適性診断

| ファイル | 説明 |
|---------|------|
| `app/riasec/assessment/page.tsx` | RIASEC評価ページ。質問に回答して職業適性を測定 |
| `app/riasec/results/page.tsx` | RIASEC結果ページ。分析結果とグラフを表示 |
| `lib/riasec-data.ts` | RIASEC関連のデータと計算ロジック |

#### OCEAN性格分析

| ファイル | 説明 |
|---------|------|
| `app/ocean/assessment/page.tsx` | OCEAN評価ページ。質問に回答して性格特性を測定 |
| `app/ocean/results/page.tsx` | OCEAN結果ページ。分析結果とグラフを表示 |
| `lib/ocean-data.ts` | OCEAN関連のデータと計算ロジック |

#### パッションシャトル

| ファイル | 説明 |
|---------|------|
| `app/passion-shuttle/page.tsx` | パッションシャトル機能。興味・関心を組み合わせて新しい情熱を発見 |
| `lib/passion-shuttle.ts` | パッションシャトル関連のデータと計算ロジック |
| `app/api/passion-shuttle/suggest/route.ts` | 興味・関心の組み合わせ提案API |
| `app/api/passion-shuttle/refine/route.ts` | 提案の詳細化API |
| `app/api/passion-shuttle/save/route.ts` | 結果保存API |

#### クエスト機能

| ファイル | 説明 |
|---------|------|
| `app/quest-setup/direction/page.tsx` | クエスト方向性設定ページ |
| `app/quest-setup/quests/page.tsx` | クエスト設定ページ |
| `app/quests/page.tsx` | クエスト管理ページ |
| `app/api/quest/suggest-directions/route.ts` | クエスト方向性提案API |
| `app/api/quest/refine-directions/route.ts` | 方向性詳細化API |
| `app/api/quest/generate-quests/route.ts` | クエスト生成API |
| `app/api/quest/filter-quests/route.ts` | クエストフィルタリングAPI |

#### AIチャット

| ファイル | 説明 |
|---------|------|
| `app/ai-chat/page.tsx` | AIチャットページ。ユーザーとAIの対話インターフェース |
| `app/api/chat/route.ts` | チャットAPI。Anthropic Claude APIと連携 |

#### スタイリングとテーマ

| ファイル | 説明 |
|---------|------|
| `app/globals.css` | グローバルCSS |
| `tailwind.config.js` | Tailwind CSS設定 |
| `components/theme-toggle.tsx` | テーマ切り替えボタン |
| `providers/theme-provider.tsx` | テーマプロバイダー |

#### データベース

| ファイル | 説明 |
|---------|------|
| `supabase/migrations/20240509_create_chat_history.sql` | チャット履歴テーブル作成SQL |

### 依存関係グラフ

主要コンポーネント間の依存関係：

\`\`\`
app/page.tsx
├── lib/supabase.ts (認証状態確認)
└── app/dashboard/page.tsx (認証済みユーザー向け)
    ├── components/auth/auth-check.tsx (認証確認)
    ├── lib/riasec-data.ts (RIASEC結果取得)
    ├── lib/ocean-data.ts (OCEAN結果取得)
    └── lib/passion-shuttle.ts (パッションシャトル結果取得)

app/riasec/assessment/page.tsx
├── components/auth/auth-check.tsx
└── lib/riasec-data.ts

app/riasec/results/page.tsx
├── components/auth/auth-check.tsx
└── lib/riasec-data.ts

app/ocean/assessment/page.tsx
├── components/auth/auth-check.tsx
└── lib/ocean-data.ts

app/ocean/results/page.tsx
├── components/auth/auth-check.tsx
└── lib/ocean-data.ts

app/passion-shuttle/page.tsx
├── components/auth/auth-check.tsx
└── lib/passion-shuttle.ts

app/ai-chat/page.tsx
├── components/auth/auth-check.tsx
├── lib/riasec-data.ts
├── lib/ocean-data.ts
└── lib/passion-shuttle.ts
\`\`\`

### 外部依存関係

主要な外部パッケージ依存関係：

| パッケージ | 用途 |
|-----------|------|
| `next` | Webフレームワーク |
| `react`, `react-dom` | UIライブラリ |
| `@supabase/supabase-js` | Supabase連携 |
| `ai`, `@ai-sdk/anthropic` | AI連携 |
| `recharts` | グラフ描画 |
| `tailwindcss` | CSSフレームワーク |
| `next-themes` | テーマ管理 |
| `zod` | スキーマ検証 |
| `react-hook-form` | フォーム管理 |
| `lucide-react` | アイコン |

## 開発環境のセットアップ

### 前提条件

- Node.js 18.x以上
- npm 9.x以上
- Supabaseアカウント
- Anthropic Claude APIキー（オプション）

### インストール手順

1. リポジトリをクローン

\`\`\`bash
git clone https://github.com/yourusername/limitfree.git
cd limitfree
\`\`\`

2. 依存関係をインストール

\`\`\`bash
npm install
\`\`\`

3. 環境変数の設定

`.env.local`ファイルをプロジェクトのルートに作成し、以下の環境変数を設定します：

\`\`\`
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Anthropic
ANTHROPIC_API_KEY=your_anthropic_api_key

# デモモード (オプション)
NEXT_PUBLIC_DEMO_MODE=false
\`\`\`

4. Supabaseのセットアップ

Supabaseプロジェクトを作成し、必要なテーブルを作成します。`supabase/migrations`ディレクトリ内のSQLファイルを実行してテーブルを作成できます。

5. 開発サーバーの起動

\`\`\`bash
npm run dev
\`\`\`

これで開発サーバーが起動し、`http://localhost:3000`でアプリケーションにアクセスできます。

## 本番環境へのデプロイ

### Vercelへのデプロイ

1. Vercelアカウントを作成し、Vercel CLIをインストール

\`\`\`bash
npm install -g vercel
\`\`\`

2. Vercelにログイン

\`\`\`bash
vercel login
\`\`\`

3. プロジェクトをデプロイ

\`\`\`bash
vercel
\`\`\`

デプロイ中に環境変数の設定を求められます。開発環境と同じ環境変数を設定してください。

### 環境変数の設定

Vercelダッシュボードから以下の環境変数を設定します：

- `NEXT_PUBLIC_SUPABASE_URL`: SupabaseプロジェクトのURL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseの匿名キー
- `SUPABASE_SERVICE_ROLE_KEY`: Supabaseのサービスロールキー
- `ANTHROPIC_API_KEY`: Anthropic Claude APIキー
- `NEXT_PUBLIC_DEMO_MODE`: デモモードの有効/無効（true/false）

### Supabaseの設定

1. Supabaseプロジェクトを作成

2. 必要なテーブルを作成

`supabase/migrations`ディレクトリ内のSQLファイルをSupabaseのSQLエディタで実行します。

3. 認証設定

Supabaseダッシュボードから認証設定を行います：
- メール認証を有効化
- サイトURLをVercelのデプロイURLに設定

### 変更が必要なファイル

デプロイ時に特に注意が必要なファイルと設定：

1. `lib/supabase.ts`
   - 環境変数が正しく設定されていることを確認
   - デモモードの設定が意図通りになっていることを確認

2. `app/api/chat/route.ts`
   - AI APIキーが正しく設定されていることを確認
   - レスポンスタイムアウトの設定が適切か確認

3. `next.config.js`
   - 必要に応じてビルド設定を調整

## デプロイ後の変更と再デプロイ

### コード変更後の再デプロイ

1. 変更をコミット

\`\`\`bash
git add .
git commit -m "変更内容の説明"
\`\`\`

2. Vercelに再デプロイ

\`\`\`bash
vercel
\`\`\`

または、GitHubと連携している場合は、変更をプッシュするだけで自動的にデプロイされます：

\`\`\`bash
git push origin main
\`\`\`

### 環境変数の変更

1. Vercelダッシュボードにアクセス
2. プロジェクト設定 > 環境変数を選択
3. 環境変数を追加または更新
4. 「Save」をクリックして保存
5. プロジェクトを再デプロイ

### データベーススキーマの変更

1. 新しいマイグレーションSQLファイルを作成
2. SupabaseのSQLエディタで実行
3. 必要に応じてアプリケーションコードを更新
4. 変更をコミットして再デプロイ

## トラブルシューティング

### よくある問題と解決策

1. **認証エラー**
   - Supabase URLと匿名キーが正しいか確認
   - サイトURLがVercelのデプロイURLと一致しているか確認

2. **APIエラー**
   - APIキーが正しく設定されているか確認
   - レート制限に達していないか確認

3. **データベース接続エラー**
   - Supabase接続情報が正しいか確認
   - テーブルが正しく作成されているか確認

4. **ビルドエラー**
   - 依存関係が最新か確認
   - TypeScriptエラーがないか確認

5. **無限ローディング問題**
   - ブラウザのコンソールでエラーを確認
   - デモモードを有効にして機能をテスト
   - ローカルストレージをクリアしてみる

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 連絡先

質問や問題がある場合は、Issueを作成するか、以下の連絡先までお問い合わせください：

- メール: your.email@example.com
- Twitter: @yourusername
