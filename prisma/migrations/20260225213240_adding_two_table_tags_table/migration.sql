-- AlterTable
ALTER TABLE "color_palettes" ADD COLUMN     "created_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "tags" (
    "tagId" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT 'default',
    "created_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("tagId")
);

-- CreateTable
CREATE TABLE "palette_tags" (
    "paletteTagId" SERIAL NOT NULL,
    "tagId" INTEGER NOT NULL,
    "paletteId" INTEGER NOT NULL,
    "created_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "palette_tags_pkey" PRIMARY KEY ("paletteTagId")
);

-- AddForeignKey
ALTER TABLE "palette_tags" ADD CONSTRAINT "palette_tags_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tags"("tagId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "palette_tags" ADD CONSTRAINT "palette_tags_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "color_palettes"("paletteId") ON DELETE RESTRICT ON UPDATE CASCADE;
