# 株式会社樹 現場工程管理アプリ

現場名を登録すると、工程表（ガントチャート）へ自動で反映されるアプリです。
データは Supabase に保存され、複数の端末でリアルタイムに同期されます。

- 技術構成：Next.js 15 / TypeScript / TailwindCSS / Supabase
- 対応端末：iPhone・Android・iPad・PC（ブラウザで動作）

---

## できること

- **現場登録**：現場名・担当者・開始日・終了日・メモを入力して登録
- **工程表**：登録した現場が月別ガントチャートに自動表示（月切替・横スクロール）
- **現場一覧**：カード形式で進捗率つき表示
- **編集／削除**：現場名をタップして編集・削除（工程表からも自動で消えます）

---

## セットアップ手順

### ステップ1：Supabase でデータの保存先を作る

1. https://supabase.com にログイン
2. 「New project」で新しいプロジェクトを作成（名前は `genba-koutei` など）
3. 左メニューの **SQL Editor** を開く
4. このフォルダ内の `supabase/schema.sql` の中身をすべてコピーして貼り付け
5. 右下の **Run** を押す（テーブル `sites` が作られます）

### ステップ2：接続情報をメモする

1. 左メニューの **Settings（歯車）→ API** を開く
2. 次の2つをコピーしておく
   - **Project URL**（`https://xxxx.supabase.co`）
   - **anon public** キー（`eyJ...` で始まる長い文字列）

### ステップ3：Vercel で公開する（スマホで使えるようにする）

1. このフォルダを GitHub にアップロードする
   （GitHub Desktop か、PowerShell で git push）
2. https://vercel.com にログイン →「Add New → Project」
3. アップした GitHub リポジトリを選んで「Import」
4. **Environment Variables（環境変数）** に次の2つを追加
   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_SUPABASE_URL` | ステップ2の Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ステップ2の anon public キー |
5. 「Deploy」を押す → 数分で公開URLが発行されます

### ステップ4：スマホのホーム画面に追加

- 公開URLをスマホのブラウザで開く
- iPhone：共有ボタン →「ホーム画面に追加」
- Android：メニュー →「ホーム画面に追加」

これでアプリのように使えます。

---

## PCで先に試したい場合（任意）

1. このフォルダ直下に `.env.local` というファイルを作る
   （`.env.local.example` をコピーして名前を変えると簡単です）
2. 中身を自分の接続情報に書き換える
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
3. PowerShell でこのフォルダに移動して以下を実行
   ```
   npm install
   npm run dev
   ```
4. ブラウザで http://localhost:3000 を開く

---

## 今後の追加について

人員管理・重機管理・日報管理・利益管理を後から足せる構造になっています。
`supabase/schema.sql` の下部に、それぞれのテーブル例をコメントで用意してあります。
追加したくなったら、そのコメントを参考にテーブルと画面を増やせます。
