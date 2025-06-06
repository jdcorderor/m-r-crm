import { Pool } from "pg";

declare global {
    // eslint-disable-next-line no-var
    var pgPool: Pool | undefined // Declare global variable to hold the pool instance
}

let pool: Pool;

if (!global.pgPool) {
    pool = new Pool({
        connectionString: process.env.DATABASE_URL, // Use DATABASE_URL from environment variables
        ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false, // Use SSL in production
    });
    global.pgPool = pool;
} else {
    pool = global.pgPool;
}

export { pool as dbPool };