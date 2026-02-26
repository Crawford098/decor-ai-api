import express, { Express } from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import palettesRoutes from './routes/palettes.routes.js';
import designsRoutes from './routes/designs.routes.js';
import usersRoutes from './routes/users.routes.js';
import tagsRoutes from './routes/tags.routes.js';
import { errorHandler, notFound } from './middlewares/errorHandler.js';
import { testConnection } from './config/prisma.js';

const app: Express = express();

// Test database connection on startup
testConnection().catch(err => {
    console.error('Failed to connect to database:', err);
});

// Stripe webhook needs raw body, so we handle it before bodyParser
// app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Middlewares
app.use(bodyParser.json());
app.use(cors({'origin': '*'}));

// Routes
app.use('/api/palettes', palettesRoutes);
app.use('/api/designs', designsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/tags', tagsRoutes);
// app.use('/api/payments', paymentsRoutes);

// Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;
