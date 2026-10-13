-- Cada nível antigo incluía os anteriores. A conta passa a guardar a combinação equivalente.
UPDATE "Usuario"
SET "permissao" = CASE "permissao"
  WHEN 'editar' THEN 'visualizar,editar'
  WHEN 'incluir' THEN 'visualizar,editar,incluir'
  WHEN 'excluir' THEN 'visualizar,editar,incluir,excluir'
  ELSE "permissao"
END
WHERE "permissao" IN ('editar', 'incluir', 'excluir');
