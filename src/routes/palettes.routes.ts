import express from 'express';
import { getPalettes, savePalette, deletePalette } from '../controllers/palettes.controller.js';

const router = express.Router();

router.get('/', getPalettes);
router.post('/', savePalette);
router.post('/delete/:id', deletePalette);

export default router;
