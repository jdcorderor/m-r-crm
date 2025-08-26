import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{username: number}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const { username } = await params;

        const result = await client.query("SELECT empleado_id FROM usuarios WHERE usuario = $1", [username]);

        const id = result.rows[0]?.empleado_id;

        if (!id) {
            return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
        }

        // -----------------------------------------------------------------

        const queryA = `
            SELECT 
                COUNT(*) AS citas_pendientes
            FROM citas
            WHERE estado = 'pendiente por confirmación'
        `;

        const resultA = await client.query(queryA, []);
        const statA = resultA.rows[0]?.citas_pendientes ?? 0;

        // -----------------------------------------------------------------

        const queryB = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE estado = 'confirmada' AND DATE(fecha) = CURRENT_DATE;
        `;

        const resultB = await client.query(queryB, []);
        const statB = resultB.rows[0].total ?? 0;

        // -----------------------------------------------------------------

        const queryC = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE estado = 'confirmada' AND fecha >= date_trunc('week', CURRENT_DATE) AND fecha < date_trunc('week', CURRENT_DATE + INTERVAL '1 week');
        `;

        const resultC = await client.query(queryC, []);
        const statC = resultC.rows[0]?.total ?? 0;

        // -----------------------------------------------------------------

        const queryD = `
            SELECT COUNT(*) AS total
            FROM citas
            WHERE estado = 'confirmada' AND fecha >= date_trunc('month', CURRENT_DATE) AND fecha < date_trunc('month', CURRENT_DATE + INTERVAL '1 month');
        `;

        const resultD = await client.query(queryD, []);
        const statD = resultD.rows[0]?.total ?? 0;

        // -----------------------------------------------------------------

        const queryE = "SELECT nombre, apellido FROM empleados WHERE id = $1";

        const resultE = await client.query(queryE, [id]);
        const statE = resultE.rows[0];

        return NextResponse.json({ firstName: statE?.nombre, lastName: statE?.apellido, requestedDates: statA, todayDates: statB, weekDates: statC, monthDates: statD });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}