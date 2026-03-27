import prisma from '../../config/prisma.js';

export interface CreatePaletteData {
  userId: number;
  name: string;
  colors: string;
}

/**
 * Get all color palettes ordered by most recent
 */
export const findAllPalettes = async () => {
  return prisma.palettes.findMany({
    orderBy: { paletteId: 'desc' },
    include: {
      paletteTags: true
    }
  });
};

/**
 * Create a new color palette
 */
export const createPalette = async (data: CreatePaletteData) => {
  return prisma.palettes.create({
    data: {
      userId: data.userId,
      name: data.name,
      colors: data.colors
    }
  });
};

export const deletePalette = async  (id:number) => {
  return prisma.palettes.update({
    where: { paletteId: id },
    data: { hidden: 1 }
  });
}
