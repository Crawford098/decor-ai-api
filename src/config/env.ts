import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    openaiApiKey: string | undefined;
    stripe: {
        secretKey: string | undefined;
        webhookSecret: string | undefined;
    };
    database: {
        host: string;
        user: string;
        password: string;
        name: string;
        port: number;
    };
}

export const config: Config = {
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    openaiApiKey: process.env.OPENAI_API_KEY,
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'decor_ai',
        port: Number(process.env.DB_PORT) || 5432,
    },
};
