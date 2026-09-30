-- Store monetary values as exact fixed-point numbers instead of double precision.
-- Existing values are rounded to the application's two-decimal currency scale.
ALTER TABLE "Product"
  ALTER COLUMN "alisFiyati" TYPE DECIMAL(12,2)
    USING ROUND("alisFiyati"::numeric, 2),
  ALTER COLUMN "listeFiyati" TYPE DECIMAL(12,2)
    USING ROUND("listeFiyati"::numeric, 2);
