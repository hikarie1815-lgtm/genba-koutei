-- sites テーブルに「複数工期」と「土日作業フラグ」の列を追加
-- Supabase → SQL Editor に貼って Run
alter table sites add column if not exists periods jsonb default '[]'::jsonb;
alter table sites add column if not exists work_sat boolean default false;
alter table sites add column if not exists work_sun boolean default false;
