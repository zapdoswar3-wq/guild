"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "todos") next.delete(key);
    else next.set(key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  return { params, update };
}

function DateFilterInner({ fallback }: { fallback: string }) {
  const { params, update } = useQueryUpdater();
  const value = params.get("data") || fallback;

  return (
    <label className="flex items-center gap-2 text-xs text-[#8B91A7]">
      Data
      <Input
        type="date"
        value={value}
        aria-label="Selecionar data"
        className="w-[11.5rem] bg-[#0F1117]"
        onChange={(event) => update("data", event.target.value)}
      />
    </label>
  );
}

export function DateFilter({ fallback }: { fallback: string }) {
  return (
    <Suspense fallback={<div className="h-8 w-40 rounded-lg bg-[#1A1D27]" />}>
      <DateFilterInner fallback={fallback} />
    </Suspense>
  );
}

function FilterBarInner({
  placeholder,
  guilds,
  statuses,
  showDate = false,
  dateFallback,
}: {
  placeholder: string;
  guilds?: { id: string; nome: string }[];
  statuses?: readonly string[];
  showDate?: boolean;
  dateFallback?: string;
}) {
  const { params, update } = useQueryUpdater();
  const query = params.get("q") ?? "";
  const [text, setText] = useState(query);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    setText(query);
  }, [query]);

  useEffect(() => {
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  function onSearch(value: string) {
    setText(value);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => update("q", value), 300);
  }

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-xl border border-[#262A36] bg-[#1A1D27] p-3 lg:flex-row lg:items-center">
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-[#8B91A7]" />
        <Input
          value={text}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className="bg-[#0F1117] pl-8"
        />
      </div>
      {guilds ? (
        <Select value={params.get("guild") ?? "todos"} onValueChange={(value) => update("guild", value)}>
          <SelectTrigger className="w-full bg-[#0F1117] lg:w-52" aria-label="Filtrar por guild">
            <SelectValue placeholder="Guild" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as guilds</SelectItem>
            {guilds.map((guild) => (
              <SelectItem key={guild.id} value={guild.id}>
                {guild.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {statuses ? (
        <Select value={params.get("status") ?? "todos"} onValueChange={(value) => update("status", value)}>
          <SelectTrigger className="w-full bg-[#0F1117] lg:w-48" aria-label="Filtrar por status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : null}
      {showDate ? <DateFilterInner fallback={dateFallback ?? ""} /> : null}
    </div>
  );
}

export function FilterBar(props: {
  placeholder: string;
  guilds?: { id: string; nome: string }[];
  statuses?: readonly string[];
  showDate?: boolean;
  dateFallback?: string;
}) {
  return (
    <Suspense fallback={<div className="mb-4 h-14 rounded-xl border border-[#262A36] bg-[#1A1D27]" />}>
      <FilterBarInner {...props} />
    </Suspense>
  );
}
