import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";

// POST Route
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { dentist, user } = await request.json();
        
        if (!dentist || !user) {
            return NextResponse.json({ message: "Faltan campos obligatorios (odontólogo, usuario)" }, { status: 400 });
        }

        await client.connect();

        // Insert dentist
        const dentistResult = await client.query(
            "INSERT INTO odontologos (nombre, apellido, cedula, telefono, email, especialidad, descripcion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id",
            [
                dentist.firstname,
                dentist.lastname,
                dentist.id,
                dentist.phone,
                dentist.email,
                dentist.specialty,
                dentist.description
            ]
        );
        const dentistId = dentistResult.rows[0].id;

        // Insert user
        await client.query(
            "INSERT INTO usuarios (usuario, clave, rol, odontologo_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [
                user.username,
                await bcrypt.hash(user.password, 10),
                user.role,
                dentistId
            ]
        );

        return NextResponse.json( { message: "Usuario creado" }, { status: 201 });
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
        const { dentist, user, id } = await request.json();
        
        if (!dentist || !user) {
            return NextResponse.json({ message: "Faltan campos obligatorios (odontólogo, usuario)" }, { status: 400 });
        }

        await client.connect();
        
        // Update user
        const userResult = await client.query(
            `UPDATE usuarios
            SET usuario = $1, clave = $2, rol = $3
            WHERE id = $4 RETURNING odontologo_id`,
            [
                user.username,
                await bcrypt.hash(user.password, 10),
                user.role,
                id
            ]
        );
        const dentistId = userResult.rows[0].id;

        // Update dentist
        await client.query(
            `UPDATE odontologos
            SET nombre = $1, apellido = $2, cedula = $3, telefono = $4, email = $5, especialidad = $6, descripcion = $7
            WHERE id = $8 RETURNING *`,
            [
                dentist.firstname,
                dentist.lastname,
                dentist.id,
                dentist.phone,
                dentist.email,
                dentist.specialty,
                dentist.description,
                dentistId
            ]
        );

        return NextResponse.json( { message: "Usuario actualizado" }, { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}

// DELETE Route
export async function DELETE(request: NextRequest) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { key } = await request.json();
        
        if (!key) {
            return NextResponse.json({ message: "Llave no encontrada" }, { status: 400 });
        }

        await client.connect();

        // Delete user
        const deleteUserResult = await client.query(
            "DELETE FROM usuarios WHERE usuario = $1 RETURNING *", [key]
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