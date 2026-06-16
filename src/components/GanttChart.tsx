"use client";

import { useMemo, useState } from "react";
import {
  Site,
  parseDate,
  colorForSite,
  today,
  shortDate,
  getPeriods,
  siteRange,
  isWorkday,
} from "@/lib/types";

const MIN_DAY_W = 20; // 1日の最小幅(px)。広い画面では自動で広がり1ヶ月が1画面に収まる
const NAME_W = 100;   // 現場名列の幅(px)

export default function GanttChart({
  sites,
  onSelect,
}: {
  sites: Site[];
  onSelect: (s: Site) => void;
}) {
  const [ym, setYm] = useState(() => {
    const t = today();
    return { y: t.getFullYear(), m: t.getMonth() };
  });

  const daysInMonth = new Date(ym.y, ym.m + 1, 0).getDate();
  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  );

  const monthStart = new Date(ym.y, ym.m, 1).getTime();
  const monthEnd = new Date(ym.y, ym.m, daysInMonth).getTime();

  // この月に1つでも工期がかかる現場
  const visible = useMemo(
    () =>
      sites
        .filter((s) =>
          getPeriods(s).some((p) => {
            const st = parseDate(p.start).getTime();
            const en = parseDate(p.end).getTime();
            return st <= monthEnd && en >= monthStart;
          })
        )
        .sort((a, b) => {
          const ra = siteRange(getPeriods(a)).start;
          const rb = siteRange(getPeriods(b)).start;
          return ra.localeCompare(rb);
        }),
    [sites, monthStart, monthEnd]
  );

  const t = today();
  const todayDay =
    t.getFullYear() === ym.y && t.getMonth() === ym.m ? t.getDate() : null;

  const prevMonth = () =>
    setYm((p) => {
      const d = new Date(p.y, p.m - 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const nextMonth = () =>
    setYm((p) => {
      const d = new Date(p.y, p.m + 1, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });
  const goThisMonth = () => {
    const n = today();
    setYm({ y: n.getFullYear(), m: n.getMonth() });
  };

  // ある日が作業日か（工期内 かつ 土日設定を満たす）
  const isActiveDay = (s: Site, day: number) => {
    if (day < 1 || day > daysInMonth) return false;
    const dow = new Date(ym.y, ym.m, day).getDay();
    if (!isWorkday(s, dow)) return false;
    const cur = new Date(ym.y, ym.m, day).getTime();
    return getPeriods(s).some((p) => {
      const st = parseDate(p.start).getTime();
      const en = parseDate(p.end).getTime();
      return cur >= st && cur <= en;
    });
  };

  // ある日付のバー表示情報（端は角丸）
  const dayInfo = (s: Site, day: number) => {
    const active = isActiveDay(s, day);
    const isStart = active && !isActiveDay(s, day - 1);
    const isEnd = active && !isActiveDay(s, day + 1);
    return { active, isStart, isEnd };
  };

  return (
    <div>
      {/* 月ナビ */}
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="px-4 py-3 text-xl font-bold bg-gray-100 rounded-lg active:bg-gray-200"
          aria-label="前の月"
        >
          ‹
        </button>
        <button
          onClick={goThisMonth}
          className="text-2xl font-bold tracking-wide"
        >
          {ym.y}年 {ym.m + 1}月
        </button>
        <button
          onClick={nextMonth}
          className="px-4 py-3 text-xl font-bold bg-gray-100 rounded-lg active:bg-gray-200"
          aria-label="次の月"
        >
          ›
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-lg">
          この月の現場はありません
        </div>
      ) : (
        <div className="scroll-x border border-genba-line rounded-lg">
          <div style={{ minWidth: "100%" }}>
            {/* 日付ヘッダー */}
            <div className="flex bg-genba-grid border-b border-genba-line">
              <div
                className="sticky left-0 z-20 bg-genba-grid border-r border-genba-line flex items-center justify-center text-xs font-bold"
                style={{ flex: `0 0 ${NAME_W}px` }}
              >
                現場名
              </div>
              {days.map((d) => {
                const dow = new Date(ym.y, ym.m, d).getDay();
                const isToday = d === todayDay;
                return (
                  <div
                    key={d}
                    className="flex flex-col items-center justify-center py-1 border-r border-genba-grid"
                    style={{
                      flex: `1 0 ${MIN_DAY_W}px`,
                      background: isToday ? "#fff3e0" : undefined,
                      borderLeft: isToday ? "2px solid #ff5722" : undefined,
                    }}
                  >
                    <span
                      className="text-xs font-bold leading-none"
                      style={{
                        color:
                          dow === 0 ? "#c62828" : dow === 6 ? "#1565c0" : "#1a1a1a",
                      }}
                    >
                      {d}
                    </span>
                    <span
                      className="text-[9px] leading-none mt-0.5"
                      style={{
                        color:
                          dow === 0 ? "#c62828" : dow === 6 ? "#1565c0" : "#999",
                      }}
                    >
                      {"日月火水木金土"[dow]}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 現場ごとの行 */}
            {visible.map((s) => {
              const color = colorForSite(s.id);
              return (
                <div
                  key={s.id}
                  className="flex border-b border-genba-grid active:bg-blue-50 cursor-pointer"
                  onClick={() => onSelect(s)}
                >
                  <div
                    className="sticky left-0 z-10 bg-white border-r border-genba-line flex items-center px-1.5 text-xs font-bold"
                    style={{ flex: `0 0 ${NAME_W}px`, height: 44 }}
                  >
                    <span className="line-clamp-2 leading-tight">{s.name}</span>
                  </div>
                  {days.map((d) => {
                    const info = dayInfo(s, d);
                    const isToday = d === todayDay;
                    return (
                      <div
                        key={d}
                        className="border-r border-genba-grid flex items-center"
                        style={{
                          flex: `1 0 ${MIN_DAY_W}px`,
                          height: 44,
                          background: isToday ? "#fff8f3" : undefined,
                          borderLeft: isToday ? "2px solid #ff5722" : undefined,
                        }}
                      >
                        {info.active && (
                          <div
                            style={{
                              background: color,
                              height: 22,
                              width: "100%",
                              marginLeft: info.isStart ? 2 : 0,
                              marginRight: info.isEnd ? 2 : 0,
                              borderTopLeftRadius: info.isStart ? 5 : 0,
                              borderBottomLeftRadius: info.isStart ? 5 : 0,
                              borderTopRightRadius: info.isEnd ? 5 : 0,
                              borderBottomRightRadius: info.isEnd ? 5 : 0,
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 凡例 */}
      {visible.length > 0 && (
        <div className="mt-3 space-y-1">
          {visible.map((s) => {
            const periods = getPeriods(s);
            return (
              <div
                key={s.id}
                className="flex items-center gap-2 text-sm cursor-pointer active:bg-gray-50 px-1 py-0.5 rounded"
                onClick={() => onSelect(s)}
              >
                <span
                  className="inline-block rounded shrink-0"
                  style={{ width: 14, height: 14, background: colorForSite(s.id) }}
                />
                <span className="font-bold">{s.name}</span>
                <span className="text-gray-500">
                  {periods
                    .map((p) => `${shortDate(p.start)}〜${shortDate(p.end)}`)
                    .join("、")}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
