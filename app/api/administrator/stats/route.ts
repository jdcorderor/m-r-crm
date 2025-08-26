import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        // -----------------------------------------------------------------

        const queryA = `SELECT COUNT(*) AS total_usuarios FROM usuarios`;

        const resultA = await client.query(queryA, []);
        const statA = resultA.rows[0]?.total_usuarios ?? 0;

        // -----------------------------------------------------------------

        const queryB = `SELECT COUNT(*) AS total_credenciales FROM credenciales`;

        const resultB = await client.query(queryB, []);
        const statB = resultB.rows[0]?.total_credenciales ?? 0;

        // -----------------------------------------------------------------

        const queryC = `SELECT COUNT(*) AS total_servicios FROM servicios`;

        const resultC = await client.query(queryC, []);
        const statC = resultC.rows[0]?.total_servicios ?? 0;

        // -----------------------------------------------------------------

        const queryD = `SELECT COUNT(*) AS total_odontologos FROM odontologos`;

        const resultD = await client.query(queryD, []);
        const statD = resultD.rows[0]?.total_odontologos ?? 0;

        // -----------------------------------------------------------------

        const queryE = `SELECT COUNT(*) AS total_pacientes FROM pacientes`;

        const resultE = await client.query(queryE, []);
        const statE = resultE.rows[0]?.total_pacientes ?? 0;

        // -----------------------------------------------------------------

        const queryF = `
            SELECT COUNT(*) AS total_citas
            FROM citas
            WHERE estado = 'confirmada' AND fecha >= date_trunc('week', CURRENT_DATE)
                AND fecha < date_trunc('week', CURRENT_DATE) + interval '7 days'
        `;

        const resultF = await client.query(queryF, []);
        const statF = resultF.rows[0]?.total_citas ?? 0;

        // -----------------------------------------------------------------

        const queryG = `
            SELECT COUNT(*) AS total_consultas
            FROM consultas
            WHERE fecha >= date_trunc('week', CURRENT_DATE)
                AND fecha < date_trunc('week', CURRENT_DATE) + interval '7 days'
        `;

        const resultG = await client.query(queryG, []);
        const statG = resultG.rows[0]?.total_consultas ?? 0;

        // -----------------------------------------------------------------

        const queryH = `
            SELECT
                SUM(p.monto) AS total_pagado
                FROM pagos p
            WHERE p.fecha >= CURRENT_DATE - INTERVAL '30 days';
        `;

        const resultH = await client.query(queryH, []);
        const statH = resultH.rows[0]?.total_pagado ?? 0;

        // -----------------------------------------------------------------

        const queryI = `
            SELECT
                (SELECT SUM(c.monto_total) FROM consultas c) AS total_consultas,
                (SELECT SUM(p.monto) FROM pagos p) AS total_pagado;
        `;

        const resultI = await client.query(queryI, []);
        const statI = ((resultI.rows[0]?.total_consultas ?? 0) - (resultI.rows[0]?.total_pagado ?? 0));
        
        // -----------------------------------------------------------------

        return NextResponse.json({ totalUsers: statA, totalCredentials: statB, totalServices: statC, totalDentists: statD, totalPatients: statE, weeklyAppointments: statF, weeklyConsultations: statG, paymentsLast30Days: statH, totalDebt: statI });

    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}