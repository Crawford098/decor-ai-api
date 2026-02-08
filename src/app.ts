import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import palettesRoutes from './routes/palettes.routes.js';
import designsRoutes from './routes/designs.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';

const app: Express = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());

// Routes
app.use('/api/palettes', palettesRoutes);
app.use('/api/designs', designsRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
