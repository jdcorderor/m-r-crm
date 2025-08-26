import { Client } from "pg";
import { NextResponse } from "next/server";
import { Appointment } from "@/app/types/appointment";

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT
                c.id AS id,
                CONCAT(p.nombre, ' ', p.apellido) AS patient,
                c.fecha AS date,
                c.fin_tentativo AS end,
                c.motivo AS reason,
                h.codigo AS record_id,
                o.id AS dentist_id,
                CONCAT(o.nombre, ' ', o.apellido) AS dentist
            FROM citas c
            INNER JOIN pacientes p ON c.paciente_id = p.id
            INNER JOIN historias h ON p.id = h.paciente_id
            INNER JOIN odontologos o ON c.odontologo_id = o.id
            WHERE c.estado = 'confirmada'
            ORDER BY c.fecha ASC;
        `;

        const results = await client.query(query);

        const appointments: Appointment[] = results.rows;

        // Agrupar por fecha (YYYY-MM-DD)
        const grouped = appointments.reduce((acc, app) => {
            const isoDate = new Date(app.date).toISOString().split("T")[0];
            if (!acc[isoDate]) acc[isoDate] = [];
            acc[isoDate].push(app);
            return acc;
        }, {} as Record<string, typeof appointments>);

        return NextResponse.json(grouped);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}