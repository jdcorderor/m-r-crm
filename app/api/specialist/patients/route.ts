import { Client } from "pg";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT 
                h.codigo,
                p.cedula,
                p.nombre, 
                p.apellido,
                p.fecha_nacimiento,
                p.email,
                p.telefono
            FROM pacientes p
            LEFT JOIN historias h ON h.paciente_id = p.id
        `;

        const results = await client.query(query);

        return NextResponse.json(results.rows);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// POST Route
export async function POST(request: NextRequest): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { patient, record } = await request.json();

        const timestamp = new Date().toISOString();

        await client.connect();

        // -------------------------------------------------------------------------------------------

        const patientExists = await client.query("SELECT id FROM pacientes WHERE cedula = $1 LIMIT 1", [patient.cedula]);

        if (patientExists.rows.length != 0) {
            return NextResponse.json({ message: `Ya existe un paciente registrado con la C.I. ${patient.cedula}`}, { status: 401 })
        } else {
            let credentialID;

            const hasCredencial = typeof patient.credencial === "string" && patient.credencial.trim() !== "";

            if (hasCredencial) {
                const credentialsExist = await client.query(
                    "SELECT id FROM credenciales WHERE usuario = $1 LIMIT 1",
                    [patient.credencial]
                );

                if (credentialsExist.rows.length === 0) {
                    return NextResponse.json({ message: `La credencial ${patient.credencial} no existe. Por favor, ingrese una credencial válida` }, { status: 401 });
                }

                credentialID = credentialsExist.rows[0].id;
            } else {
                const insertCredentials = await client.query(
                    "INSERT INTO credenciales (usuario, clave) VALUES ($1, $2) RETURNING id",
                    [patient.cedula, await bcrypt.hash(`${patient.nombre[0].toUpperCase()}${patient.apellido[0].toUpperCase()}${patient.cedula}`, 10)]
                );

                // Credentials submission
                credentialID = insertCredentials.rows[0].id;
            }

            // -------------------------------------------------------------------------------------------

            const insertPatient = await client.query(
                "INSERT INTO pacientes (nombre, apellido, cedula, fecha_nacimiento, email, telefono, direccion, genero, credencial_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id",
                [patient.nombre, patient.apellido, patient.cedula, patient.fecha_nacimiento, patient.email, patient.telefono, patient.direccion, patient.genero, credentialID]
            );

            const patientID = insertPatient.rows[0].id;

            // -------------------------------------------------------------------------------------------

            const insertOdontogram = await client.query("INSERT INTO odontodiagramas DEFAULT VALUES RETURNING id", []);

            const odontogramID = insertOdontogram.rows[0].id;

            // -------------------------------------------------------------------------------------------

            for (let i = 0; i < 8; i++) {
                const insertSectors = await client.query(
                    "INSERT INTO sectores (nombre, odontodiagrama_id) VALUES ($1, $2) RETURNING id",
                    [i.toString(), odontogramID]
                );

                const sectorID = insertSectors.rows[0].id;

                if (i < 4) {
                    for (let j = 0; j < 8; j++) {
                        const insertTeeth = await client.query(
                            "INSERT INTO dientes (nombre, sector_id) VALUES ($1, $2) RETURNING id",
                            [j.toString(), sectorID]
                        );

                        const toothID = insertTeeth.rows[0].id;

                        for (let k = 1; k < 6; k++) {
                            await client.query(
                                "INSERT INTO segmentos (nombre, valor_afectacion, diente_id) VALUES ($1, $2, $3) RETURNING id",
                                [k.toString(), 0, toothID]
                            );
                        }
                    }
                } else {
                    for (let j = 0; j < 5; j++) {
                        const insertTeeth = await client.query(
                            "INSERT INTO dientes (nombre, sector_id) VALUES ($1, $2) RETURNING id",
                            [j.toString(), sectorID]
                        );

                        const toothID = insertTeeth.rows[0].id;

                        for (let k = 1; k < 6; k++) {
                            await client.query(
                                "INSERT INTO segmentos (nombre, valor_afectacion, diente_id) VALUES ($1, $2, $3) RETURNING id",
                                [k.toString(), 0, toothID]
                            );
                        }
                    }
                }
            }
            
            // -------------------------------------------------------------------------------------------

            const { rows } = await client.query("SELECT nextval('historias_codigo_seq') AS codigo");
            const codigo = rows[0].codigo;

            await client.query(
                "INSERT INTO historias (paciente_id, odontodiagrama_id, antecedentes, observaciones, codigo, fecha_modificacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                [patientID, odontogramID, record.antecedentes, record.observaciones, codigo, timestamp]
            )
        }

        return NextResponse.json({ message: "OK" }, {status: 201 });
    } catch (error) {
        console.error("Error inserting patient data:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    } finally {
        await client.end();
    }
}