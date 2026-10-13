"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createGuild, deleteGuild, updateGuild } from "@/actions/guilds";
import { StatusBadge } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { EnumSelect, errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { GUILD_STATUS, TIERS } from "@/lib/constants";
import { todayISO } from "@/lib/dates";
import { formatDate, formatDecimal, formatInteger, formatPercent, occupationPercent } from "@/lib/format";
import type { GuildOption, GuildPage, GuildRow } from "@/lib/types";

export function GuildsScreen({ page, guilds }: { page: GuildPage; guilds: GuildOption[] }) {
  const [form, setForm] = useState<GuildRow | "new" | null>(null);
  const [remove, setRemove] = useState<GuildRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="CADASTROS"
        title="Guilds"
        description="Cadastro das guilds, vagas e bônus de experiência. A ocupação considera apenas membros ativos."
      >
        <Button onClick={() => setForm("new")}>
          <Plus />
          Nova guild
        </Button>
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
        <Table className="min-w-[980px]">
          <TableHeader>
            <TableRow>
              {["Guild", "Líder", "Tier", "Status", "Ocupação", "Pontos", "Bônus XP", "Criada em"].map((label) => (
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
              page.rows.map((guild) => (
                <TableRow key={guild.id}>
                  <TableCell className={`${cellClass} font-medium`}>{guild.nome}</TableCell>
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
      {form ? <GuildDialog key={editing?.id ?? "nova"} guild={editing} onOpenChange={(open) => !open && setForm(null)} /> : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        extra="A guild e todos os membros, talentos, objetivos, caçadas e missões vinculados serão apagados."
        requireAck
        ackLabel="Confirmo a exclusão da guild e de todos os registros vinculados."
        successMessage="Guild excluída."
        onConfirm={() => deleteGuild(remove!.id)}
      />
    </>
  );
}

function GuildDialog({ guild, onOpenChange }: { guild: GuildRow | null; onOpenChange: (open: boolean) => void }) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));
  const [tier, setTier] = useState(guild?.tier ?? "A");
  const [status, setStatus] = useState(guild?.status ?? "Ativa");

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={guild ? "Editar guild" : "Nova guild"}
      description="Informe os dados da guild. O nome precisa ser único."
      pending={pending}
      onSubmit={(formData) =>
        save(() => (guild ? updateGuild(guild.id, formData) : createGuild(formData)), guild ? "Guild atualizada." : "Guild criada.")
      }
    >
      <Field label="Nome" error={errorOf(errors, "nome")}>
        <TextInput name="nome" defaultValue={guild?.nome ?? ""} />
      </Field>
      <Field label="Líder" error={errorOf(errors, "lider")}>
        <TextInput name="lider" defaultValue={guild?.lider ?? ""} />
      </Field>
      <Field label="Tier" error={errorOf(errors, "tier")}>
        <EnumSelect name="tier" value={tier} onChange={setTier} options={TIERS} />
      </Field>
      <Field label="Status" error={errorOf(errors, "status")}>
        <EnumSelect name="status" value={status} onChange={setStatus} options={GUILD_STATUS} />
      </Field>
      <Field label="Pontos" error={errorOf(errors, "pontos")}>
        <TextInput name="pontos" type="number" min={0} step={1} defaultValue={guild?.pontos ?? 0} />
      </Field>
      <Field label="Bônus de XP (%)" error={errorOf(errors, "bonusXp")}>
        <TextInput name="bonusXp" type="number" min={0} step="0.1" defaultValue={guild?.bonusXp ?? 0} />
      </Field>
      <Field label="Vagas" error={errorOf(errors, "vagas")}>
        <TextInput name="vagas" type="number" min={1} step={1} defaultValue={guild?.vagas ?? 10} />
      </Field>
      <Field label="Criada em" error={errorOf(errors, "criadaEm")}>
        <TextInput name="criadaEm" type="date" defaultValue={guild?.criadaEm ?? todayISO()} />
      </Field>
      <Field label="Observações" className="grid gap-1.5 sm:col-span-2" error={errorOf(errors, "observacoes")}>
        <Textarea name="observacoes" defaultValue={guild?.observacoes ?? ""} className="min-h-20 bg-[#0F1117]" />
      </Field>
    </FormDialog>
  );
}
