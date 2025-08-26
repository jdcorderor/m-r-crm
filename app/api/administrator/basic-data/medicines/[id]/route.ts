import { Client } from "pg";
import { NextRequest, NextResponse } from "next/server";

// PUT Route
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: number }> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

    const { nombre, descripcion } = await request.json();

    if (!id || !nombre) {
        return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }
    
    try {
        const query = `
            UPDATE medicamentos
            SET nombre = $1, descripcion = $2
            WHERE id = $3
            RETURNING *;
        `;
    
        await client.connect();

        const result = await client.query(query, [nombre, descripcion, id]);

        const updated = result.rows[0];

        if (!updated) {
            return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
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
        const query = `
            DELETE FROM medicamentos
            WHERE id = $1
            RETURNING *;
        `;

        await client.connect();

        const result = await client.query(query, [id]);

        const deleted = result.rows[0];

        if (!deleted) {
            return NextResponse.json({ error: "Medicine not found" }, { status: 404 });
        }

        return NextResponse.json({ deleted });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error }, { status: 500 });
    } finally {
        await client.end();
    }
}