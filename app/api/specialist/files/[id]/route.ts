import { Client } from "pg";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient( process.env.SUPABASE_URL || "", process.env.SERVICE_ROLE_KEY || "");

// DELETE Route
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { id } = await params;
        await client.connect();

        const result = await client.query(`SELECT ruta FROM archivos WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        const ruta = result.rows[0].ruta;

        const { error: storageError } = await supabase.storage
            .from("archivos")
            .remove([ruta]);

        if (storageError) {
            console.error("Error deleting file from Supabase:", storageError);
            return NextResponse.json({ message: "Failed to delete file from Storage" }, { status: 500 });
        }

        await client.query(`DELETE FROM archivos WHERE id = $1`, [id]);

        return NextResponse.json({ message: "File deleted successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// GET Signed Preview URL
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { id } = await params;
        await client.connect();

        const result = await client.query(`SELECT ruta FROM archivos WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        const ruta = result.rows[0].ruta;

        const { data, error } = await supabase.storage
            .from("archivos")
            .createSignedUrl(ruta, 600);

        if (error || !data?.signedUrl) {
            console.error("Error generating signed URL:", error);
            return NextResponse.json({ message: "Failed to generate preview URL" }, { status: 500 });
        }

        return NextResponse.json({ previewUrl: data.signedUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// POST Signed Download URL
export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        const { id } = await request.json();
        await client.connect();

        const result = await client.query(`SELECT ruta FROM archivos WHERE id = $1`, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ message: "File not found" }, { status: 404 });
        }

        const ruta = result.rows[0].ruta;

        const { data, error } = await supabase.storage
            .from("archivos")
            .createSignedUrl(ruta, 600, { download: true });

        if (error || !data?.signedUrl) {
        console.error("Error generating download URL:", error);
        return NextResponse.json({ message: "Failed to generate download URL" }, { status: 500 });
        }

        return NextResponse.json({ downloadUrl: data.signedUrl });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: error }, { status: 500 });
    } finally {
        await client.end();
    }
}