import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";
import { Client } from "pg";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    })

    try {
        await client.connect();
        const { username, password } = await request.json();
        
        const result = await client.query("SELECT usuario, clave, rol FROM usuarios WHERE usuario = $1", [username]);
        const user = result.rows[0];

        if (!user) {
            await client.end();
            return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
        }

        const passwordMatch = await bcrypt.compare(password, user.clave);
        if (!passwordMatch) {
            await client.end();
            return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 });
        }

        if (!process.env.JWT_KEY) {
            throw new Error("La llave no está definida en las variables de entorno");
        }

        const token = jwt.sign({
                username: username,
                role: user.rol,
            }, process.env.JWT_KEY, { expiresIn: "1d" });
                
        const cookie = serialize('authToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Requires SSL in production.
            sameSite: "strict",
            maxAge: 60 * 60 * 24,
            path: "/",
        });

        const response = NextResponse.json({ message: "OK" }, { status: 200 });
        response.headers.set("Set-Cookie", cookie);
        return response;
    } catch(error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    } finally {
        await client.end();
    }
}