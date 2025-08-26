import { Client } from "pg";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.SERVICE_ROLE_KEY || "");

async function uploadFile(base64String: string): Promise<{ ruta: string; tamaño_bytes: number }> {
    try {
        const mimeMatch = base64String.match(/^data:(.+);base64,/);
        if (!mimeMatch) throw new Error("Invalid base64 format");

        const tipo_mime = mimeMatch[1];
        const base64Data = base64String.split(",")[1];
        const buffer = Buffer.from(base64Data, "base64");
        const tamaño_bytes = buffer.length;
        const extension = tipo_mime.split("/")[1];

        const nombre_archivo = `${uuidv4()}.${extension}`;

        const { data, error } = await supabase.storage
            .from("archivos")
            .upload(nombre_archivo, buffer, {
                contentType: tipo_mime,
                upsert: false,
            });

        if (error || !data) {
            throw new Error(`Upload error: ${error?.message}`);
        }

        return { ruta: nombre_archivo, tamaño_bytes };
    } catch (err) {
        throw new Error(`Upload failure: ${(err as Error).message}`);
    }
}

// GET Route
export async function GET() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const result = await client.query(`
            SELECT a.id, a.paciente_id, CONCAT(p.nombre, ' ', p.apellido) AS paciente, p.cedula, a.ruta, a.fecha, a.nombre, a.tamaño
            FROM archivos a
            LEFT JOIN pacientes p ON p.id = a.paciente_id
            ORDER BY a.fecha DESC
        `);

        return NextResponse.json(result.rows);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// POST Route
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { codigo_paciente, base64, nombre } = await request.json();

        const { ruta, tamaño_bytes } = await uploadFile(base64);

        await client.connect();

        const patientResult = await client.query("SELECT paciente_id FROM historias WHERE codigo = $1", [codigo_paciente]);

        const paciente_id = patientResult.rows[0].paciente_id;

        const result = await client.query(
            `INSERT INTO archivos (paciente_id, ruta, fecha, nombre, tamaño)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [paciente_id, ruta, new Date().toISOString(), nombre, tamaño_bytes]
        );

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error }, { status: 500 });
    } finally {
        await client.end();
    }
}