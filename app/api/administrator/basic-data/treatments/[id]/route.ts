import { Client } from "pg";
import { NextRequest, NextResponse } from "next/server";
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

async function deleteImage(publicURL: string): Promise<void> {
    try {
        const filePath = publicURL.split('/storage/v1/object/public/servicios/')[1]?.split('?')[0];

        if (!filePath) throw new Error("No se pudo extraer la ruta del archivo");

        const { error } = await supabase.storage
            .from("servicios")
            .remove([filePath]);

        if (error) {
            throw new Error(`Error al eliminar imagen: ${error.message}`);
        }
    } catch (err) {
        throw new Error(`Fallo al eliminar imagen: ${(err as Error).message}`);
    }
}

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

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
            WHERE id = $1
        `;

        const results = await client.query(query, [id]);

        return NextResponse.json(results.rows[0]);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// PUT Route
export async function PUT(request: NextRequest): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const treatment = await request.json();

    if (!treatment.id || !treatment.nombre || !treatment.descripcion || !treatment.duracion || !treatment.precio || !treatment.caracteristicas || !treatment.imagen_url) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }
    
    try {
        await client.connect();

        // -----------------------------------------

        const currentImageResult = await client.query("SELECT imagen_url FROM servicios WHERE id = $1", [treatment.id]);

        const currentImageURL = currentImageResult.rows[0].imagen_url;

        let publicURL;
        if (treatment.imagen_url && treatment.imagen_url.includes("https")) {
            publicURL = treatment.imagen_url;
        } else {
            if (currentImageURL) await deleteImage(currentImageURL);
            publicURL = await uploadImage(treatment.imagen_url);
        }

        // -----------------------------------------

        const query = `
            UPDATE servicios
            SET nombre = $1, descripcion = $2, duracion = $3, precio = $4, caracteristicas = $5, imagen_url = $6, activo = $7
            WHERE id = $8
            RETURNING *;
        `;

        const result = await client.query(query, [treatment.nombre, treatment.descripcion, treatment.duracion, treatment.precio, treatment.caracteristicas, publicURL, treatment.activo, treatment.id]);

        const updated = result.rows[0];

        if (!updated) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ updated });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// DELETE Route
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: number }> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "ID not detected" }, { status: 400 });
    }

    try {
        await client.connect();

        // -----------------------------------------

        const currentImageResult = await client.query("SELECT imagen_url FROM servicios WHERE id = $1", [id]);

        const currentImageURL = currentImageResult.rows[0].imagen_url;

        if (currentImageURL) await deleteImage(currentImageURL);

        // -----------------------------------------

        const query = `
            DELETE FROM servicios
            WHERE id = $1
            RETURNING *;
        `;

        const result = await client.query(query, [id]);

        const deleted = result.rows[0];

        if (!deleted) {
            return NextResponse.json({ error: "Service not found" }, { status: 404 });
        }

        return NextResponse.json({ deleted });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    } finally {
        await client.end();
    }
}