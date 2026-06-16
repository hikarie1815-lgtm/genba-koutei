import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 未設定でもビルド/起動が落ちないようにプレースホルダを使用
export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  anonKey || "placeholder-anon-key"
);

// 実際に設定済みかどうか（画面の出し分けに使用）
export const isSupabaseConfigured = Boolean(url && anonKey);
