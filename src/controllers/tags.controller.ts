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

export const createTag = async (req: Request, res: Response) => {
    try {
        const { userId, name } = req.body;

        const newTag = await tagsService.createTag({ userId: Number(userId), name });

        res.status(201).json(newTag);
    } catch (error) {
        res.status(500).json({
            error: 'Failed to create tag: ' + (error instanceof Error ? error.message : 'Unknown error')
        });
    }
}
