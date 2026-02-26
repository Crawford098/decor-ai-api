/*
  Warnings:

  - A unique constraint covering the columns `[tagId,paletteId]` on the table `palette_tags` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "palette_tags_tagId_paletteId_key" ON "palette_tags"("tagId", "paletteId");
