// 工期（1つの作業期間）
export interface Period {
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
}

// 現場データの型
export interface Site {
  id: string;
  name: string;
  manager: string;
  start_date: string; // 全工期の最小開始日（並び替え・互換用）
  end_date: string;   // 全工期の最大終了日（互換用）
  memo: string;
  periods: Period[];  // 工期（飛び飛び対応）
  work_sat: boolean;  // 土曜も作業する
  work_sun: boolean;  // 日曜も作業する
  created_at: string;
}

// 新規登録・編集時の入力型
export interface SiteInput {
  name: string;
  manager: string;
  memo: string;
  periods: Period[];
  work_sat: boolean;
  work_sun: boolean;
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

// 現場の工期一覧を取得（古いデータ＝periods空なら start/end を1工期として返す）
export function getPeriods(site: Site): Period[] {
  if (site.periods && site.periods.length > 0) {
    return [...site.periods].sort((a, b) => a.start.localeCompare(b.start));
  }
  return [{ start: site.start_date, end: site.end_date }];
}

// 全工期から最小開始日・最大終了日を求める
export function siteRange(periods: Period[]): { start: string; end: string } {
  const starts = periods.map((p) => p.start).sort();
  const ends = periods.map((p) => p.end).sort();
  return { start: starts[0], end: ends[ends.length - 1] };
}

// 指定日が「作業日」か（曜日設定を考慮）。dowは0=日,6=土
export function isWorkday(site: Site, dow: number): boolean {
  if (dow === 6 && !site.work_sat) return false;
  if (dow === 0 && !site.work_sun) return false;
  return true;
}

// 進捗率(0〜100)を全工期の範囲と今日から計算
export function calcProgress(site: Site): number {
  const periods = getPeriods(site);
  const { start: s, end: e } = siteRange(periods);
  const start = parseDate(s).getTime();
  const end = parseDate(e).getTime();
  const now = today().getTime();
  if (now <= start) return 0;
  if (now >= end) return 100;
  if (end === start) return 100;
  return Math.round(((now - start) / (end - start)) * 100);
}

// 現場名から安定した色を割り当て（ガントバー用）
const BAR_COLORS = [
  "#e65100", // オレンジ
  "#1565c0", // 青
  "#2e7d32", // 緑
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
