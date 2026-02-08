import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
    const palettes = get();
    res.json(palettes);
});

router.get('/colors', (req, res) => {
    const palettes = palettesColor();
    res.json(palettes);
});

router.post('/save', (req, res) => {
    const result = save();
    res.json(result);
});

export function get() {
    
    return [
    {
        "id": 1,
        "name": "Warm Tones",
        "colors": ["#FF5733", "#FFBD33", "#C70039", "#900C3F", "#581845"]
    }];
}

export function palettesColor() {
    
    return [
    {
        "id": 1,
        "name": "Warm Tones",
        "colors": ["#FF5733", "#FFBD33", "#C70039", "#900C3F", "#581845"]
    },
    {
        "id": 2,
        "name": "Cool Tones",
        "colors": ["#33FFBD", "#33C7FF", "#3390FF", "#3358FF", "#3333FF"]
    }];
}

export function save() {
    return { message: "Palette saved successfully!" };
}

export default router;