import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";
import { Appointment } from "@/app/types/appointment";

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{user: string}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { user } = await params;

    try {
        await client.connect();

        const query = `
            SELECT
                c.id AS id,
                CONCAT(p.nombre, ' ', p.apellido) AS patient,
                c.fecha AS date,
                c.fin_tentativo AS end,
                c.motivo AS reason,
                h.codigo AS record_id
            FROM usuarios u
            INNER JOIN odontologos o ON u.odontologo_id = o.id
            INNER JOIN citas c ON c.odontologo_id = o.id
            INNER JOIN pacientes p ON c.paciente_id = p.id
            INNER JOIN historias h ON p.id = h.paciente_id
            WHERE u.usuario = $1 AND c.estado = 'confirmada'
            ORDER BY c.fecha ASC;
        `;

        const results = await client.query(query, [user]);

        const appointments: Appointment[] = results.rows;

        // Group by date (YYYY-MM-DD)
        const grouped = appointments.reduce((acc, app) => {
            const isoDate = new Date(app.date).toISOString();
            const key = isoDate.split("T")[0];
            if (!acc[key]) acc[key] = [];
            acc[key].push(app);
            return acc;
        }, {} as Record<string, typeof appointments>);

        return NextResponse.json(grouped);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}