"use client";

import { useState } from "react";
import { SiteInput, formatDate, today } from "@/lib/types";

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
  const [startDate, setStartDate] = useState(t);
  const [endDate, setEndDate] = useState(t);
  const [memo, setMemo] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setManager("");
    setStartDate(t);
    setEndDate(t);
    setMemo("");
  };

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) {
      setError("現場名を入力してください");
      return;
    }
    if (endDate < startDate) {
      setError("終了日は開始日より後にしてください");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        name: name.trim(),
        manager: manager.trim(),
        start_date: startDate,
        end_date: endDate,
        memo: memo.trim(),
      });
      reset();
    } catch (e) {
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
