import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = "SELECT id, nombre, apellido FROM odontologos";

        const results = await client.query(query);

        return NextResponse.json(results.rows);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}