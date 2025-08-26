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
            SELECT
                SUM(p.monto) AS total_pagado
            FROM pagos p
            WHERE p.fecha >= CURRENT_DATE - INTERVAL '30 days';
        `;

        const resultA = await client.query(queryA, []);
        const statA = resultA.rows[0]?.total_pagado ?? 0;

        const queryB = `
            SELECT
                (SELECT SUM(c.monto_total) FROM consultas c) AS total_consultas,
                (SELECT SUM(p.monto) FROM pagos p) AS total_pagado;
        `;

        const resultB = await client.query(queryB, []);
        const statB = ((resultB.rows[0]?.total_consultas ?? 0) - (resultB.rows[0]?.total_pagado ?? 0));

        const queryC = `
            WITH totales_por_paciente AS (
                SELECT
                    h.id AS historia_id,
                    COALESCE(SUM(c.monto_total), 0) AS total_consultas,
                    COALESCE(SUM(p.monto), 0) AS total_pagos
                FROM historias h
                LEFT JOIN consultas c ON c.historia_id = h.id
                LEFT JOIN consultas_pagos cp ON cp.consulta_id = c.id
                LEFT JOIN pagos p ON p.id = cp.pago_id
                GROUP BY h.id
            ),

            pacientes_con_deuda AS (
                SELECT *
                FROM totales_por_paciente
                WHERE total_pagos < total_consultas
            ),

            conteo_total AS (
                SELECT COUNT(*) AS total FROM totales_por_paciente
            ),

            conteo_con_deuda AS (
                SELECT COUNT(*) AS con_deuda FROM pacientes_con_deuda
            )

            SELECT
                CASE
                    WHEN total = 0 THEN 0
                    ELSE con_deuda * 100.0 / total
                END AS porcentaje_con_deuda
            FROM conteo_total, conteo_con_deuda;
        `;

        const resultC = await client.query(queryC, []);
        const statC = resultC.rows[0]?.porcentaje_con_deuda ?? 0;

        return NextResponse.json({ totalIncome: statA, pendingToPay: statB, debtPercentage: statC });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}