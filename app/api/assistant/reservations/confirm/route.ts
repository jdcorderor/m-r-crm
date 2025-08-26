import { Client } from "pg";
import { NextResponse } from "next/server";

// POST Route
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })

    try {
        const { paciente_id, odontologo_id, fecha, fin_tentativo, motivo } = await request.json();
        
        if (!paciente_id|| !odontologo_id || !fecha || !fin_tentativo || !motivo) {
            return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
        }

        await client.connect();

        await client.query(
            "INSERT INTO citas (odontologo_id, paciente_id, fecha, fin_tentativo, motivo, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [odontologo_id, paciente_id, fecha, fin_tentativo, motivo, "confirmada"]
        );

        return NextResponse.json("OK", { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}   

// PUT Route
export async function PUT(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { id, fecha, fin_tentativo, odontologo_id, motivo } = await request.json();
        
        if (!id|| !fecha || !fin_tentativo || !odontologo_id || !motivo) {
            return NextResponse.json({ message: "Faltan campos obligatorios" }, { status: 400 });
        }

        await client.connect();

        await client.query(
            `UPDATE citas
            SET fecha = $1, fin_tentativo = $2, motivo = $3, odontologo_id = $4, estado = $5
            WHERE id = $6 RETURNING *`,
            [
                fecha,
                fin_tentativo,
                motivo,
                odontologo_id,
                "confirmada",
               id
            ]
        );

        return NextResponse.json( { message: "OK" }, { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}