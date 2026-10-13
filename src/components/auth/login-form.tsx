"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="usuario">Usuário</Label>
        <Input id="usuario" name="usuario" autoComplete="username" autoFocus required className="h-10" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="senha">Senha</Label>
        <Input id="senha" name="senha" type="password" autoComplete="current-password" required className="h-10" />
      </div>
      {state?.message ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-10 bg-[#6366F1] text-white hover:bg-[#6366F1]/90">
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
