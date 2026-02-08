import { Request, Response } from 'express';

export const getDesigns = (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to the Designs API'
    });
};

// TODO: Add more design controllers
// - createDesign
// - updateDesign
// - deleteDesign
// - getDesignById
