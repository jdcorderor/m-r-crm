import { Client } from "pg";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Buffer } from "buffer";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(process.env.SUPABASE_URL || "", process.env.ANON_KEY || "");

async function uploadImage(base64String: string): Promise<string> {
    try {
        const base64Data = base64String.split(',')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `${uuidv4()}.jpg`;

        const { data, error } = await supabase.storage
        .from("servicios")
        .upload(`${fileName}`, buffer, {
            contentType: 'image/jpeg',
            upsert: false,
        });

        if (error || !data) {
            throw new Error(`Error al subir imagen: ${error?.message}`);
        }

        const result = supabase.storage
        .from("servicios")
        .getPublicUrl(`${fileName}`);

        return result.data.publicUrl;
    } catch (err) {
        throw new Error(`Fallo: ${(err as Error).message}`);
    }
}

// GET Route
export async function GET(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const query = `
            SELECT
                id,
                nombre,
                descripcion,
                duracion,
                precio,
                caracteristicas,
                imagen_url,
                activo
            FROM servicios
        `;

        const results = await client.query(query, []);

        return NextResponse.json(results.rows);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// POST Route
export async function POST(request: Request): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const treatment = await request.json();

        if (!treatment.nombre || !treatment.descripcion || !treatment.duracion || !treatment.precio || !treatment.caracteristicas || !treatment.imagen_url) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // Upload image
        const publicURL = await uploadImage(treatment.imagen_url);

        await client.connect();

        const query = `
            INSERT INTO servicios (nombre, descripcion, duracion, precio, caracteristicas, imagen_url, activo)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await client.query(query, [treatment.nombre, treatment.descripcion, treatment.duracion, treatment.precio, treatment.caracteristicas, publicURL, treatment.activo]);

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}