import { DefinirSenhaForm } from "@/components/auth/definir-senha-form";
import { requirePasswordChange } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function DefinirSenhaPage() {
  const user = await requirePasswordChange();

  return (
    <main className="flex min-h-screen flex-col items-center bg-[#0F1117] px-4 pt-8 pb-10">
      <img src="/unbroken-logo.png" alt="Unbroken Guild" className="h-44 w-44 object-contain sm:h-52 sm:w-52" />
      <section className="mt-2 w-full max-w-md rounded-2xl border border-[#262A36] bg-[#1A1D27] p-6 shadow-2xl shadow-black/30 sm:p-8">
        <h1 className="text-2xl font-semibold text-[#E6E8EF]">Definir senha</h1>
        <p className="mt-2 mb-6 text-sm leading-6 text-[#8B91A7]">
          Olá, {user.nome}. Este é o primeiro acesso com a senha padrão. Escolha uma senha nova, com pelo menos 8 caracteres, para entrar no painel.
        </p>
        <DefinirSenhaForm />
      </section>
    </main>
  );
}
