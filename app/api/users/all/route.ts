import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT
                u.usuario,
                u.rol,
                o.email,
                o.cedula,
                o.id
            FROM usuarios u
            LEFT JOIN odontologos o ON u.odontologo_id = o.id
        `;

        const results = await client.query(query);

        const data = results.rows.map(row => ({
            id: row.cedula || null,
            username: row.usuario,
            role: row.rol,
            email: row.email || null,
            dentist_id: row.dentist || null,
        }));
        
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}