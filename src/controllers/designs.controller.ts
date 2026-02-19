import { Request, Response } from 'express';
import * as designService from '../services/designs/design.service.js';

export const getDesigns = async (_req: Request, res: Response) => {
    try {
        const designs = await designService.findAllDesigns();
        res.json(designs);
    } catch (error: unknown) {
        res.status(500).json({ error: 'Failed to fetch designs' });
    }
};

export const getDesignById = async (req: Request, res : Response) => {
    try {
        const { id } = req.params;
        const design = await designService.findDesignById(Number(id));

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
        const exists = await designService.userExists(Number(userId));

        if (!exists) {
            return res.status(404).json({ error: `User with id ${userId} not found` });
        }

        const design = await designService.createDesign({
            userId: Number(userId),
            name,
            pronts,
            img
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

        const design = await designService.updateDesign(Number(id), {
            name,
            pronts,
            img
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
        await designService.deleteDesign(Number(id));

        return res.json({ message: 'Design deleted successfully' });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: 'Failed to delete design: ' + message });
    }
};
