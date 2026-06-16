// 現場データの型
export interface Site {
  id: string;
  name: string;
  manager: string;
  start_date: string; // "YYYY-MM-DD"
  end_date: string;   // "YYYY-MM-DD"
  memo: string;
  created_at: string;
}

// 新規登録・編集時の入力型
export interface SiteInput {
  name: string;
  manager: string;
  start_date: string;
  end_date: string;
  memo: string;
}

// "YYYY-MM-DD" を Date(0時) に
export function parseDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

// Date を "YYYY-MM-DD" に
export function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// "6/1" のような短縮表示
export function shortDate(s: string): string {
  const d = parseDate(s);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// 今日(0時)
export function today(): Date {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
}

// 進捗率(0〜100)を開始日・終了日・今日から自動計算
export function calcProgress(site: Site): number {
  const start = parseDate(site.start_date).getTime();
  const end = parseDate(site.end_date).getTime();
  const now = today().getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  if (end === start) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

// 現場名から安定した色を割り当て（ガントバー用）
const BAR_COLORS = [
  "#1565c0", // 青
  "#2e7d32", // 緑
  "#e65100", // オレンジ
  "#6a1b9a", // 紫
  "#00838f", // ティール
  "#c62828", // 赤
  "#558b2f", // 黄緑
  "#4527a0", // 藍
];

export function colorForSite(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return BAR_COLORS[Math.abs(hash) % BAR_COLORS.length];
}
