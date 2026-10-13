"use client";

import { useState } from "react";
import { CreateButton } from "@/components/shell/access";
import { createMembro, deleteMembro, updateMembro } from "@/actions/membros";
import { StatusBadge } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CARGOS, MEMBRO_STATUS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { formatDate, formatInteger, formatPercent } from "@/lib/format";
import type { AppOptions, MembroPage, MembroRow } from "@/lib/types";

export function MembrosScreen({ page, options }: { page: MembroPage; options: AppOptions }) {
  const [form, setForm] = useState<MembroRow | "new" | null>(null);
  const [remove, setRemove] = useState<MembroRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="CADASTROS"
        title="Membros"
        description="Cada membro aparece com a guild em que está. Quem não foi marcado em nenhuma guild fica sem guild."
      >
        <CreateButton label="Novo membro" onClick={() => setForm("new")} />
      </PageHeader>
      <StatGrid
        items={[
          { label: "Membros", value: formatInteger(page.summary.total) },
          { label: "Ativos", value: formatInteger(page.summary.ativos) },
          { label: "Inativos/afastados", value: formatInteger(page.summary.inativosAfastados) },
          { label: "Com missões abertas", value: formatInteger(page.summary.comMissoesAbertas) },
        ]}
      />
      <FilterBar placeholder="Buscar por nick, Discord ou guild" guilds={options.guilds} statuses={MEMBRO_STATUS} />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[1100px]">
          <TableHeader>
            <TableRow>
              {["Nick", "Guild", "Cargo", "Nível", "Pontos", "Status", "Missões abertas", "Missões feitas", "Caçadas feitas", "Taxa"].map(
                (label) => (
                  <TableHead key={label} className={headClass}>
                    {label}
                  </TableHead>
                ),
              )}
              <TableHead className={`${headClass} text-right`}>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {page.rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((membro) => (
                <TableRow key={membro.id}>
                  <TableCell className={cellClass}>
                    <p className="font-medium">{membro.nick}</p>
                    <p className="text-xs text-[#8B91A7]">{membro.discord || "Sem Discord"}</p>
                  </TableCell>
                  <TableCell className={cellClass}>
                    <span
                      className={
                        membro.guildNome
                          ? "inline-flex rounded-md border border-[#6366F1]/30 bg-[#6366F1]/10 px-2 py-0.5 text-xs font-medium text-[#C7C9FF]"
                          : "inline-flex rounded-md border border-zinc-500/30 bg-zinc-500/15 px-2 py-0.5 text-xs font-medium text-zinc-300"
                      }
                    >
                      {membro.guildNome ?? "Sem guild"}
                    </span>
                  </TableCell>
                  <TableCell className={cellClass}>{membro.cargo}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{membro.nivel}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(membro.pontos)}</TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={membro.status} />
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{membro.missoesAbertas}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{membro.missoesFeitas}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{membro.cacadasFeitas}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatPercent(membro.taxa)}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(membro)} onDelete={() => setRemove(membro)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <MembroDialog
          key={editing?.id ?? "novo"}
          membro={editing}
          guilds={options.guilds}
          onOpenChange={(open) => !open && setForm(null)}
        />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        successMessage="Membro excluído."
        onConfirm={() => deleteMembro(remove!.id)}
      />
    </>
  );
}

function MembroDialog({
  membro,
  guilds,
  onOpenChange,
}: {
  membro: MembroRow | null;
  guilds: AppOptions["guilds"];
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [guildId, setGuildId] = useState(membro?.guildId ?? "nenhuma");
  const [cargo, setCargo] = useState(membro?.cargo ?? "Membro");
  const [status, setStatus] = useState(membro?.status ?? "Ativo");

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={membro ? "Editar membro" : "Novo membro"}
      description="O nick precisa ser único. A guild também pode ser escolhida no cadastro da própria guild."
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (membro ? updateMembro(membro.id, formData) : createMembro(formData)),
          membro ? "Membro atualizado." : "Membro criado.",
        )
      }
    >
      <Field label="Nick" error={errorOf(errors, "nick")}>
        <TextInput name="nick" defaultValue={membro?.nick ?? ""} />
      </Field>
      <Field label="Guild" error={errorOf(errors, "guildId")}>
        <EnumSelect
          name="guildId"
          value={guildId}
          onChange={setGuildId}
          options={[{ value: "nenhuma", label: "Sem guild" }, ...guilds.map((guild) => ({ value: guild.id, label: guild.nome }))]}
          placeholder="Selecione a guild"
        />
      </Field>
      <Field label="Cargo" error={errorOf(errors, "cargo")}>
        <EnumSelect name="cargo" value={cargo} onChange={setCargo} options={CARGOS} />
      </Field>
      <Field label="Status" error={errorOf(errors, "status")}>
        <EnumSelect name="status" value={status} onChange={setStatus} options={MEMBRO_STATUS} />
      </Field>
      <Field label="Nível" error={errorOf(errors, "nivel")}>
        <TextInput name="nivel" type="number" min={1} step={1} defaultValue={membro?.nivel ?? 1} />
      </Field>
      <Field label="Pontos" error={errorOf(errors, "pontos")}>
        <TextInput name="pontos" type="number" min={0} step={1} defaultValue={membro?.pontos ?? 0} />
      </Field>
      <Field label="Entrada" error={errorOf(errors, "entrada")}>
        <TextInput name="entrada" type="date" defaultValue={membro?.entrada ?? todayISO()} />
      </Field>
      <Field label="Discord" error={errorOf(errors, "discord")}>
        <TextInput name="discord" defaultValue={membro?.discord ?? ""} placeholder="opcional" />
      </Field>
    </FormDialog>
  );
}
