import { Client } from "pg";
import { NextResponse } from "next/server";

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT
                c.id,
                p.nombre AS paciente_nombre,
                p.apellido AS paciente_apellido,
                p.cedula,
                p.fecha_nacimiento,
                p.email,
                p.telefono,
                p.direccion,
                p.genero,
                o.nombre AS odontologo_nombre,
                o.apellido AS odontologo_apellido,
                c.fecha,
                c.fin_tentativo,
                c.motivo,
                c.estado
            FROM citas c 
            LEFT JOIN odontologos o ON c.odontologo_id = o.id
            LEFT JOIN pacientes p ON c.paciente_id = p.id
        `;

        const results = await client.query(query);

        const data = results.rows.map(row => ({
            id: row.id || null,
            patient_firstname: row.paciente_nombre || null,
            patient_lastname: row.paciente_apellido || null,
            patient_id: row.cedula || null,
            patient_birthdate: row.fecha_nacimiento || null,
            patient_email: row.email || null,
            patient_phone: row.telefono || null,
            patient_address: row.direccion || null,
            patient_gender: row.genero || null,
            dentist_firstname: row.odontologo_nombre || null,
            dentist_lastname: row.odontologo_apellido || null,
            date: row.fecha || null,
            end_time: row.fin_tentativo || null,
            reason: row.motivo || null,
            status: row.estado || null,
        }));
        
        return NextResponse.json(data);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}