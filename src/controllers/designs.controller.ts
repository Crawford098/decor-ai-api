import { Request, Response } from 'express';

export const getDesigns = (req: Request, res: Response) => {
    res.json([
        {
            id: '1',
            name: 'Modern Living Room',
            style: 'Modern',
            room: 'Living Room',
            imageUrl: 'https://example.com/designs/modern-living-room.jpg',
            createdAt: new Date('2024-01-15'),
            description: 'Sleek and contemporary living room with minimalist furniture'
        },
        {
            id: '2',
            name: 'Cozy Bedroom',
            style: 'Scandinavian',
            room: 'Bedroom',
            imageUrl: 'https://example.com/designs/cozy-bedroom.jpg',
            createdAt: new Date('2024-01-20'),
            description: 'Warm and inviting bedroom with natural wood accents'
        },
        {
            id: '3',
            name: 'Industrial Kitchen',
            style: 'Industrial',
            room: 'Kitchen',
            imageUrl: 'https://example.com/designs/industrial-kitchen.jpg',
            createdAt: new Date('2024-02-01'),
            description: 'Rustic kitchen with exposed brick and metal fixtures'
        }
    ]);
};

export const getDesignById = (req: Request, res: Response) => {
    const { id } = req.params;
    
    res.json({
        id: '1',
        name: 'Modern Living Room',
        style: 'Modern',
        room: 'Living Room',
        imageUrl: 'https://example.com/designs/modern-living-room.jpg',
        createdAt: new Date('2024-01-15'),
        description: 'Sleek and contemporary living room with minimalist furniture'
    });
}

// TODO: Add more design controllers
// - createDesign
// - updateDesign
// - deleteDesign
// - getDesignById
