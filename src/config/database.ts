import pkg from 'pg';
const { Pool } = pkg;
import { config } from './env.js';

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    max: number;
    idleTimeoutMillis: number;
    connectionTimeoutMillis: number;
}

const dbConfig: DatabaseConfig = {
    host: config.database.host || 'localhost',
    user: config.database.user || 'postgres',
    password: config.database.password || '',
    database: config.database.name || 'decor_ai',
    port: config.database.port || 5432,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
};

// Create connection pool
export const pool = new Pool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
    try {
        const client = await pool.connect();
        console.log('✅ PostgreSQL Database connected successfully');
        const result = await client.query('SELECT NOW()');
        console.log('Database time:', result.rows[0].now);
        client.release();
        return true;
    } catch (error) {
        console.error('❌ PostgreSQL Database connection failed:', error);
        return false;
    }
};

// Query helper function
export const query = async (sql: string, values?: any[]) => {
    try {
        const result = await pool.query(sql, values);
        return result.rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

// Graceful shutdown
export const closePool = async () => {
    await pool.end();
    console.log('Database pool closed');
};

export default pool;
