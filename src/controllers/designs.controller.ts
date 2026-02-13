import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getDesigns = async (req: Request, res: Response) => {
    try {
        const designs = await prisma.design.findMany({
            include: {
                palette: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(designs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
};

export const getDesignById = async (req: Request, res : Response) => {
    try {
        const { id } = req.params;
        const design = await prisma.design.findUnique({
            where: { id: Number(id) },
            include: {
                palette: true
            }
        });

        if (!design) {
            return res.status(404).json({ error: 'Design not found' });
        }

        res.json(design);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch design' });
    }
};

export const createDesign = async (req: Request, res: Response) => {
    try {
        const { title, description, roomType, style, paletteId, imageUrl, aiPrompt } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'Title is required' });
        }

        const design = await prisma.design.create({
            data: {
                title,
                description,
                roomType,
                style,
                paletteId,
                imageUrl,
                aiPrompt
            },
            include: {
                palette: true
            }
        });

        res.status(201).json(design);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create design' });
    }
};

export const updateDesign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, roomType, style, paletteId, imageUrl, aiPrompt } = req.body;

        const design = await prisma.design.update({
            where: { id: Number(id) },
            data: {
                title,
                description,
                roomType,
                style,
                paletteId,
                imageUrl,
                aiPrompt
            },
            include: {
                palette: true
            }
        });

        res.json(design);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update design' });
    }
};

export const deleteDesign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.design.delete({
            where: { id: Number(id) }
        });

        res.json({ message: 'Design deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete design' });
    }
};
