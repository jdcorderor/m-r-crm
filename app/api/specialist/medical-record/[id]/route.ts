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
                p.nombre,
                p.apellido,
                p.cedula,
                p.fecha_nacimiento,
                p.genero,
                p.email,
                p.telefono,
                p.direccion,
                h.codigo,
                h.observaciones,
                h.antecedentes,
                h.fecha_modificacion
            FROM historias h 
            LEFT JOIN pacientes p ON p.id = h.paciente_id
            WHERE h.codigo = $1
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

// PUT Route
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: number }> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;
    const body = await request.json();

    try {
        await client.connect();

        const updateRecordQuery = `
            UPDATE historias
            SET observaciones = $1,
                antecedentes = $2,
                fecha_modificacion = $3
            WHERE codigo = $4
            RETURNING paciente_id
        `;

        const recordResult = await client.query(updateRecordQuery, [body.observaciones, body.antecedentes, new Date(), id]);

        if (recordResult.rowCount === 0) {
            return NextResponse.json({ error: 'Historia clínica no encontrada' }, { status: 404 });
        }

        const patientID = recordResult.rows[0].paciente_id;

        const updatePatientQuery = `
            UPDATE pacientes
            SET nombre = $1,
                apellido = $2,
                cedula = $3,
                fecha_nacimiento = $4,
                genero = $5,
                email = $6,
                telefono = $7,
                direccion = $8
            WHERE id = $9
        `;
        await client.query(updatePatientQuery, [body.nombre, body.apellido, body.cedula, body.fecha_nacimiento, body.genero, body.email, body.telefono, body.direccion, patientID]);

        return NextResponse.json({ message: 'Datos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    } finally {
        await client.end();
    }
}