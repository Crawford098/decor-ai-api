-- AlterTable
ALTER TABLE "palettes" ADD COLUMN     "created_by" VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
ALTER COLUMN "name" DROP DEFAULT,
ALTER COLUMN "colors" DROP DEFAULT;

-- AlterTable
ALTER TABLE "tags" ADD COLUMN     "created_by" VARCHAR(50) NOT NULL DEFAULT 'SYSTEM';

-- Add check constraints for created_by field
ALTER TABLE "palettes" ADD CONSTRAINT "palettes_created_by_check" CHECK (created_by IN ('SYSTEM', 'USER'));
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_check" CHECK (created_by IN ('SYSTEM', 'USER'));
