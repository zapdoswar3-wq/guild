-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Usuario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "usuario" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "deveTrocarSenha" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Usuario" ("admin", "criadoEm", "id", "nome", "senhaHash", "usuario") SELECT "admin", "criadoEm", "id", "nome", "senhaHash", "usuario" FROM "Usuario";
DROP TABLE "Usuario";
ALTER TABLE "new_Usuario" RENAME TO "Usuario";
CREATE UNIQUE INDEX "Usuario_usuario_key" ON "Usuario"("usuario");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
