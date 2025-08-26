import { Client } from "pg";
import { NextResponse } from "next/server";

// PUT Route
export async function PUT(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { id } = await request.json();
        
        if (!id ) {
            return NextResponse.json({ message: "Faltan campos obligatorios (id)" }, { status: 400 });
        }

        await client.connect();

        // Update date
        await client.query(
            `UPDATE citas
            SET estado = $1
            WHERE id = $2 RETURNING *`,
            [
                "cancelada",
                id
            ]
        );

        return NextResponse.json( { message: "Cita cancelada" }, { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}