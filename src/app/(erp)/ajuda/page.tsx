import { PageHeader } from "@/components/shell/page-header";

const SECOES = [
  {
    titulo: "Acesso",
    texto:
      "A home pede usuário e senha antes de abrir o painel. Sem uma sessão válida, as telas de gestão ficam fechadas. O administrador cadastra as contas em Usuários e marca, em qualquer combinação, Visualizar, Editar, Incluir e Excluir. O botão Sair, no rodapé da barra lateral, encerra a sessão e volta para a home.",
  },
  {
    titulo: "Visão geral",
    texto:
      "Mostra o dia selecionado. Os cartões reúnem guilds ativas e recrutando, membros ativos, a porcentagem de missões e caçadas concluídas e os pontos ganhos. Pontos só entram quando o status é Concluída. Os alertas listam missões pendentes e missões que falharam nessa data.",
  },
  {
    titulo: "Missões diárias",
    texto:
      "Lista as missões da data escolhida. Dá para buscar, filtrar por guild e por status, criar, editar e excluir, conforme a permissão da conta. O cartão Em aberto conta pendentes e em andamento de todas as datas. Uma missão pode ter vários responsáveis, e cada um precisa ser membro da guild selecionada.",
  },
  {
    titulo: "Caçadas diárias",
    texto:
      "Funciona como as missões, com alvo, rota e barra de progresso entre realizado e meta. O progresso para em 100%. Os pontos da caçada também só contam no desempenho quando ela está concluída.",
  },
  {
    titulo: "Objetivos",
    texto:
      "O status é calculado: Concluído se o realizado alcança a meta, Atrasado se o prazo já passou, Em andamento se já existe realizado e Pendente nos demais casos. A barra mostra realizado dividido pela meta.",
  },
  {
    titulo: "Guilds",
    texto:
      "Cadastro de nome, líder, tier, pontos, bônus de XP, vagas e status. Clique no nome da guild para abrir o cadastro e ver somente os membros dela. A guild de cada pessoa é escolhida na tela de Membros. A ocupação é membros ativos divididos pelas vagas. Excluir a guild apaga talentos, objetivos, caçadas e missões dela. Os membros continuam cadastrados e ficam sem guild.",
  },
  {
    titulo: "Membros",
    texto:
      "Cada nick é único. A guild é escolhida neste cadastro e a coluna Guild mostra onde o membro está. Sem guild significa que nenhuma guild foi selecionada. As colunas de missões abertas, missões feitas, caçadas feitas e taxa de conclusão são calculadas. Só o status Ativo entra na contagem de vagas da guild.",
  },
  {
    titulo: "Talentos",
    texto:
      "Associa um talento do catálogo a uma guild e define o nível, de zero até o máximo. A tela mostra Nv atual/máximo, o progresso, o bônus atual (nível × bônus por nível), o bônus do próximo nível ou Máximo, além da unidade e da descrição do catálogo.",
  },
  {
    titulo: "Usuários",
    texto:
      "Somente o administrador vê esta tela. A conta nova entra com a senha padrão 123456 e, no primeiro acesso, a pessoa precisa definir outra senha. As caixas Visualizar, Editar, Incluir e Excluir são independentes e podem ser marcadas juntas. Na edição, a senha pode ficar em branco para ser mantida. A conta de administrador não pode ser excluída.",
  },
  {
    titulo: "Configurações",
    texto:
      "CRUD do catálogo de talentos: nome, bônus por nível, unidade, nível máximo e descrição. Excluir um talento do catálogo também remove os níveis registrados nas guilds. Não é possível reduzir o nível máximo abaixo de um nível já usado.",
  },
];

export default function AjudaPage() {
  return (
    <>
      <PageHeader
        section="SISTEMA"
        title="Ajuda"
        description="Como cada tela do Unbroken Guild System organiza a gestão das guilds."
      />
      <div className="grid gap-3 md:grid-cols-2">
        {SECOES.map((secao) => (
          <article key={secao.titulo} className="rounded-xl border border-[#262A36] bg-[#1A1D27] p-4">
            <h2 className="text-base font-semibold text-[#E6E8EF]">{secao.titulo}</h2>
            <p className="mt-2 text-sm leading-6 text-[#8B91A7]">{secao.texto}</p>
          </article>
        ))}
      </div>
    </>
  );
}
