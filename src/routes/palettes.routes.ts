import express from 'express';
import { getPalettes, getPalettesWithColors, savePalette } from '../controllers/palettes.controller.js';

const router = express.Router();

router.get('/', getPalettes);
router.get('/colors', getPalettesWithColors);
router.post('/save', savePalette);

export default router;
