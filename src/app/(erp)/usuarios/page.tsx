import { UsuariosScreen } from "@/components/screens/usuarios-screen";
import { readFilters } from "@/lib/filters";
import { getUsuarios } from "@/lib/queries";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const admin = await requireAdmin();
  const filters = readFilters(await searchParams);
  const page = await getUsuarios(filters, admin.usuario);
  return <UsuariosScreen page={page} />;
}
