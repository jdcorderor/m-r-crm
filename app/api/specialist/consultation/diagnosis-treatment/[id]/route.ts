import { Client } from "pg";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest, { params }: { params: Promise<{id: number}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    
    const { id } = await params;
    
    try {
        await client.connect();

        const result = await client.query(`
            SELECT
                dt.diagnostico,
                dt.tratamiento
            FROM historias h
            LEFT JOIN diagnostico_tratamiento dt ON dt.historia_id = h.id
            WHERE h.codigo = $1
        `, [id]);

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error("Error reading consultation.json:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}