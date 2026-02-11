import mysql from 'mysql2/promise';
import { config } from './env.js';

interface DatabaseConfig {
    host: string;
    user: string;
    password: string;
    database: string;
    port: number;
    connectionLimit: number;
}

const dbConfig: DatabaseConfig = {
    host: config.database.host || 'localhost',
    user: config.database.user || 'root',
    password: config.database.password || '',
    database: config.database.name || 'decor_ai',
    port: config.database.port || 3306,
    connectionLimit: 10,
};

// Create connection pool
export const pool = mysql.createPool(dbConfig);

// Test database connection
export const testConnection = async (): Promise<boolean> => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
};

// Query helper function
export const query = async (sql: string, values?: any[]) => {
    try {
        const [results] = await pool.execute(sql, values);
        return results;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

export default pool;
