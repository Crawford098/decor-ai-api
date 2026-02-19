import { Request, Response } from 'express';
import * as userService from '../services/users/user.service.js';
import bcrypt from 'bcrypt';
import { isValidEmail, isValidPassword, isValidUsername, sanitizeString, isValidName } from '../utils/validators.js';

/**
 * Get all users
 */
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const users = await userService.findAllUsers();
    res.json(users);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch users: ' + message });
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.findUserById(Number(id));

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to fetch user: ' + message });
  }
};

/**
 * Create a new user
 */
export const createUser = async (req: Request, res: Response) => {
  try {
    const { profileId, username, password, email, blocked, token, hidden } = req.body;

    // Validate required fields
    if (!profileId || !username || !password || !email) {
      return res.status(400).json({ 
        error: 'profileId, username, password, and email are required' 
      });
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email format' 
      });
    }

    // Validate username format
    if (!isValidUsername(username)) {
      return res.status(400).json({ 
        error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
      });
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers' 
      });
    }

    // Check if profile exists
    const profileExistsCheck = await userService.profileExists(Number(profileId));
    if (!profileExistsCheck) {
      return res.status(404).json({ 
        error: `Profile with id ${profileId} not found` 
      });
    }

    // Check if email is already taken
    const emailTaken = await userService.isEmailTaken(email);
    if (emailTaken) {
      return res.status(400).json({ 
        error: 'Email is already registered' 
      });
    }

    // Check if username is already taken
    const usernameTaken = await userService.isUsernameTaken(username);
    if (usernameTaken) {
      return res.status(400).json({ 
        error: 'Username is already taken' 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      profileId: Number(profileId),
      username: sanitizeString(username),
      password: hashedPassword,
      email: sanitizeString(email),
      blocked,
      token,
      hidden
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to create user: ' + message });
  }
};

/**
 * Update an existing user
 */
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let { username, password, email, blocked, token, hidden } = req.body;

    // Check if user exists
    const userExists = await userService.findUserById(Number(id));
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Validate and check if email is taken by another user
    if (email) {
      if (!isValidEmail(email)) {
        return res.status(400).json({ 
          error: 'Invalid email format' 
        });
      }
      
      const emailTaken = await userService.isEmailTaken(email, Number(id));
      if (emailTaken) {
        return res.status(400).json({ 
          error: 'Email is already registered by another user' 
        });
      }
      
      email = sanitizeString(email);
    }

    // Validate and check if username is taken by another user
    if (username) {
      if (!isValidUsername(username)) {
        return res.status(400).json({ 
          error: 'Username must be 3-20 characters and contain only letters, numbers, and underscores' 
        });
      }
      
      const usernameTaken = await userService.isUsernameTaken(username, Number(id));
      if (usernameTaken) {
        return res.status(400).json({ 
          error: 'Username is already taken by another user' 
        });
      }
      
      username = sanitizeString(username);
    }

    // Hash password if it's being updated
    if (password) {
      if (!isValidPassword(password)) {
        return res.status(400).json({ 
          error: 'Password must be at least 8 characters and contain uppercase, lowercase, and numbers' 
        });
      }
      
      password = await bcrypt.hash(password, 10);
    }

    const user = await userService.updateUser(Number(id), {
      username,
      password,
      email,
      blocked,
      token,
      hidden
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to update user: ' + message });
  }
};

/**
 * Soft delete a user (set hidden = 1)
 */
export const softDeleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const userExists = await userService.findUserById(Number(id));
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userService.softDeleteUser(Number(id));

    return res.json({ message: 'User soft deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to delete user: ' + message });
  }
};

/**
 * Hard delete a user
 */
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userExists = await userService.findUserById(Number(id));
    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    await userService.deleteUser(Number(id));

    return res.json({ message: 'User deleted successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to delete user: ' + message });
  }
};

/**
 * Get all profiles
 */
export const getProfiles = async (_req: Request, res: Response) => {
  try {
    const profiles = await userService.findAllProfiles();
    res.json(profiles);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ error: 'Failed to fetch profiles: ' + message });
  }
};

/**
 * Create a new profile
 */
export const createProfile = async (req: Request, res: Response) => {
  try {
    const { first_name, last_name, hidden } = req.body;

    if (!first_name || !last_name) {
      return res.status(400).json({ 
        error: 'first_name and last_name are required' 
      });
    }

    // Validate name format
    if (!isValidName(first_name) || !isValidName(last_name)) {
      return res.status(400).json({ 
        error: 'Names must be between 2 and 50 characters' 
      });
    }

    const profile = await userService.createProfile({
      first_name: sanitizeString(first_name),
      last_name: sanitizeString(last_name),
      hidden
    });

    return res.status(201).json(profile);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to create profile: ' + message });
  }
};
