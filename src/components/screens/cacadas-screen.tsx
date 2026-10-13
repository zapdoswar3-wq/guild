"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createCacada, deleteCacada, updateCacada } from "@/actions/cacadas";
import { ProgressBar, StatusBadge } from "@/components/shell/badges";
import { DateFilter, FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, MemberSelect, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TAREFA_STATUS } from "@/lib/constants";
import { formatDate, formatInteger, progressPercent } from "@/lib/format";
import type { AppOptions, CacadaPage, CacadaRow } from "@/lib/types";

export function CacadasScreen({ page, options, data }: { page: CacadaPage; options: AppOptions; data: string }) {
  const [form, setForm] = useState<CacadaRow | "new" | null>(null);
  const [remove, setRemove] = useState<CacadaRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="GESTÃO"
        title="Caçadas diárias"
        description="Caçadas da data selecionada. Os pontos só entram no desempenho quando o status é Concluída."
      >
        <DateFilter fallback={data} />
        <Button onClick={() => setForm("new")}>
          <Plus />
          Nova caçada
        </Button>
      </PageHeader>
      <StatGrid
        items={[
          { label: "No dia", value: formatInteger(page.summary.noDia) },
          { label: "Concluídas", value: formatInteger(page.summary.concluidas) },
          { label: "Em aberto", value: formatInteger(page.summary.emAberto), hint: "Todas as datas" },
          { label: "Falharam", value: formatInteger(page.summary.falharam) },
        ]}
      />
      <FilterBar placeholder="Buscar por alvo, rota ou responsável" guilds={options.guilds} statuses={TAREFA_STATUS} />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow>
              {["Data", "Guild", "Alvo", "Rota", "Responsável", "Progresso", "Status", "Pontos"].map((label) => (
                <TableHead key={label} className={headClass}>
                  {label}
                </TableHead>
              ))}
              <TableHead className={`${headClass} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((cacada) => (
                <TableRow key={cacada.id}>
                  <TableCell className={cellClass}>{formatDate(cacada.data)}</TableCell>
                  <TableCell className={cellClass}>{cacada.guildNome}</TableCell>
                  <TableCell className={`${cellClass} font-medium`}>{cacada.alvo}</TableCell>
                  <TableCell className={cellClass}>{cacada.rota || "—"}</TableCell>
                  <TableCell className={cellClass}>{cacada.responsavelNick ?? "—"}</TableCell>
                  <TableCell className={cellClass}>
                    <ProgressBar value={cacada.progresso} />
                    <p className="mt-1 text-xs text-[#8B91A7] tabular-nums">
                      {cacada.realizado}/{cacada.meta}
                    </p>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={cacada.status} />
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(cacada.pontos)}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(cacada)} onDelete={() => setRemove(cacada)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <CacadaDialog
          key={editing?.id ?? "nova"}
          cacada={editing}
          options={options}
          data={data}
          onOpenChange={(open) => !open && setForm(null)}
        />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        successMessage="Caçada excluída."
        onConfirm={() => deleteCacada(remove!.id)}
      />
    </>
  );
}

function CacadaDialog({
  cacada,
  options,
  data,
  onOpenChange,
}: {
  cacada: CacadaRow | null;
  options: AppOptions;
  data: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [guildId, setGuildId] = useState(cacada?.guildId ?? "");
  const [responsavelId, setResponsavelId] = useState(cacada?.responsavelId ?? "");
  const [status, setStatus] = useState(cacada?.status ?? "Pendente");
  const [meta, setMeta] = useState(String(cacada?.meta ?? 1));
  const [realizado, setRealizado] = useState(String(cacada?.realizado ?? 0));
  const metaNum = Number(meta);
  const realizadoNum = Number(realizado);
  const progresso = progressPercent(Number.isFinite(realizadoNum) ? realizadoNum : 0, Number.isFinite(metaNum) ? metaNum : 0);

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={cacada ? "Editar caçada" : "Nova caçada"}
      description="Os pontos só contam no dia quando o status é Concluída."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (cacada ? updateCacada(cacada.id, formData) : createCacada(formData)),
          cacada ? "Caçada atualizada." : "Caçada criada.",
        )
      }
    >
      <Field label="Data" error={errorOf(errors, "data")}>
        <TextInput name="data" type="date" defaultValue={cacada?.data ?? data} />
      </Field>
      <Field label="Guild" error={errorOf(errors, "guildId")}>
        <EnumSelect
          name="guildId"
          value={guildId}
          onChange={(value) => {
            setGuildId(value);
            setResponsavelId("");
          }}
          options={options.guilds.map((guild) => ({ value: guild.id, label: guild.nome }))}
          placeholder="Selecione a guild"
        />
      </Field>
      <Field label="Alvo" error={errorOf(errors, "alvo")}>
        <TextInput name="alvo" defaultValue={cacada?.alvo ?? ""} placeholder="Pokémon" />
      </Field>
      <Field label="Rota" error={errorOf(errors, "rota")}>
        <TextInput name="rota" defaultValue={cacada?.rota ?? ""} />
      </Field>
      <Field label="Responsável" error={errorOf(errors, "responsavelId")}>
        <MemberSelect guildId={guildId} members={options.members} value={responsavelId} onChange={setResponsavelId} />
      </Field>
      <Field label="Status" error={errorOf(errors, "status")}>
        <EnumSelect name="status" value={status} onChange={setStatus} options={TAREFA_STATUS} />
      </Field>
      <Field label="Meta" error={errorOf(errors, "meta")}>
        <TextInput name="meta" type="number" min={1} step={1} value={meta} onChange={(event) => setMeta(event.target.value)} />
      </Field>
      <Field label="Realizado" error={errorOf(errors, "realizado")}>
        <TextInput
          name="realizado"
          type="number"
          min={0}
          step={1}
          value={realizado}
          onChange={(event) => setRealizado(event.target.value)}
        />
      </Field>
      <Field label="Pontos" error={errorOf(errors, "pontos")}>
        <TextInput name="pontos" type="number" min={0} step={1} defaultValue={cacada?.pontos ?? 0} />
      </Field>
      <div className="flex items-center sm:col-span-2">
        <ProgressBar value={progresso} />
      </div>
      <Field label="Observações" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "obs")}>
        <Textarea name="obs" defaultValue={cacada?.obs ?? ""} className="min-h-20 bg-[#0F1117]" />
      </Field>
    </FormDialog>
  );
}
