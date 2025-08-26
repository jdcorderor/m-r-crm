import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// PUT Route
export async function PUT(request: NextRequest) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { key } = await request.json();
        
        if (!key) {
            return NextResponse.json({ message: "Llave no encontrada" }, { status: 400 });
        }

        await client.connect();

        const deleteUserResult = await client.query(
            "UPDATE usuarios SET operativo = $1 WHERE usuario = $2 RETURNING *", [false, key]
        );

        if (deleteUserResult.rowCount === 0) {
            return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
        }

        return NextResponse.json({ message: "Usuario eliminado" }, { status: 200 });
    } catch (error) {
        console.error("Error al obtener datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}