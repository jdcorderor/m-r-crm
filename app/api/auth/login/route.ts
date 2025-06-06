import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json();
        
        if (username === "ramonmavarez" && password === "administrador") {
            const token = jwt.sign({
                username: username,
                name: "Od. Ramón Mavarez",
            }, "$auth$key");
                
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
        }

        return NextResponse.json({ message: "Login fallido" }, { status: 401 });
    } catch(error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
    }
}