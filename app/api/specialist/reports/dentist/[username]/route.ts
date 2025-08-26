import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{username: string}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { username } = await params;

    try {
        await client.connect();

        const query = `
            SELECT
                CONCAT(o.nombre, ' ', o.apellido) AS odontologo
            FROM usuarios u 
            LEFT JOIN odontologos o ON u.odontologo_id = o.id
            WHERE u.usuario = $1
        `;

        const results = await client.query(query, [username]);

        return NextResponse.json(results.rows[0].odontologo);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}