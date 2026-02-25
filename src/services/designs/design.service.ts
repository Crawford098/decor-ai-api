import prisma from '../../config/prisma.js';

export interface CreateDesignData {
  userId: number;
  name: string;
  pronts: string;
  img?: string;
}

export interface UpdateDesignData {
  name?: string;
  pronts?: string;
  img?: string;
}

/**
 * Get all designs with user information
 */
export const findAllDesigns = async () => {
  return prisma.design.findMany({
    include: {
      user: true
    }
  });
};

/**
 * Find a design by its ID
 */
export const findDesignById = async (designId: number) => {
  return prisma.design.findUnique({
    where: { designId },
    include: {
      user: true
    }
  });
};

/**
 * Create a new design
 */
export const createDesign = async (data: CreateDesignData) => {
  return prisma.design.create({
    data: {
      userId: data.userId,
      name: data.name,
      pronts: data.pronts,
      img: data.img,
      hidden: 0
    },
    include: {
      user: true
    }
  });
};

/**
 * Update an existing design
 */
export const updateDesign = async (designId: number, data: UpdateDesignData) => {
  return prisma.design.update({
    where: { designId },
    data,
    include: {
      user: true
    }
  });
};

/**
 * Delete a design
 */
export const deleteDesign = async (designId: number) => {
  return prisma.design.delete({
    where: { designId }
  });
};

/**
 * Check if a user exists
 */
export const userExists = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { userId }
  });
  return user !== null;
};
