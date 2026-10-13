-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN "permissao" TEXT NOT NULL DEFAULT 'visualizar';

-- CreateTable
CREATE TABLE "MissaoResponsavel" (
    "missaoId" TEXT NOT NULL,
    "membroId" TEXT NOT NULL,

    CONSTRAINT "MissaoResponsavel_pkey" PRIMARY KEY ("missaoId","membroId")
);

-- Copy existing single responsibles
INSERT INTO "MissaoResponsavel" ("missaoId", "membroId")
SELECT "id", "responsavelId" FROM "Missao" WHERE "responsavelId" IS NOT NULL;

-- CreateIndex
CREATE INDEX "MissaoResponsavel_membroId_idx" ON "MissaoResponsavel"("membroId");

-- AddForeignKey
ALTER TABLE "MissaoResponsavel" ADD CONSTRAINT "MissaoResponsavel_missaoId_fkey" FOREIGN KEY ("missaoId") REFERENCES "Missao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissaoResponsavel" ADD CONSTRAINT "MissaoResponsavel_membroId_fkey" FOREIGN KEY ("membroId") REFERENCES "Membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropForeignKey
ALTER TABLE "Missao" DROP CONSTRAINT "Missao_responsavelId_fkey";

-- DropIndex
DROP INDEX "Missao_responsavelId_idx";

-- AlterTable
ALTER TABLE "Missao" DROP COLUMN "responsavelId";
