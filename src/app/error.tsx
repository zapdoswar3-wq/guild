"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-[#262A36] bg-[#1A1D27] p-6">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6366F1]">SISTEMA</p>
      <h1 className="mt-2 text-xl font-semibold">Não foi possível carregar esta tela.</h1>
      <p className="mt-2 text-sm text-[#8B91A7]">
        Verifique se o banco de dados está disponível e tente novamente.
      </p>
      <Button className="mt-4" onClick={() => reset()}>
        Tentar novamente
      </Button>
    </div>
  );
}
