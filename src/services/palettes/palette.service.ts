import prisma from '../../config/prisma.js';

export interface CreatePaletteData {
  name: string;
  colors: string;
}

/**
 * Get all color palettes ordered by most recent
 */
export const findAllPalettes = async () => {
  return prisma.colorPalette.findMany({
    orderBy: { paletteId: 'desc' }
  });
};

/**
 * Create a new color palette
 */
export const createPalette = async (data: CreatePaletteData) => {
  return prisma.colorPalette.create({
    data: {
      name: data.name,
      colors: data.colors
    }
  });
};
