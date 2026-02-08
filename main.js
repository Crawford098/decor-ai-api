import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import process from 'node:process';
import paletteRoutes from './api/routes/palettesRoutes.js';
import desingsRoutes from './api/routes/desingsRoutes.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/desings', desingsRoutes);
app.use('/api/palettes', paletteRoutes);

app.listen(PORT, () => {
  console.log(`Decor AI API is running at http://localhost:${PORT}`);
});


//TODO - Definir la estructura de carpetas y archivos para el proyecto