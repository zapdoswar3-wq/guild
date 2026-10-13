export const PERMISSOES = ["visualizar", "editar", "incluir", "excluir"] as const;
export type Permissao = (typeof PERMISSOES)[number];

export const PERMISSAO_LABEL: Record<Permissao, string> = {
  visualizar: "Visualizar",
  editar: "Editar",
  incluir: "Incluir",
  excluir: "Excluir",
};

export type Access = {
  canView: boolean;
  canEdit: boolean;
  canCreate: boolean;
  canDelete: boolean;
};

export function isPermissao(value: string): value is Permissao {
  return (PERMISSOES as readonly string[]).includes(value);
}

export function parsePermissoes(value: string): Permissao[] {
  const selected = new Set(
    value
      .split(",")
      .map((item) => item.trim())
      .filter(isPermissao),
  );
  return PERMISSOES.filter((item) => selected.has(item));
}

export function serializePermissoes(values: readonly string[]) {
  return parsePermissoes(values.join(",")).join(",");
}

export function permissaoLabel(user: { admin: boolean; permissao: string }) {
  if (user.admin) return "Administrador";
  const labels = parsePermissoes(user.permissao).map((item) => PERMISSAO_LABEL[item]);
  return labels.length ? labels.join(", ") : "Sem permissão";
}

export function accessFrom(user: { admin: boolean; permissao: string }): Access {
  if (user.admin) return { canView: true, canEdit: true, canCreate: true, canDelete: true };
  const selected = new Set(parsePermissoes(user.permissao));
  return {
    canView: selected.has("visualizar"),
    canEdit: selected.has("editar"),
    canCreate: selected.has("incluir"),
    canDelete: selected.has("excluir"),
  };
}
