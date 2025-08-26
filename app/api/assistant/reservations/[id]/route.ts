import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{id: number}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

    try {
        await client.connect();

        const query = `
            SELECT
                c.id,
                c.odontologo_id,
                CONCAT(p.nombre, ' ', p.apellido) AS paciente,
                p.cedula,
                p.fecha_nacimiento,
                p.email,
                p.telefono,
                p.genero,
                c.fecha,
                c.fin_tentativo,
                c.motivo
            FROM citas c 
            LEFT JOIN odontologos o ON c.odontologo_id = o.id
            LEFT JOIN pacientes p ON c.paciente_id = p.id
            WHERE c.id = $1;
        `;

        const results = await client.query(query, [id]);

        return NextResponse.json(results.rows[0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}