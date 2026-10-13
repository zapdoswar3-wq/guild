"use client";

import { useActionState } from "react";
import { definirSenha, logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DefinirSenhaForm() {
  const [state, formAction, pending] = useActionState(definirSenha, null);

  return (
    <>
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="senha">Nova senha</Label>
        <Input id="senha" name="senha" type="password" autoComplete="new-password" required className="h-10" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirmacao">Confirmar senha</Label>
        <Input id="confirmacao" name="confirmacao" type="password" autoComplete="new-password" required className="h-10" />
      </div>
      {state?.message ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10 bg-[#6366F1] text-white hover:bg-[#6366F1]/90">
        {pending ? "Salvando..." : "Definir senha"}
      </Button>
    </form>
    <form action={logout} className="mt-3 text-center">
      <button type="submit" className="text-sm text-[#8B91A7] hover:text-[#E6E8EF]">
        Sair
      </button>
    </form>
    </>
  );
}
