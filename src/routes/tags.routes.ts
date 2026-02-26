import express from 'express';
import { paletteTagsList } from '../controllers/tags.controller.js';

const router = express.Router();

router.get('/', paletteTagsList);

export default router;
