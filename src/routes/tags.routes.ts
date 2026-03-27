import express from 'express';
import { createTag, paletteTagsList } from '../controllers/tags.controller.js';

const router = express.Router();

router.get('/', paletteTagsList);
router.post('/', createTag);

export default router;
