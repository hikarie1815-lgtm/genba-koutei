-- ============================================
-- 株式会社樹 現場工程管理アプリ
-- Supabase テーブル定義
-- Supabase管理画面 → SQL Editor に貼り付けて [Run]
-- ============================================

-- 現場テーブル（今回実装する唯一のテーブル）
create table if not exists sites (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,            -- 現場名
  manager     text default '',          -- 担当者
  start_date  date not null,            -- 開始日
  end_date    date not null,            -- 終了日
  memo        text default '',          -- メモ
  created_at  timestamptz default now()
);

-- 並び順を開始日順にしておくためのインデックス
create index if not exists sites_start_date_idx on sites (start_date);

-- 社内ツールのため全操作を許可（ログイン不要で使う想定）
alter table sites enable row level security;

drop policy if exists "allow all" on sites;
create policy "allow all" on sites
  for all using (true) with check (true);

-- リアルタイム同期を有効化
alter publication supabase_realtime add table sites;


-- ============================================
-- ↓↓↓ 将来追加する場合のテーブル例（今は不要・コメントのまま）
-- ============================================
--
-- 人員管理: 現場(site_id)に作業員を紐づける
-- create table staff (
--   id uuid primary key default gen_random_uuid(),
--   site_id uuid references sites(id) on delete cascade,
--   name text not null,
--   role text,
--   created_at timestamptz default now()
-- );
--
-- 重機管理:
-- create table equipment (
--   id uuid primary key default gen_random_uuid(),
--   site_id uuid references sites(id) on delete cascade,
--   name text not null,        -- ユンボ、トラック等
--   created_at timestamptz default now()
-- );
--
-- 日報管理:
-- create table daily_reports (
--   id uuid primary key default gen_random_uuid(),
--   site_id uuid references sites(id) on delete cascade,
--   report_date date not null,
--   content text,
--   created_at timestamptz default now()
-- );
