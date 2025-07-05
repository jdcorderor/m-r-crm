import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{username: string}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { username } = await params;

    try {
        await client.connect();

        const query = `
            SELECT
                u.id,
                u.usuario,
                u.rol,
                o.nombre,
                o.apellido,
                o.cedula,
                o.telefono,
                o.email,
                o.especialidad,
                o.descripcion,
                o.imagen_url
            FROM usuarios u 
            LEFT JOIN odontologos o ON u.odontologo_id = o.id
            WHERE u.usuario = $1
        `;

        const results = await client.query(query, [username]);

        const data = results.rows.map(row => ({
            id: row.id,
            dentist: {
                firstname: row.nombre || null,
                lastname: row.apellido || null,
                id: row.cedula || null,
                phone: row.telefono || null,
                email: row.email || null,
                specialty: row.especialidad || null,
                description: row.descripcion || null,
                image_url: row.imagen_url || null,
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