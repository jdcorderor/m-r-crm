import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `SELECT id, odontologo_id, fecha, fin_tentativo FROM citas WHERE estado = 'confirmada'`;

        const results = await client.query(query);

        const data = results.rows.map(row => ({
            id: row.id || null,
            odontologo_id: row.odontologo_id || null,
            fecha: row.fecha || null,
            fin_tentativo: row.fin_tentativo || null
        }));
        
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}