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

### npm installでの依存関係エラー

date-fnsとreact-day-pickerの依存関係の競合が発生する場合は、以下のいずれかの方法で解決できます：

1. package.jsonのdate-fnsのバージョンを3.x系に変更する：
   \`\`\`json
   "date-fns": "3.3.1"
   \`\`\`

2. --legacy-peer-depsオプションを使用してインストールする：
   \`\`\`bash
   npm install --legacy-peer-deps
   \`\`\`

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 連絡先

質問や問題がある場合は、Issueを作成するか、以下の連絡先までお問い合わせください：

- メール: your.email@example.com
- Twitter: @yourusername
