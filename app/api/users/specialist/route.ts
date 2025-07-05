import { Client } from "pg";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
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
        .from("odontologos")
        .upload(`${fileName}`, buffer, {
            contentType: 'image/jpeg',
            upsert: false,
        });

        if (error || !data) {
            throw new Error(`Error al subir imagen: ${error?.message}`);
        }

        const result = supabase.storage
        .from("odontologos")
        .getPublicUrl(`${fileName}`);

        return result.data.publicUrl;
    } catch (err) {
        throw new Error(`Fallo: ${(err as Error).message}`);
    }
}

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

        // Upload image
        const publicUrl = await uploadImage(dentist.image_url);

        // Insert dentist
        const dentistResult = await client.query(
            "INSERT INTO odontologos (nombre, apellido, cedula, telefono, email, especialidad, descripcion, imagen_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id",
            [
                dentist.firstname,
                dentist.lastname,
                dentist.id,
                dentist.phone,
                dentist.email,
                dentist.specialty,
                dentist.description,
                publicUrl
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

        // Upload image
        let publicUrl;

        if (dentist.image_url && dentist.image_url.includes("https")) {
            publicUrl = dentist.image_url;
        } else {
            publicUrl = await uploadImage(dentist.image_url);
        }
        
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
        const dentistId = userResult.rows[0].odontologo_id;

        // Update dentist
        await client.query(
            `UPDATE odontologos
            SET nombre = $1, apellido = $2, cedula = $3, telefono = $4, email = $5, especialidad = $6, descripcion = $7, imagen_url = $8
            WHERE id = $9 RETURNING *`,
            [
                dentist.firstname,
                dentist.lastname,
                dentist.id,
                dentist.phone,
                dentist.email,
                dentist.specialty,
                dentist.description,
                publicUrl,
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