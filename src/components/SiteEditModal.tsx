"use client";

import { useState } from "react";
import { Site, SiteInput } from "@/lib/types";

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
  const [startDate, setStartDate] = useState(site.start_date);
  const [endDate, setEndDate] = useState(site.end_date);
  const [memo, setMemo] = useState(site.memo);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!name.trim()) {
      setError("現場名を入力してください");
      return;
    }
    if (endDate < startDate) {
      setError("終了日は開始日より後にしてください");
      return;
    }
    setBusy(true);
    try {
      await onSave(site.id, {
        name: name.trim(),
        manager: manager.trim(),
        start_date: startDate,
        end_date: endDate,
        memo: memo.trim(),
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>開始日</label>
              <input
                type="date"
                className={field}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className={label}>終了日</label>
              <input
                type="date"
                className={field}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
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

          {/* 削除 */}
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
