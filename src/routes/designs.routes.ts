import express from 'express';
import { getDesigns } from '../controllers/designs.controller.js';

const router = express.Router();

router.get('/', getDesigns);

export default router;
