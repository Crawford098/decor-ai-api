import { Request, Response } from 'express';
import * as tagsService from '../services/tags/tags.service.js';

export const paletteTagsList = async (_req: Request, res: Response) => {
    try {
        const designs = await tagsService.findPaletteTags();
        res.json(designs);
    } catch (error: unknown) {
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
};
