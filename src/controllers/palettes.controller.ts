import { Request, Response } from 'express';
import * as paletteService from '../services/palettes/palette.service.js';

export const getPalettes = async (req: Request, res: Response)=> {
    try {
        const palettes = await paletteService.findAllPalettes();
        return res.json(palettes);
    } catch (error) {
        return res.status(500).json({ error: 'Failed to fetch palettes' });
    }
};

export const savePalette = async (req: Request, res: Response) => {
    try {
        const { name, colors } = req.body;
        
        if (!name || !colors) {
            return res.status(400).json({ error: 'Name and colors are required' });
        }

        const palette = await paletteService.createPalette({ name, colors });

        return res.status(201).json({ 
            message: 'Palette saved successfully!',
            palette 
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to save palette' });
    }
};
