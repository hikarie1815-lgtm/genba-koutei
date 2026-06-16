"use client";

import { Site, calcProgress, colorForSite, shortDate } from "@/lib/types";

export default function SiteList({
  sites,
  onSelect,
}: {
  sites: Site[];
  onSelect: (s: Site) => void;
}) {
  if (sites.length === 0) {
    return (
      <div className="py-16 text-center text-gray-400 text-lg">
        まだ現場がありません。
        <br />
        「現場登録」から追加してください。
      </div>
    );
  }

  const sorted = [...sites].sort((a, b) =>
    a.start_date.localeCompare(b.start_date)
  );

  return (
    <div className="space-y-3">
      {sorted.map((s) => {
        const progress = calcProgress(s);
        const color = colorForSite(s.id);
        return (
          <div
            key={s.id}
            onClick={() => onSelect(s)}
            className="border-2 border-gray-200 rounded-xl p-4 active:bg-gray-50 cursor-pointer"
            style={{ borderLeft: `8px solid ${color}` }}
          >
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-lg font-bold leading-tight">{s.name}</h3>
              <span className="text-2xl font-bold" style={{ color }}>
                {progress}%
              </span>
            </div>

            <div className="mt-1 text-base text-gray-700">
              {s.manager && <span className="mr-3">担当：{s.manager}</span>}
              <span>
                {shortDate(s.start_date)} 〜 {shortDate(s.end_date)}
              </span>
            </div>

            {/* 進捗バー */}
            <div className="mt-2 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{ width: `${progress}%`, background: color }}
              />
            </div>

            {s.memo && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">{s.memo}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
