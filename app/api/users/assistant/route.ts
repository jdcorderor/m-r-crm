import { Client } from "pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// POST Route
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })
    
    try {
        const { employee, user } = await request.json();
        
        if (!employee || !user) {
            return NextResponse.json({ message: "Faltan campos obligatorios (empleado, usuario)" }, { status: 400 });
        }

        await client.connect();

        // Insert employee
        const employeeResult = await client.query(
            "INSERT INTO empleados (nombre, apellido, cedula, telefono, email) VALUES ($1, $2, $3, $4, $5) RETURNING id",
            [
                employee.firstname,
                employee.lastname,
                employee.id,
                employee.phone,
                employee.email,
            ]
        );
        const employeeId = employeeResult.rows[0].id;

        // Insert user
        await client.query(
            "INSERT INTO usuarios (usuario, clave, rol, empleado_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [
                user.username,
                await bcrypt.hash(user.password, 10),
                user.role,
                employeeId
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
        const { employee, user, id } = await request.json();
        
        if (!employee || !user) {
            return NextResponse.json({ message: "Faltan campos obligatorios (empleado, usuario)" }, { status: 400 });
        }

        await client.connect();
        
        // Update user
        const userResult = await client.query(
            `UPDATE usuarios
            SET usuario = $1, clave = $2, rol = $3
            WHERE id = $4 RETURNING empleado_id`,
            [
                user.username,
                await bcrypt.hash(user.password, 10),
                user.role,
                id
            ]
        );
        const employeeId = userResult.rows[0].empleado_id;

        // Update employee
        await client.query(
            `UPDATE empleados
            SET nombre = $1, apellido = $2, cedula = $3, telefono = $4, email = $5
            WHERE id = $6 RETURNING *`,
            [
                employee.firstname,
                employee.lastname,
                employee.id,
                employee.phone,
                employee.email,
                employeeId
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