-- AlterTable
ALTER TABLE "palettes" ADD COLUMN     "userId" INTEGER;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "userId" INTEGER;

-- AddForeignKey
ALTER TABLE "palettes" ADD CONSTRAINT "palettes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
