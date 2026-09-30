-- Track successful bulk import batches by file digest so exact re-uploads are rejected.
CREATE TABLE "StockImport" (
    "id" SERIAL NOT NULL,
    "sha256" VARCHAR(64) NOT NULL,
    "fileName" TEXT NOT NULL,
    "rowCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockImport_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "StockMovement"
ADD COLUMN "importId" INTEGER,
ADD COLUMN "importRow" INTEGER;

CREATE UNIQUE INDEX "StockImport_sha256_key" ON "StockImport"("sha256");
CREATE UNIQUE INDEX "StockMovement_importId_importRow_key" ON "StockMovement"("importId", "importRow");

ALTER TABLE "StockMovement"
ADD CONSTRAINT "StockMovement_importId_fkey"
FOREIGN KEY ("importId") REFERENCES "StockImport"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
