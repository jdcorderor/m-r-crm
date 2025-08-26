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
                nombre,
                descripcion
            FROM examenes
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

// POST Route
export async function POST(request: Request): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { nombre, descripcion } = await request.json();

        if (!nombre) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        await client.connect();

        const query = `
            INSERT INTO examenes (nombre, descripcion)
            VALUES ($1, $2)
            RETURNING id, nombre, descripcion
        `;

        const result = await client.query(query, [nombre, descripcion]);

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}