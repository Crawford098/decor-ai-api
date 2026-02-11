import dotenv from 'dotenv';

dotenv.config();

interface Config {
    port: number;
    nodeEnv: string;
    openaiApiKey: string | undefined;
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
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        name: process.env.DB_NAME || 'decor_ai',
        port: Number(process.env.DB_PORT) || 3306,
    },
};
