import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getPalettes = async (req: Request, res: Response) => {
    try {
        const palettes = await prisma.palette.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(palettes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch palettes' });
    }
};

export const getPalettesWithColors = async (req: Request, res: Response) => {
    try {
        const palettes = await prisma.palette.findMany({
            include: {
                designs: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(palettes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch palettes with colors' });
    }
};

export const savePalette = async (req: Request, res: Response) => {
    try {
        const { name, colors } = req.body;
        
        if (!name || !colors) {
            return res.status(400).json({ error: 'Name and colors are required' });
        }

        const palette = await prisma.palette.create({
            data: {
                name,
                colors
            }
        });

        res.status(201).json({ 
            message: 'Palette saved successfully!',
            palette 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save palette' });
    }
};
