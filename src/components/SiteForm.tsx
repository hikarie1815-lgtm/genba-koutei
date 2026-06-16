"use client";

import { useState } from "react";
import { SiteInput, Period, formatDate, today } from "@/lib/types";

const label = "block text-base font-bold mb-1 text-genba-ink";
const field =
  "w-full px-3 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-genba-accent focus:outline-none";

export default function SiteForm({
  onSubmit,
}: {
  onSubmit: (input: SiteInput) => Promise<void>;
}) {
  const t = formatDate(today());
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [memo, setMemo] = useState("");
  const [workSat, setWorkSat] = useState(false);
  const [workSun, setWorkSun] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([{ start: t, end: t }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setManager("");
    setMemo("");
    setWorkSat(false);
    setWorkSun(false);
    setPeriods([{ start: t, end: t }]);
  };

  const updatePeriod = (i: number, key: "start" | "end", val: string) => {
    setPeriods((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, [key]: val } : p))
    );
  };
  const addPeriod = () => {
    const last = periods[periods.length - 1];
    setPeriods((prev) => [...prev, { start: last.end, end: last.end }]);
  };
  const removePeriod = (i: number) => {
    setPeriods((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("現場名を入力してください");
      return;
    }
    for (const p of periods) {
      if (p.end < p.start) {
        setError("終了日は開始日より後にしてください");
        return;
      }
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        manager: manager.trim(),
        memo: memo.trim(),
        periods,
        work_sat: workSat,
        work_sun: workSun,
      });
      reset();
    } catch {
      setError("保存に失敗しました。通信を確認してください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className={label}>現場名 ※必須</label>
        <input
          className={field}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例）横須賀基地伐採工事"
        />
      </div>

      <div>
        <label className={label}>担当者</label>
        <input
          className={field}
          value={manager}
          onChange={(e) => setManager(e.target.value)}
          placeholder="例）橋本"
        />
      </div>

      {/* 工期（複数追加可能） */}
      <div>
        <label className={label}>工期（飛び飛びの場合は追加）</label>
        <div className="space-y-3">
          {periods.map((p, i) => (
            <div
              key={i}
              className="border-2 border-gray-200 rounded-lg p-3 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-genba-accent">
                  工期 {i + 1}
                </span>
                {periods.length > 1 && (
                  <button
                    onClick={() => removePeriod(i)}
                    className="text-red-600 font-bold text-sm px-2 py-1 active:bg-red-50 rounded"
                  >
                    削除
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-sm text-gray-600">開始日</span>
                  <input
                    type="date"
                    className={field}
                    value={p.start}
                    onChange={(e) => updatePeriod(i, "start", e.target.value)}
                  />
                </div>
                <div>
                  <span className="text-sm text-gray-600">終了日</span>
                  <input
                    type="date"
                    className={field}
                    value={p.end}
                    onChange={(e) => updatePeriod(i, "end", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={addPeriod}
          className="mt-2 w-full py-3 text-base font-bold text-genba-accent border-2 border-genba-accent border-dashed rounded-lg active:bg-blue-50"
        >
          ＋ 工期を追加
        </button>
      </div>

      {/* 土日の作業設定 */}
      <div>
        <label className={label}>作業する曜日</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWorkSat((v) => !v)}
            className={`py-3 text-lg font-bold rounded-lg border-2 ${
              workSat
                ? "bg-genba-accent text-white border-genba-accent"
                : "bg-white text-gray-500 border-gray-300"
            }`}
          >
            土曜も作業 {workSat ? "ON" : "OFF"}
          </button>
          <button
            type="button"
            onClick={() => setWorkSun((v) => !v)}
            className={`py-3 text-lg font-bold rounded-lg border-2 ${
              workSun
                ? "bg-genba-accent text-white border-genba-accent"
                : "bg-white text-gray-500 border-gray-300"
            }`}
          >
            日曜も作業 {workSun ? "ON" : "OFF"}
          </button>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          OFFの曜日は工程表でバーが消えます
        </p>
      </div>

      <div>
        <label className={label}>メモ</label>
        <textarea
          className={field}
          rows={3}
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          placeholder="作業内容や注意事項など"
        />
      </div>

      {error && (
        <div className="text-red-600 font-bold text-center">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={saving}
        className="w-full py-4 text-xl font-bold text-white bg-genba-accent rounded-xl active:opacity-80 disabled:opacity-50"
      >
        {saving ? "保存中…" : "登録する"}
      </button>
    </div>
  );
}
