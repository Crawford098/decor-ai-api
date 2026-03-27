import { Request, Response } from 'express';
import * as paletteService from '../services/palettes/palette.service.js';

export const getPalettes = async (_req: Request, res: Response)=> {
    try {
        const palettes = await paletteService.findAllPalettes();
        return res.json(palettes);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch palettes' });
    }
};

export const savePalette = async (req: Request, res: Response) => {
    try {
        const { userId, name, colors } = req.body;
        
        if (!userId || !name || !colors) {
            return res.status(400).json({ error: 'User ID, name, and colors are required' });
        }

        const palette = await paletteService.createPalette({ userId, name, colors });

        return res.status(201).json({ 
            message: 'Palette saved successfully!',
            palette 
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to save palette' });
    }
};

export const deletePalette = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ error: 'Palette ID is required' });
        }

        await paletteService.deletePalette(Number(id));

        return res.status(200).json({ message: 'Palette deleted successfully!' });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to delete palette' });
    }
};
