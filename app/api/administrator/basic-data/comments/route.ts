import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT
                id,
                emisor,
                email,
                comentario,
                fecha,
                estado
            FROM comentarios
        `;

        const results = await client.query(query, []);

        return NextResponse.json(results.rows);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}