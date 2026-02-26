import prisma from '../../config/prisma.js';

//TODO: move this function to his own service file.
export const findPaletteTags = async () => {
  return prisma.tags.findMany({
    where: { hidden: 0 },
    orderBy: { tagId: 'desc' },
    include: {
      paletteTags: {
        where: { hidden: 0 },
        include: {
          palette: true
        }
      }
    }
  });
};
