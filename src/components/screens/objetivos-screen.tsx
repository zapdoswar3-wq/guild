"use client";

import { useState } from "react";
import { CreateButton } from "@/components/shell/access";
import { createObjetivo, deleteObjetivo, updateObjetivo } from "@/actions/objetivos";
import { PriorityBadge, ProgressBar, StatusBadge } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, MemberSelect, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { OBJETIVO_STATUS, PRIORIDADES } from "@/lib/constants";
import { isISODate, parseDateInput, todayISO } from "@/lib/dates";
import { formatDate, formatDecimal, formatInteger } from "@/lib/format";
import { objetivoStatus } from "@/lib/status";
import type { AppOptions, ObjetivoPage, ObjetivoRow } from "@/lib/types";

export function ObjetivosScreen({ page, options }: { page: ObjetivoPage; options: AppOptions }) {
  const [form, setForm] = useState<ObjetivoRow | "new" | null>(null);
  const [remove, setRemove] = useState<ObjetivoRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="GESTÃO"
        title="Objetivos"
        description="O status não é digitado: concluído ao bater a meta, atrasado se o prazo passou, em andamento se já há realizado."
      >
        <CreateButton label="Novo objetivo" onClick={() => setForm("new")} />
      </PageHeader>
      <StatGrid
        items={[
          { label: "Abertos", value: formatInteger(page.summary.abertos), hint: "Ainda não concluídos" },
          { label: "Em andamento", value: formatInteger(page.summary.emAndamento) },
          { label: "Concluídos", value: formatInteger(page.summary.concluidos) },
          { label: "Atrasados", value: formatInteger(page.summary.atrasados) },
        ]}
      />
      <FilterBar placeholder="Buscar por título, responsável ou recompensa" guilds={options.guilds} statuses={OBJETIVO_STATUS} />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[1080px]">
          <TableHeader>
            <TableRow>
              {["Título", "Guild", "Responsável", "Prioridade", "Progresso", "Status", "Prazo", "Recompensa"].map((label) => (
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
              page.rows.map((objetivo) => (
                <TableRow key={objetivo.id}>
                  <TableCell className={`${cellClass} font-medium whitespace-normal`}>{objetivo.titulo}</TableCell>
                  <TableCell className={cellClass}>{objetivo.guildNome}</TableCell>
                  <TableCell className={cellClass}>{objetivo.responsavelNick ?? "—"}</TableCell>
                  <TableCell className={cellClass}>
                    <PriorityBadge value={objetivo.prioridade} />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <ProgressBar value={objetivo.progresso} />
                    <p className="mt-1 text-xs text-[#8B91A7] tabular-nums">
                      {formatDecimal(objetivo.realizado)} / {formatDecimal(objetivo.meta)}
                    </p>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={objetivo.status} />
                  </TableCell>
                  <TableCell className={cellClass}>{formatDate(objetivo.prazo)}</TableCell>
                  <TableCell className={`${cellClass} whitespace-normal`}>{objetivo.recompensa || "—"}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(objetivo)} onDelete={() => setRemove(objetivo)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <ObjetivoDialog
          key={editing?.id ?? "novo"}
          objetivo={editing}
          options={options}
          onOpenChange={(open) => !open && setForm(null)}
        />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        successMessage="Objetivo excluído."
        onConfirm={() => deleteObjetivo(remove!.id)}
      />
    </>
  );
}

function ObjetivoDialog({
  objetivo,
  options,
  onOpenChange,
}: {
  objetivo: ObjetivoRow | null;
  options: AppOptions;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [guildId, setGuildId] = useState(objetivo?.guildId ?? "");
  const [responsavelId, setResponsavelId] = useState(objetivo?.responsavelId ?? "");
  const [prioridade, setPrioridade] = useState(objetivo?.prioridade ?? "Média");
  const [meta, setMeta] = useState(String(objetivo?.meta ?? 1));
  const [realizado, setRealizado] = useState(String(objetivo?.realizado ?? 0));
  const [prazo, setPrazo] = useState(objetivo?.prazo ?? todayISO());
  const metaNum = Number(meta);
  const realizadoNum = Number(realizado);
  const status = objetivoStatus({
    meta: Number.isFinite(metaNum) ? metaNum : 0,
    realizado: Number.isFinite(realizadoNum) ? realizadoNum : 0,
    prazo: parseDateInput(isISODate(prazo) ? prazo : todayISO()),
  });

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={objetivo ? "Editar objetivo" : "Novo objetivo"}
      description="O responsável lista só os membros da guild escolhida. Trocar a guild limpa o responsável."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (objetivo ? updateObjetivo(objetivo.id, formData) : createObjetivo(formData)),
          objetivo ? "Objetivo atualizado." : "Objetivo criado.",
        )
      }
    >
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
      <Field label="Responsável" error={errorOf(errors, "responsavelId")}>
        <MemberSelect guildId={guildId} members={options.members} value={responsavelId} onChange={setResponsavelId} />
      </Field>
      <Field label="Título" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "titulo")}>
        <TextInput name="titulo" defaultValue={objetivo?.titulo ?? ""} />
      </Field>
      <Field label="Prioridade" error={errorOf(errors, "prioridade")}>
        <EnumSelect name="prioridade" value={prioridade} onChange={setPrioridade} options={PRIORIDADES} />
      </Field>
      <Field label="Prazo" error={errorOf(errors, "prazo")}>
        <TextInput name="prazo" type="date" value={prazo} onChange={(event) => setPrazo(event.target.value)} />
      </Field>
      <Field label="Meta" error={errorOf(errors, "meta")}>
        <TextInput name="meta" type="number" min={0.01} step="0.01" value={meta} onChange={(event) => setMeta(event.target.value)} />
      </Field>
      <Field label="Realizado" error={errorOf(errors, "realizado")}>
        <TextInput
          name="realizado"
          type="number"
          min={0}
          step="0.01"
          value={realizado}
          onChange={(event) => setRealizado(event.target.value)}
        />
      </Field>
      <div className="flex items-center gap-2 sm:col-span-2">
        <span className="text-sm text-[#8B91A7]">Status calculado</span>
        <StatusBadge value={status} />
      </div>
      <Field label="Recompensa" error={errorOf(errors, "recompensa")}>
        <TextInput name="recompensa" defaultValue={objetivo?.recompensa ?? ""} />
      </Field>
      <Field label="Notas" error={errorOf(errors, "notas")}>
        <Textarea name="notas" defaultValue={objetivo?.notas ?? ""} className="min-h-20 bg-[#0F1117]" />
      </Field>
    </FormDialog>
  );
}
