"use client";

import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Site, SiteInput, siteRange } from "@/lib/types";
import GanttChart from "@/components/GanttChart";
import SiteForm from "@/components/SiteForm";
import SiteList from "@/components/SiteList";
import SiteEditModal from "@/components/SiteEditModal";

type Tab = "gantt" | "list" | "new";

export default function Page() {
  const [sites, setSites] = useState<Site[]>([]);
  const [tab, setTab] = useState<Tab>("gantt");
  const [editing, setEditing] = useState<Site | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data } = await supabase
        .from("sites")
        .select("*")
        .order("start_date", { ascending: true });
      setSites((data as Site[]) ?? []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("sites-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sites" },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // periods から start_date(最小)・end_date(最大) を導出して保存
  const toRow = (input: SiteInput) => {
    const { start, end } = siteRange(input.periods);
    return {
      name: input.name,
      manager: input.manager,
      memo: input.memo,
      periods: input.periods,
      work_sat: input.work_sat,
      work_sun: input.work_sun,
      start_date: start,
      end_date: end,
    };
  };

  const addSite = async (input: SiteInput) => {
    const { error } = await supabase.from("sites").insert(toRow(input));
    if (error) throw error;
    setTab("gantt");
  };

  const updateSite = async (id: string, input: SiteInput) => {
    const { error } = await supabase
      .from("sites")
      .update(toRow(input))
      .eq("id", id);
    if (error) throw error;
  };

  const deleteSite = async (id: string) => {
    const { error } = await supabase.from("sites").delete().eq("id", id);
    if (error) throw error;
  };

  if (!isSupabaseConfigured) {
    return (
      <main className="max-w-xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">セットアップが必要です</h1>
        <p className="text-lg leading-relaxed">
          <code>.env.local</code> に Supabase の接続情報を設定してください。
          <br />
          詳しくは同梱の <strong>README.md</strong> を参照してください。
        </p>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto pb-24">
      <header className="bg-genba-ink text-white px-4 py-3 sticky top-0 z-30">
        <h1 className="text-xl font-bold">株式会社樹 現場工程管理</h1>
      </header>

      <nav className="flex border-b-2 border-gray-200 sticky top-[52px] bg-white z-20">
        {(
          [
            ["gantt", "工程表"],
            ["list", "現場一覧"],
            ["new", "現場登録"],
          ] as [Tab, string][]
        ).map(([key, name]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 py-3 text-lg font-bold border-b-4 ${
              tab === key
                ? "border-genba-accent text-genba-accent"
                : "border-transparent text-gray-500"
            }`}
          >
            {name}
          </button>
        ))}
      </nav>

      <div className="p-4">
        {loading ? (
          <div className="py-16 text-center text-gray-400 text-lg">
            読み込み中…
          </div>
        ) : tab === "gantt" ? (
          <GanttChart sites={sites} onSelect={setEditing} />
        ) : tab === "list" ? (
          <SiteList sites={sites} onSelect={setEditing} />
        ) : (
          <SiteForm onSubmit={addSite} />
        )}
      </div>

      {editing && (
        <SiteEditModal
          site={editing}
          onSave={updateSite}
          onDelete={deleteSite}
          onClose={() => setEditing(null)}
        />
      )}
    </main>
  );
}
