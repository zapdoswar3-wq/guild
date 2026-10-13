"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { createUsuario, deleteUsuario, updateUsuario } from "@/actions/usuarios";
import { StatusBadge } from "@/components/shell/badges";
import { FilterBar } from "@/components/shell/filters";
import { errorOf, Field, FormDialog, TextInput } from "@/components/shell/form";
import { cellClass, headClass, PageHeader, RecordCount, StatGrid } from "@/components/shell/page-header";
import { ConfirmDelete, RowActions } from "@/components/shell/row-actions";
import { useSave } from "@/components/shell/use-save";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatInteger } from "@/lib/format";
import type { UsuarioPage, UsuarioRow } from "@/lib/types";

export function UsuariosScreen({ page }: { page: UsuarioPage }) {
  const [form, setForm] = useState<UsuarioRow | "new" | null>(null);
  const [remove, setRemove] = useState<UsuarioRow | null>(null);
  const editing = form && form !== "new" ? form : null;

  return (
    <>
      <PageHeader
        section="SISTEMA"
        title="Usuários"
        description="Contas novas entram com a senha 123456 e trocam essa senha no primeiro acesso."
      >
        <Button onClick={() => setForm("new")}>
          <Plus />
          Novo usuário
        </Button>
      </PageHeader>
      <StatGrid
        items={[
          { label: "Usuários", value: formatInteger(page.summary.total) },
          { label: "Administradores", value: formatInteger(page.summary.admins) },
          { label: "Contas de acesso", value: formatInteger(page.summary.contas) },
          { label: "Sua conta", value: page.currentUsuario, hint: "Administrador" },
        ]}
      />
      <FilterBar placeholder="Buscar por nome ou usuário" />
      <div className="overflow-hidden rounded-xl border border-[#262A36] bg-[#1A1D27]">
        <Table className="min-w-[720px]">
          <TableHeader>
            <TableRow>
              {["Nome", "Usuário", "Perfil", "Acesso", "Cadastro"].map((label) => (
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
                <TableCell colSpan={6} className="py-12 text-center text-sm whitespace-normal text-[#8B91A7]">
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              page.rows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className={`${cellClass} font-medium`}>{row.nome}</TableCell>
                  <TableCell className={cellClass}>{row.usuario}</TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={row.admin ? "Administrador" : "Usuário"} />
                  </TableCell>
                  <TableCell className={cellClass}>
                    <StatusBadge value={row.deveTrocarSenha ? "Pendente" : "Liberado"} />
                  </TableCell>
                  <TableCell className={cellClass}>{formatDate(row.criadoEm)}</TableCell>
                  <TableCell className={cellClass}>
                    <RowActions
                      onEdit={() => setForm(row)}
                      onDelete={row.admin ? undefined : () => setRemove(row)}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <RecordCount count={page.rows.length} />
      {form ? <UsuarioDialog key={editing?.id ?? "novo"} usuario={editing} onOpenChange={(open) => !open && setForm(null)} /> : null}
      <ConfirmDelete
        open={!!remove}
        onOpenChange={(open) => !open && setRemove(null)}
        extra="Essa pessoa deixa de conseguir entrar no sistema."
        successMessage="Usuário excluído."
        onConfirm={() => deleteUsuario(remove!.id)}
      />
    </>
  );
}

function UsuarioDialog({
  usuario,
  onOpenChange,
}: {
  usuario: UsuarioRow | null;
  onOpenChange: (open: boolean) => void;
}) {
  const { pending, errors, save } = useSave(() => onOpenChange(false));

  return (
    <FormDialog
      open
      onOpenChange={onOpenChange}
      title={usuario ? "Editar usuário" : "Novo usuário"}
      description={
        usuario
          ? "Atualize o nome e o usuário. A senha só muda se você preencher o campo."
          : "A senha inicial será 123456. No primeiro acesso, a pessoa define uma nova senha."
      }
      pending={pending}
      onSubmit={(formData) =>
        save(
          () => (usuario ? updateUsuario(usuario.id, formData) : createUsuario(formData)),
          usuario ? "Usuário atualizado." : "Usuário cadastrado.",
        )
      }
    >
      <Field label="Nome" error={errorOf(errors, "nome")}>
        <TextInput name="nome" defaultValue={usuario?.nome ?? ""} autoComplete="off" />
      </Field>
      <Field label="Usuário" error={errorOf(errors, "usuario")}>
        <TextInput name="usuario" defaultValue={usuario?.usuario ?? ""} autoComplete="off" />
      </Field>
      {usuario ? (
        <Field className="grid gap-1.5 sm:col-span-2" label="Nova senha" error={errorOf(errors, "senha")}>
          <TextInput
            name="senha"
            type="password"
            autoComplete="new-password"
            placeholder="Em branco mantém a senha. 123456 pede troca no próximo acesso"
          />
        </Field>
      ) : null}
    </FormDialog>
  );
}
