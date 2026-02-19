import express from 'express';
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser,
  softDeleteUser,
  getProfiles,
  createProfile
} from '../controllers/users.controller.js';

const router = express.Router();

// User routes
router.get('/', getUsers);
router.post('/', createUser);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/soft-delete', softDeleteUser);

// Profile routes
router.get('/profiles/all', getProfiles);
router.post('/profiles', createProfile);

export default router;
