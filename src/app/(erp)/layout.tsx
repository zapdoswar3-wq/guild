import { AccessProvider } from "@/components/shell/access";
import { AppShell } from "@/components/shell/app-shell";
import { accessFrom, permissaoLabel } from "@/lib/permissions";
import { requireUser } from "@/lib/session";

export default async function ErpLayout({ children }: { children: React.ReactNode }) {
  const session = await requireUser();
  const access = accessFrom(session);
  const canUse = access.canView || access.canEdit || access.canCreate || access.canDelete;
  return (
    <AppShell usuario={session.usuario} admin={session.admin} papel={permissaoLabel(session)}>
      <AccessProvider access={access}>
        {canUse ? (
          children
        ) : (
          <div className="mx-auto max-w-lg px-4 py-16">
            <p className="text-[11px] font-semibold tracking-[0.18em] text-[#6366F1]">SISTEMA</p>
            <h1 className="mt-2 text-xl font-semibold">Sem permissão</h1>
            <p className="mt-2 text-sm leading-6 text-[#8B91A7]">
              Sua conta não tem permissão para visualizar, editar, incluir ou excluir. Peça ao administrador para marcar pelo menos uma.
            </p>
          </div>
        )}
      </AccessProvider>
    </AppShell>
  );
}
