"use client";

import { useState } from "react";
import { createGuild, deleteGuild, updateGuild } from "@/actions/guilds";
import { CreateButton, useAccess } from "@/components/shell/access";
import { StatusBadge } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { GUILD_STATUS, TIERS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { formatDate, formatDecimal, formatInteger, formatPercent, occupationPercent } from "@/lib/format";
import type { GuildOption, GuildPage, GuildRow } from "@/lib/types";

const COLUMNS = ["Guild", "Líder", "Tier", "Status", "Ocupação", "Pontos", "Bônus XP", "Criada em"];

export function GuildsScreen({ page, guilds }: { page: GuildPage; guilds: GuildOption[] }) {
  const [form, setForm] = useState<GuildRow | "new" | null>(null);
  const [remove, setRemove] = useState<GuildRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="CADASTROS"
        title="Guilds"
        description="Cadastro das guilds. Clique no nome para abrir a guild e ver somente os membros dela. A ocupação considera apenas membros ativos."
      >
        <CreateButton label="Nova guild" onClick={() => setForm("new")} />
      </PageHeader>
      <StatGrid
        items={[
          { label: "Guilds", value: formatInteger(page.summary.total) },
          { label: "Membros ativos", value: formatInteger(page.summary.membrosAtivos) },
          { label: "Pontos somados", value: formatInteger(page.summary.pontos) },
          { label: "Guilds tier S", value: formatInteger(page.summary.tierS) },
        ]}
      />
      <FilterBar placeholder="Buscar por nome ou líder" guilds={guilds} statuses={GUILD_STATUS} />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow>
              {COLUMNS.map((label) => (
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
                <TableCell colSpan={COLUMNS.length + 1} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((guild) => (
                <TableRow key={guild.id}>
                  <TableCell className={cellClass}>
                    <button
                      type="button"
                      className="font-medium text-[#E6E8EF] underline-offset-2 hover:text-[#C7C9FF] hover:underline"
                      onClick={() => setForm(guild)}
                    >
                      {guild.nome}
                    </button>
                  </TableCell>
                  <TableCell className={cellClass}>{guild.lider}</TableCell>
                  <TableCell className={cellClass}>{guild.tier}</TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={guild.status} />
                  </TableCell>
                  <TableCell className={cellClass}>
                    {guild.ativos}/{guild.vagas} · {formatPercent(occupationPercent(guild.ativos, guild.vagas))}
                  </TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatInteger(guild.pontos)}</TableCell>
                  <TableCell className={`${cellClass} tabular-nums`}>{formatDecimal(guild.bonusXp)}%</TableCell>
                  <TableCell className={cellClass}>{formatDate(guild.criadaEm)}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions onEdit={() => setForm(guild)} onDelete={() => setRemove(guild)} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? (
        <GuildDialog key={editing?.id ?? "nova"} guild={editing} onOpenChange={(open) => !open && setForm(null)} />
      ) : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        extra="A guild será apagada, junto com os talentos, objetivos, caçadas e missões dela. Os membros continuam cadastrados e ficam sem guild."
        requireAck
        ackLabel="Confirmo a exclusão da guild e dos registros vinculados."
        successMessage="Guild excluída."
        onConfirm={() => deleteGuild(remove!.id)}
      />
    </>
  );
}

function GuildDialog({ guild, onOpenChange }: { guild: GuildRow | null; onOpenChange: (open: boolean) => void }) {
  const { canEdit } = useAccess();
  const readOnly = !!guild && !canEdit;
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [tier, setTier] = useState(guild?.tier ?? "A");
  const [status, setStatus] = useState(guild?.status ?? "Ativa");
  const membros = guild?.membros ?? [];

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={guild ? (readOnly ? guild.nome : "Editar guild") : "Nova guild"}
      description={
        guild
          ? "Os membros abaixo já pertencem a esta guild. A guild de cada pessoa é escolhida na tela de Membros."
          : "Informe os dados da guild. O nome precisa ser único. Os membros entram pela tela de Membros."
      }
      pending={pending}
      readOnly={readOnly}
      onSubmit={(formData) =>
        save(() => (guild ? updateGuild(guild.id, formData) : createGuild(formData)), guild ? "Guild atualizada." : "Guild criada.")
      }
    >
      <Field label="Nome" error={errorOf(errors, "nome")}>
        <TextInput name="nome" defaultValue={guild?.nome ?? ""} disabled={readOnly} />
      </Field>
      <Field label="Líder" error={errorOf(errors, "lider")}>
        <TextInput name="lider" defaultValue={guild?.lider ?? ""} disabled={readOnly} />
      </Field>
      <Field label="Tier" error={errorOf(errors, "tier")}>
        <EnumSelect name="tier" value={tier} onChange={setTier} options={TIERS} disabled={readOnly} />
      </Field>
      <Field label="Status" error={errorOf(errors, "status")}>
        <EnumSelect name="status" value={status} onChange={setStatus} options={GUILD_STATUS} disabled={readOnly} />
      </Field>
      <Field label="Pontos" error={errorOf(errors, "pontos")}>
        <TextInput name="pontos" type="number" min={0} step={1} defaultValue={guild?.pontos ?? 0} disabled={readOnly} />
      </Field>
      <Field label="Bônus de XP (%)" error={errorOf(errors, "bonusXp")}>
        <TextInput name="bonusXp" type="number" min={0} step="0.1" defaultValue={guild?.bonusXp ?? 0} disabled={readOnly} />
      </Field>
      <Field label="Vagas" error={errorOf(errors, "vagas")}>
        <TextInput name="vagas" type="number" min={1} step={1} defaultValue={guild?.vagas ?? 10} disabled={readOnly} />
      </Field>
      <Field label="Criada em" error={errorOf(errors, "criadaEm")}>
        <TextInput name="criadaEm" type="date" defaultValue={guild?.criadaEm ?? todayISO()} disabled={readOnly} />
      </Field>
      <Field label="Observações" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "observacoes")}>
        <Textarea name="observacoes" defaultValue={guild?.observacoes ?? ""} disabled={readOnly} className="min-h-20 bg-[#0F1117]" />
      </Field>
      {guild ? (
        <Field className="grid gap-1.5 sm:col-span-2" label="Membros">
          <div className="grid max-h-48 gap-2 overflow-y-auto rounded-lg border border-[#262A36] bg-[#0F1117] p-3 sm:grid-cols-2">
            {membros.length === 0 ? (
              <p className="text-sm text-[#8B91A7] sm:col-span-2">Nenhum membro nesta guild.</p>
            ) : (
              membros.map((membro) => (
                <div key={membro.id} className="flex items-center justify-between gap-2 text-sm text-[#E6E8EF]">
                  <span>{membro.nick}</span>
                  <StatusBadge value={membro.status} />
                </div>
              ))
            )}
          </div>
        </Field>
      ) : null}
    </FormDialog>
  );
}
