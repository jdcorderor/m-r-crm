import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const queryA = `
            SELECT SUM(a.tamaño) AS total_bits
            FROM archivos a;
        `;

        const resultA = await client.query(queryA, []);
        const statA = resultA.rows[0]?.total_bits ?? 0;

        const queryB = `
            SELECT COUNT(*) AS total_archivos
            FROM archivos;
        `;

        const resultB = await client.query(queryB, []);
        const statB = resultB.rows[0]?.total_archivos ?? 0;

        const queryC = `
            SELECT COUNT(*) AS total_archivos
            FROM archivos
            WHERE fecha >= CURRENT_DATE - INTERVAL '30 days';
        `;

        const resultC = await client.query(queryC, []);
        const statC = resultC.rows[0]?.total_archivos ?? 0;

        return NextResponse.json({ spaceUsed: statA, allFiles: statB, recentlyUploaded: statC });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}