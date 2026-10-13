"use client";

import { useState } from "react";
import { createMissao, deleteMissao, updateMissao } from "@/actions/missoes";
import { CreateButton } from "@/components/shell/access";
import { PriorityBadge, StatusBadge } from "@/components/shell/badges";
import { DateFilter, FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, MemberMultiSelect, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { PRIORIDADES, TAREFA_STATUS, TIPOS_MISSAO } from "@/lib/constants";
import { formatDate, formatInteger } from "@/lib/format";
import type { AppOptions, MissaoPage, MissaoRow } from "@/lib/types";

export function MissoesScreen({ page, options, data }: { page: MissaoPage; options: AppOptions; data: string }) {
  const [form, setForm] = useState<MissaoRow | "new" | null>(null);
  const [remove, setRemove] = useState<MissaoRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="GESTÃO"
        title="Missões diárias"
        description="Missões da data selecionada. Os pontos só entram no desempenho quando o status é Concluída."
      >
        <DateFilter fallback={data} />
        <CreateButton label="Nova missão" onClick={() => setForm("new")} />
      </PageHeader>
      <StatGrid
        items={[
          { label: "No dia", value: formatInteger(page.summary.noDia) },
          { label: "Concluídas", value: formatInteger(page.summary.concluidas) },
          { label: "Em aberto", value: formatInteger(page.summary.emAberto), hint: "Todas as datas" },
          { label: "Falharam", value: formatInteger(page.summary.falharam) },
        ]}
      />
      <FilterBar placeholder="Buscar por título, tipo ou responsável" guilds={options.guilds} statuses={TAREFA_STATUS} />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              {["Data", "Guild", "Título", "Tipo", "Responsáveis", "Prioridade", "Status", "Pontos", "XP"].map((label) => (
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
                <TableCell colSpan={10} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((missao) => (
                <TableRow key={missao.id}>
                  <TableCell className={cellClass}>{formatDate(missao.data)}</TableCell>
                  <TableCell className={cellClass}>{missao.guildNome}</TableCell>
                  <TableCell className={`${cellClass} font-medium whitespace-normal`}>{missao.titulo}</TableCell>
                  <TableCell className={cellClass}>{missao.tipo}</TableCell>
                  <TableCell className={`${cellClass} whitespace-normal`}>
                    {missao.responsavelNicks.length ? missao.responsavelNicks.join(", ") : "—"}
                  </TableCell>
                  <TableCell className={cellClass}>
                    <PriorityBadge value={missao.prioridade} />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={missao.status} />
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(missao.pontos)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(missao.xp)}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(missao)} onDelete={() => setRemove(missao)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <MissaoDialog
          key={editing?.id ?? "nova"}
          missao={editing}
          options={options}
          data={data}
          onOpenChange={(open) => !open && setForm(null)}
        />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        successMessage="Missão excluída."
        onConfirm={() => deleteMissao(remove!.id)}
      />
    </>
  );
}

function MissaoDialog({
  missao,
  options,
  data,
  onOpenChange,
}: {
  missao: MissaoRow | null;
  options: AppOptions;
  data: string;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [guildId, setGuildId] = useState(missao?.guildId ?? "");
  const [responsavelIds, setResponsavelIds] = useState(missao?.responsavelIds ?? []);
  const [tipo, setTipo] = useState(missao?.tipo ?? "Batalha");
  const [prioridade, setPrioridade] = useState(missao?.prioridade ?? "Média");
  const [status, setStatus] = useState(missao?.status ?? "Pendente");

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={missao ? "Editar missão" : "Nova missão"}
      description="Os pontos só contam no dia quando o status é Concluída."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (missao ? updateMissao(missao.id, formData) : createMissao(formData)),
          missao ? "Missão atualizada." : "Missão criada.",
        )
      }
    >
      <Field label="Data" error={errorOf(errors, "data")}>
        <TextInput name="data" type="date" defaultValue={missao?.data ?? data} />
      </Field>
      <Field label="Guild" error={errorOf(errors, "guildId")}>
        <EnumSelect
          name="guildId"
          value={guildId}
          onChange={(value) => {
            setGuildId(value);
            setResponsavelIds([]);
          }}
          options={options.guilds.map((guild) => ({ value: guild.id, label: guild.nome }))}
          placeholder="Selecione a guild"
        />
      </Field>
      <Field label="Título" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "titulo")}>
        <TextInput name="titulo" defaultValue={missao?.titulo ?? ""} />
      </Field>
      <Field label="Tipo" error={errorOf(errors, "tipo")}>
        <EnumSelect name="tipo" value={tipo} onChange={setTipo} options={TIPOS_MISSAO} />
      </Field>
      <Field className="grid gap-1.5 sm:col-span-2" label="Responsáveis" error={errorOf(errors, "responsavelIds")}>
        <MemberMultiSelect guildId={guildId} members={options.members} value={responsavelIds} onChange={setResponsavelIds} />
      </Field>
      <Field label="Prioridade" error={errorOf(errors, "prioridade")}>
        <EnumSelect name="prioridade" value={prioridade} onChange={setPrioridade} options={PRIORIDADES} />
      </Field>
      <Field label="Status" error={errorOf(errors, "status")}>
        <EnumSelect name="status" value={status} onChange={setStatus} options={TAREFA_STATUS} />
      </Field>
      <Field label="Pontos" error={errorOf(errors, "pontos")}>
        <TextInput name="pontos" type="number" min={0} step={1} defaultValue={missao?.pontos ?? 0} />
      </Field>
      <Field label="XP" error={errorOf(errors, "xp")}>
        <TextInput name="xp" type="number" min={0} step={1} defaultValue={missao?.xp ?? 0} />
      </Field>
      <Field label="Observações" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "obs")}>
        <Textarea name="obs" defaultValue={missao?.obs ?? ""} className="min-h-20 bg-[#0F1117]" />
      </Field>
    </FormDialog>
  );
}
