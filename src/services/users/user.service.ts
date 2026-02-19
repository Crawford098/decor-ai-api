import prisma from '../../config/prisma.js';

export interface CreateUserData {
  profileId: number;
  username: string;
  password: string;
  email: string;
  blocked?: number;
  token?: string;
  hidden?: number;
}

export interface UpdateUserData {
  username?: string;
  password?: string;
  email?: string;
  blocked?: number;
  token?: string;
  hidden?: number;
}

export interface CreateProfileData {
  first_name: string;
  last_name: string;
  hidden?: number;
}

/**
 * Get all users with their profiles
 */
export const findAllUsers = async () => {
  return prisma.user.findMany({
    include: {
      profile: true,
      designs: true,
      works_done: true
    },
    where: {
      hidden: 0
    }
  });
};

/**
 * Find a user by their ID
 */
export const findUserById = async (userId: number) => {
  return prisma.user.findUnique({
    where: { userId },
    include: {
      profile: true,
      designs: true,
      works_done: true
    }
  });
};

/**
 * Find a user by email
 */
export const findUserByEmail = async (email: string) => {
  return prisma.user.findFirst({
    where: { email },
    include: {
      profile: true
    }
  });
};

/**
 * Find a user by username
 */
export const findUserByUsername = async (username: string) => {
  return prisma.user.findFirst({
    where: { username },
    include: {
      profile: true
    }
  });
};

/**
 * Create a new user
 * Note: Password should be hashed before calling this function
 */
export const createUser = async (data: CreateUserData) => {
  return prisma.user.create({
    data: {
      profileId: data.profileId,
      username: data.username,
      password: data.password, // Should be hashed
      email: data.email,
      blocked: data.blocked ?? 0,
      token: data.token,
      hidden: data.hidden ?? 0,
      created_at: new Date()
    },
    include: {
      profile: true
    }
  });
};

/**
 * Update an existing user
 * Note: If updating password, it should be hashed before calling this function
 */
export const updateUser = async (userId: number, data: UpdateUserData) => {
  return prisma.user.update({
    where: { userId },
    data,
    include: {
      profile: true
    }
  });
};

/**
 * Soft delete a user (set hidden = 1)
 */
export const softDeleteUser = async (userId: number) => {
  return prisma.user.update({
    where: { userId },
    data: { hidden: 1 }
  });
};

/**
 * Hard delete a user
 */
export const deleteUser = async (userId: number) => {
  return prisma.user.delete({
    where: { userId }
  });
};

/**
 * Check if a profile exists
 */
export const profileExists = async (profileId: number) => {
  const profile = await prisma.profile.findUnique({
    where: { profileId }
  });
  return profile !== null;
};

/**
 * Create a new profile
 */
export const createProfile = async (data: CreateProfileData) => {
  return prisma.profile.create({
    data: {
      first_name: data.first_name,
      last_name: data.last_name,
      hidden: data.hidden ?? 0
    }
  });
};

/**
 * Get all profiles
 */
export const findAllProfiles = async () => {
  return prisma.profile.findMany({
    where: {
      hidden: 0
    },
    include: {
      users: true
    }
  });
};

/**
 * Check if email is already taken
 */
export const isEmailTaken = async (email: string, excludeUserId?: number) => {
  const user = await prisma.user.findFirst({
    where: {
      email,
      ...(excludeUserId && { userId: { not: excludeUserId } })
    }
  });
  return user !== null;
};

/**
 * Check if username is already taken
 */
export const isUsernameTaken = async (username: string, excludeUserId?: number) => {
  const user = await prisma.user.findFirst({
    where: {
      username,
      ...(excludeUserId && { userId: { not: excludeUserId } })
    }
  });
  return user !== null;
};
