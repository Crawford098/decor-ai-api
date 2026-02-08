import { Request, Response } from 'express';

export const getPalettes = (req: Request, res: Response) => {
    const palettes = [
        {
            "id": 1,
            "name": "Warm Tones",
            "colors": ["#FF5733", "#FFBD33", "#C70039", "#900C3F", "#581845"]
        }
    ];
    res.json(palettes);
};

export const getPalettesWithColors = (req: Request, res: Response) => {
    const palettes = [
        {
            "id": 1,
            "name": "Warm Tones",
            "colors": ["#FF5733", "#FFBD33", "#C70039", "#900C3F", "#581845"]
        },
        {
            "id": 2,
            "name": "Cool Tones",
            "colors": ["#33FFBD", "#33C7FF", "#3390FF", "#3358FF", "#3333FF"]
        }
    ];
    res.json(palettes);
};

export const savePalette = (req: Request, res: Response) => {
    // TODO: Implement save logic with database
    res.json({ message: "Palette saved successfully!" });
};
