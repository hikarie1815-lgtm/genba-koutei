"use client";

import { useState } from "react";
import { Site, SiteInput, Period, getPeriods } from "@/lib/types";

const label = "block text-base font-bold mb-1 text-genba-ink";
const field =
  "w-full px-3 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-genba-accent focus:outline-none";

export default function SiteEditModal({
  site,
  onSave,
  onDelete,
  onClose,
}: {
  site: Site;
  onSave: (id: string, input: SiteInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(site.name);
  const [manager, setManager] = useState(site.manager);
  const [memo, setMemo] = useState(site.memo);
  const [periods, setPeriods] = useState<Period[]>(getPeriods(site));
  const [workSat, setWorkSat] = useState(site.work_sat ?? false);
  const [workSun, setWorkSun] = useState(site.work_sun ?? false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

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

  const handleSave = async () => {
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
    setBusy(true);
    try {
      await onSave(site.id, {
        name: name.trim(),
        manager: manager.trim(),
        memo: memo.trim(),
        periods,
        work_sat: workSat,
        work_sun: workSun,
      });
      onClose();
    } catch {
      setError("保存に失敗しました。");
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await onDelete(site.id);
      onClose();
    } catch {
      setError("削除に失敗しました。");
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <h2 className="text-xl font-bold">現場を編集</h2>
          <button
            onClick={onClose}
            className="text-2xl px-2 text-gray-500 active:text-gray-800"
            aria-label="閉じる"
          >
            ×
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className={label}>現場名 ※必須</label>
            <input
              className={field}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className={label}>担当者</label>
            <input
              className={field}
              value={manager}
              onChange={(e) => setManager(e.target.value)}
            />
          </div>

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
                        onChange={(e) =>
                          updatePeriod(i, "start", e.target.value)
                        }
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
          </div>

          <div>
            <label className={label}>メモ</label>
            <textarea
              className={field}
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-600 font-bold text-center">{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={busy}
            className="w-full py-4 text-xl font-bold text-white bg-genba-accent rounded-xl active:opacity-80 disabled:opacity-50"
          >
            {busy ? "処理中…" : "保存する"}
          </button>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={busy}
              className="w-full py-3 text-lg font-bold text-red-600 border-2 border-red-300 rounded-xl active:bg-red-50 disabled:opacity-50"
            >
              この現場を削除
            </button>
          ) : (
            <div className="border-2 border-red-300 rounded-xl p-3 space-y-2">
              <p className="text-center font-bold text-red-600">
                本当に削除しますか？
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={busy}
                  className="py-3 font-bold border-2 border-gray-300 rounded-xl active:bg-gray-50"
                >
                  やめる
                </button>
                <button
                  onClick={handleDelete}
                  disabled={busy}
                  className="py-3 font-bold text-white bg-red-600 rounded-xl active:opacity-80 disabled:opacity-50"
                >
                  削除する
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
