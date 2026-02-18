-- CreateTable
CREATE TABLE "palettes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "colors" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "palettes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designs" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "room_type" VARCHAR(100),
    "style" VARCHAR(100),
    "palette_id" INTEGER,
    "image_url" TEXT,
    "ai_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "designs_palette_id_idx" ON "designs"("palette_id");

-- CreateIndex
CREATE INDEX "designs_room_type_idx" ON "designs"("room_type");

-- CreateIndex
CREATE INDEX "designs_style_idx" ON "designs"("style");

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_palette_id_fkey" FOREIGN KEY ("palette_id") REFERENCES "palettes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
