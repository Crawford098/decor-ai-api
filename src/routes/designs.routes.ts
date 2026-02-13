import express from 'express';
import { getDesignById, getDesigns, createDesign, updateDesign, deleteDesign } from '../controllers/designs.controller.js';

const router = express.Router();

router.get('/', getDesigns);
router.post('/', createDesign);
router.get('/:id', getDesignById);
router.put('/:id', updateDesign);
router.delete('/:id', deleteDesign);

export default router;
