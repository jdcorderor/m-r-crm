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

async function deleteImage(publicURL: string): Promise<void> {
    try {
        const filePath = publicURL.split('/storage/v1/object/public/odontologos/')[1]?.split('?')[0];

        if (!filePath) throw new Error("No se pudo extraer la ruta del archivo");

        const { error } = await supabase.storage
            .from("odontologos")
            .remove([filePath]);

        if (error) {
            throw new Error(`Error al eliminar imagen: ${error.message}`);
        }
    } catch (err) {
        throw new Error(`Fallo al eliminar imagen: ${(err as Error).message}`);
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
        const publicURL = await uploadImage(dentist.image_url);

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
                publicURL
            ]
        );
        const dentistID = dentistResult.rows[0].id;

        // Insert user
        await client.query(
            "INSERT INTO usuarios (usuario, clave, rol, odontologo_id) VALUES ($1, $2, $3, $4) RETURNING *",
            [
                user.username,
                await bcrypt.hash(user.password, 10),
                user.role,
                dentistID
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
    });

    try {
        const { dentist, user, id } = await request.json();

        if (!dentist || !user) {
            return NextResponse.json({ message: "Faltan campos obligatorios (odontólogo, usuario)" }, { status: 400 });
        }

        await client.connect();

        // Update user
        let userResult;

        if (user.password && user.password.trim() !== "") {
            userResult = await client.query(
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
        } else {
            userResult = await client.query(
                `UPDATE usuarios
                SET usuario = $1, rol = $2
                WHERE id = $3 RETURNING odontologo_id`,
                [
                    user.username,
                    user.role,
                    id
                ]
            );
        }
        const dentistID = userResult.rows[0].odontologo_id;

        const currentImageResult = await client.query(
            "SELECT imagen_url FROM odontologos WHERE id = $1",
            [dentistID]
        );

        const currentImageURL = currentImageResult.rows[0]?.imagen_url;

        let publicURL;
        if (dentist.image_url && dentist.image_url.includes("https")) {
            publicURL = dentist.image_url;
        } else {
            if (currentImageURL) await deleteImage(currentImageURL);
            publicURL = await uploadImage(dentist.image_url);
        }

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
                publicURL,
                dentistID
            ]
        );

        return NextResponse.json({ message: "Usuario actualizado" }, { status: 201 });
    } catch (error) {
        console.error("Error al enviar datos:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    } finally {
        await client.end();
    }
}