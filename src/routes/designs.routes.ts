import express from 'express';
import { getDesignById, getDesigns } from '../controllers/designs.controller.js';

const router = express.Router();

router.get('/', getDesigns);
router.get('/:id', getDesignById);
// router.post('/', createDesign);
// router.post('/', updateDesign);
// router.post('/', deleteDesign);

export default router;
