-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuario" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");
