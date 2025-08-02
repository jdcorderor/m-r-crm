import { Client } from "pg";
import { NextResponse } from "next/server";

// POST Route
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })

    try {
        const { paciente, odontologo, detalles } = await request.json();
        
        if (!paciente || !odontologo || !detalles) {
            return NextResponse.json({ message: "Faltan campos obligatorios (paciente, odontólogo, detalles)" }, { status: 400 });
        }

        const fecha = new Date(`${detalles.fecha_cita}T${detalles.hora_cita}:00-04:00`).toISOString();
        const fin_tentativo = new Date(`${detalles.fecha_cita}T${detalles.fin_tentativo}:00-04:00`).toISOString();

        await client.connect();

        let patientID: number;
        
        const getPatientResult = await client.query(
            "SELECT id FROM pacientes WHERE nombre = $1 AND apellido = $2 AND cedula = $3 AND fecha_nacimiento = $4 LIMIT 1",
            [paciente.nombre, paciente.apellido, paciente.cedula, paciente.fecha_nacimiento]
        );

        if (getPatientResult.rows.length != 0) {
            patientID = getPatientResult.rows[0].id;
        } else {
            const insertPatientResult = await client.query(
                "INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, email, telefono, direccion, genero) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
                [paciente.nombre, paciente.apellido, paciente.cedula, paciente.fecha_nacimiento, paciente.email, paciente.telefono, paciente.direccion, paciente.genero]
            );
            patientID = insertPatientResult.rows[0].id;
        }

        const result = await client.query(
            "INSERT INTO citas (odontologo_id, paciente_id, fecha, fin_tentativo, motivo, estado) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [odontologo, patientID, fecha, fin_tentativo, detalles.motivo, "confirmada"]
        );

        return NextResponse.json(result.rows[0], { status: 201 });
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
        const { paciente, odontologo, detalles } = await request.json();
        
        if (!paciente || !odontologo || !detalles) {
            return NextResponse.json({ message: "Faltan campos obligatorios (paciente, odontólogo, detalles)" }, { status: 400 });
        }

        const fecha = new Date(`${detalles.fecha_cita}T${detalles.hora_cita}:00-04:00`).toISOString();
        const fin_tentativo = new Date(`${detalles.fecha_cita}T${detalles.fin_tentativo}:00-04:00`).toISOString();

        await client.connect();

        // Update date
        const result = await client.query(
            `UPDATE citas
            SET fecha = $1, fin_tentativo = $2, motivo = $3, odontologo_id = $4, estado = $5
            WHERE id = $6 RETURNING paciente_id`,
            [
                fecha,
                fin_tentativo,
                detalles.motivo,
                odontologo,
                "confirmada",
                detalles.id
            ]
        );

        const patientID = result.rows[0].paciente_id;
        
        // Update patient
        await client.query(
            `UPDATE pacientes
            SET nombre = $1, apellido = $2, cedula = $3, fecha_nacimiento = $4, email = $5, telefono = $6, genero = $7, direccion = $8
            WHERE id = $9 RETURNING *`,
            [
                paciente.nombre,
                paciente.apellido,
                paciente.cedula,
                paciente.fecha_nacimiento,
                paciente.email,
                paciente.telefono,
                paciente.genero,
                paciente.direccion,
                patientID,
            ]
        );

        return NextResponse.json( { message: "Cita confirmada" }, { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}