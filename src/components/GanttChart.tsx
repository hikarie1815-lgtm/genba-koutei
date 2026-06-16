"use client";

import { useMemo, useState } from "react";
import { Site, parseDate, colorForSite, today, shortDate } from "@/lib/types";

const DAY_W = 34;   // 1日あたりの幅(px)
const NAME_W = 116; // 現場名列の幅(px)

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

  const visible = useMemo(
    () =>
      sites
        .filter((s) => {
          const st = parseDate(s.start_date).getTime();
          const en = parseDate(s.end_date).getTime();
          return st <= monthEnd && en >= monthStart;
        })
        .sort((a, b) => a.start_date.localeCompare(b.start_date)),
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
          <div style={{ minWidth: NAME_W + daysInMonth * DAY_W }}>
            {/* 日付ヘッダー */}
            <div className="flex bg-genba-grid border-b border-genba-line">
              <div
                className="sticky left-0 z-20 bg-genba-grid border-r border-genba-line flex items-center justify-center text-sm font-bold"
                style={{ width: NAME_W, minWidth: NAME_W }}
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
                      width: DAY_W,
                      minWidth: DAY_W,
                      background: isToday ? "#fff3e0" : undefined,
                      borderLeft: isToday ? "2px solid #ff5722" : undefined,
                    }}
                  >
                    <span
                      className="text-sm font-bold leading-none"
                      style={{
                        color:
                          dow === 0 ? "#c62828" : dow === 6 ? "#1565c0" : "#1a1a1a",
                      }}
                    >
                      {d}
                    </span>
                    <span
                      className="text-[10px] leading-none mt-0.5"
                      style={{
                        color:
                          dow === 0 ? "#c62828" : dow === 6 ? "#1565c0" : "#888",
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
              const st = parseDate(s.start_date).getTime();
              const en = parseDate(s.end_date).getTime();
              const color = colorForSite(s.id);
              return (
                <div
                  key={s.id}
                  className="flex border-b border-genba-grid active:bg-blue-50 cursor-pointer"
                  onClick={() => onSelect(s)}
                >
                  <div
                    className="sticky left-0 z-10 bg-white border-r border-genba-line flex items-center px-2 text-sm font-bold"
                    style={{ width: NAME_W, minWidth: NAME_W, height: 44 }}
                  >
                    <span className="line-clamp-2 leading-tight">{s.name}</span>
                  </div>
                  {days.map((d) => {
                    const cur = new Date(ym.y, ym.m, d).getTime();
                    const active = cur >= st && cur <= en;
                    const isStart = active && (cur === st || d === 1);
                    const isEnd =
                      active && (cur === en || d === daysInMonth);
                    const isToday = d === todayDay;
                    return (
                      <div
                        key={d}
                        className="border-r border-genba-grid flex items-center"
                        style={{
                          width: DAY_W,
                          minWidth: DAY_W,
                          height: 44,
                          background: isToday ? "#fff8f3" : undefined,
                          borderLeft: isToday ? "2px solid #ff5722" : undefined,
                        }}
                      >
                        {active && (
                          <div
                            style={{
                              background: color,
                              height: 22,
                              width: "100%",
                              marginLeft: isStart ? 3 : 0,
                              marginRight: isEnd ? 3 : 0,
                              borderTopLeftRadius: isStart ? 6 : 0,
                              borderBottomLeftRadius: isStart ? 6 : 0,
                              borderTopRightRadius: isEnd ? 6 : 0,
                              borderBottomRightRadius: isEnd ? 6 : 0,
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
          {visible.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-2 text-sm cursor-pointer active:bg-gray-50 px-1 py-0.5 rounded"
              onClick={() => onSelect(s)}
            >
              <span
                className="inline-block rounded"
                style={{
                  width: 14,
                  height: 14,
                  background: colorForSite(s.id),
                }}
              />
              <span className="font-bold">{s.name}</span>
              <span className="text-gray-500">
                {shortDate(s.start_date)}〜{shortDate(s.end_date)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
