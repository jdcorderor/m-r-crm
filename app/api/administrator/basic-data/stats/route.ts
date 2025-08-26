import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const queryA = `
            SELECT COUNT(*) AS total_examenes
            FROM examenes;
        `;

        const resultA = await client.query(queryA, []);
        const statA = resultA.rows[0]?.total_examenes ?? 0;

        const queryB = `
            SELECT COUNT(*) AS total_medicamentos
            FROM medicamentos;
        `;

        const resultB = await client.query(queryB, []);
        const statB = resultB.rows[0]?.total_medicamentos ?? 0;

        const queryC = `
            SELECT COUNT(*) AS total_servicios
            FROM servicios;
        `;

        const resultC = await client.query(queryC, []);
        const statC = resultC.rows[0]?.total_servicios ?? 0;

        const queryD = `
            SELECT COUNT(*) AS total_comentarios
            FROM comentarios
            WHERE estado = 'pendiente';
        `;

        const resultD = await client.query(queryD, []);
        const statD = resultD.rows[0]?.total_comentarios ?? 0;

        return NextResponse.json({ exams: statA, medicines: statB, services: statC, comments: statD });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}