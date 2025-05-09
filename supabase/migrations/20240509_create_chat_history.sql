CREATE TABLE IF NOT EXISTS chat_history (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT fk_user
    FOREIGN KEY (user_id)
    REFERENCES auth.users(id)
    ON DELETE CASCADE
);

-- インデックスを作成
CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);
CREATE INDEX idx_chat_history_created_at ON chat_history(created_at);

-- RLSポリシーを設定
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- ユーザーは自分のチャット履歴のみ読み取り可能
CREATE POLICY "Users can view their own chat history"
  ON chat_history
  FOR SELECT
  USING (auth.uid() = user_id);

-- ユーザーは自分のチャット履歴のみ作成可能
CREATE POLICY "Users can insert their own chat history"
  ON chat_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分のチャット履歴のみ削除可能
CREATE POLICY "Users can delete their own chat history"
  ON chat_history
  FOR DELETE
  USING (auth.uid() = user_id);
