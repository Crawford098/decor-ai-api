import express from 'express';
import { getPalettes, savePalette } from '../controllers/palettes.controller.js';

const router = express.Router();

router.get('/', getPalettes);
router.post('/save', savePalette);

export default router;
