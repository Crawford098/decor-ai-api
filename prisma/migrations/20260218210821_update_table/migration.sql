/*
  Warnings:

  - The primary key for the `designs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `ai_prompt` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `palette_id` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `room_type` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `style` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `designs` table. All the data in the column will be lost.
  - You are about to drop the `palettes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `designs` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "designs" DROP CONSTRAINT "designs_palette_id_fkey";

-- DropIndex
DROP INDEX "designs_palette_id_idx";

-- DropIndex
DROP INDEX "designs_room_type_idx";

-- DropIndex
DROP INDEX "designs_style_idx";

-- AlterTable
ALTER TABLE "designs" DROP CONSTRAINT "designs_pkey",
DROP COLUMN "ai_prompt",
DROP COLUMN "created_at",
DROP COLUMN "description",
DROP COLUMN "id",
DROP COLUMN "image_url",
DROP COLUMN "palette_id",
DROP COLUMN "room_type",
DROP COLUMN "style",
DROP COLUMN "title",
DROP COLUMN "updated_at",
ADD COLUMN     "designId" SERIAL NOT NULL,
ADD COLUMN     "img" VARCHAR(255),
ADD COLUMN     "name" VARCHAR(255),
ADD COLUMN     "pronts" TEXT,
ADD COLUMN     "userId" INTEGER NOT NULL,
ADD CONSTRAINT "designs_pkey" PRIMARY KEY ("designId");

-- DropTable
DROP TABLE "palettes";

-- CreateTable
CREATE TABLE "profile" (
    "profileId" SERIAL NOT NULL,
    "first_name" VARCHAR(255) NOT NULL DEFAULT 'default',
    "last_name" VARCHAR(255) NOT NULL DEFAULT 'default',
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "profile_pkey" PRIMARY KEY ("profileId")
);

-- CreateTable
CREATE TABLE "users" (
    "userId" SERIAL NOT NULL,
    "profileId" INTEGER NOT NULL,
    "username" VARCHAR(255) NOT NULL DEFAULT 'default',
    "password" VARCHAR(255) NOT NULL DEFAULT 'default',
    "email" VARCHAR(255) NOT NULL DEFAULT 'default',
    "blocked" SMALLINT NOT NULL DEFAULT 0,
    "token" TEXT DEFAULT 'default',
    "hidden" SMALLINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(6),

    CONSTRAINT "users_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "color_palettes" (
    "paletteId" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL DEFAULT 'default',
    "colors" TEXT NOT NULL DEFAULT 'default',
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "color_palettes_pkey" PRIMARY KEY ("paletteId")
);

-- CreateTable
CREATE TABLE "images" (
    "imageId" SERIAL NOT NULL,
    "worldId" INTEGER NOT NULL,
    "path" VARCHAR(255) NOT NULL DEFAULT 'default',
    "date" DATE NOT NULL,
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "images_pkey" PRIMARY KEY ("imageId")
);

-- CreateTable
CREATE TABLE "works_done" (
    "worldId" SERIAL NOT NULL,
    "designId" INTEGER NOT NULL DEFAULT 0,
    "paletteId" INTEGER NOT NULL DEFAULT 0,
    "userId" INTEGER NOT NULL DEFAULT 0,
    "final_pront" TEXT DEFAULT 'default',
    "hidden" SMALLINT NOT NULL DEFAULT 0,

    CONSTRAINT "works_done_pkey" PRIMARY KEY ("worldId")
);

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profile"("profileId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "designs" ADD CONSTRAINT "designs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_worldId_fkey" FOREIGN KEY ("worldId") REFERENCES "works_done"("worldId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works_done" ADD CONSTRAINT "works_done_designId_fkey" FOREIGN KEY ("designId") REFERENCES "designs"("designId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works_done" ADD CONSTRAINT "works_done_paletteId_fkey" FOREIGN KEY ("paletteId") REFERENCES "color_palettes"("paletteId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "works_done" ADD CONSTRAINT "works_done_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
