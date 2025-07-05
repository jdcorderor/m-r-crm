import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// GET Route
export async function GET(request: NextRequest, context: { params: { username: string }}) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { username } = await context.params;

    try {
        await client.connect();

        const query = `
            SELECT
                u.id,
                u.usuario,
                u.rol,
                e.nombre,
                e.apellido,
                e.cedula,
                e.telefono,
                e.email
            FROM usuarios u 
            LEFT JOIN empleados e ON u.empleado_id = e.id
            WHERE u.usuario = $1
        `;

        const results = await client.query(query, [username]);

        const data = results.rows.map(row => ({
            id: row.id,
            employee: {
                firstname: row.nombre || null,
                lastname: row.apellido || null,
                id: row.cedula || null,
                phone: row.telefono || null,
                email: row.email || null,
            },
            user: {
                username: row.usuario || null,
                password: "",
                role: row.rol || null,
            }
        }));

        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}