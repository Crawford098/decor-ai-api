import { Request, Response } from 'express';
import prisma from '../config/prisma.js';

export const getDesigns = async (_req: Request, res: Response) => {
    try {
        const designs = await prisma.design.findMany({
            include: {
                user: true
            }
        });
        res.json(designs);
    } catch (error: unknown) {
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
};

export const getDesignById = async (req: Request, res : Response) => {
    try {
        const { id } = req.params;
        const design = await prisma.design.findUnique({
            where: { designId: Number(id) },
            include: {
                user: true
            }
        });

        if (!design) {
            return res.status(404).json({ error: 'Design not found' });
        }

        return res.json(design);
    } catch (error: unknown) {
        return res.status(500).json({ error: 'Failed to fetch design' });
    }
};

export const createDesign = async (req: Request, res: Response) => {
    try {
        const { userId, name, pronts, img } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Verificar que el usuario existe
        const userExists = await prisma.user.findUnique({
            where: { userId: Number(userId) }
        });

        if (!userExists) {
            return res.status(404).json({ error: `User with id ${userId} not found` });
        }

        const design = await prisma.design.create({
            data: {
                userId: Number(userId),
                name,
                pronts,
                img
            },
            include: {
                user: true
            }
        });

        return res.status(201).json(design);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to create design: ' + message });
    }
};

export const updateDesign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, pronts, img } = req.body;

        const design = await prisma.design.update({
            where: { designId: Number(id) },
            data: {
                name,
                pronts,
                img
            },
            include: {
                user: true
            }
        });

        return res.json(design);
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to update design: ' + message });
    }
};

export const deleteDesign = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.design.delete({
            where: { designId: Number(id) }
        });

        return res.json({ message: 'Design deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to delete design: ' + message });
    }
};
