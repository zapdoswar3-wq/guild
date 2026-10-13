export const PERMISSOES = ["visualizar", "editar", "incluir", "excluir"] as const;
export type Permissao = (typeof PERMISSOES)[number];

export const PERMISSAO_LABEL: Record<Permissao, string> = {
  visualizar: "Visualizar",
  editar: "Editar",
  incluir: "Incluir",
  excluir: "Excluir",
};

const RANK: Record<Permissao, number> = {
  visualizar: 1,
  editar: 2,
  incluir: 3,
  excluir: 4,
};

export type Access = {
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
};

export function isPermissao(value: string): value is Permissao {
  return (PERMISSOES as readonly string[]).includes(value);
}

export function permissaoLabel(user: { admin: boolean; permissao: string }) {
  if (user.admin) return "Administrador";
  return isPermissao(user.permissao) ? PERMISSAO_LABEL[user.permissao] : PERMISSAO_LABEL.visualizar;
}

export function accessFrom(user: { admin: boolean; permissao: string }): Access {
  const rank = user.admin ? 4 : isPermissao(user.permissao) ? RANK[user.permissao] : 1;
  return {
    canEdit: rank >= 2,
    canCreate: rank >= 3,
    canDelete: rank >= 4,
  };
}
