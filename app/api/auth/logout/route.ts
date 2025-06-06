import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export async function GET(request: NextRequest) {
    const cookie = request.cookies.get("authToken");
    const token = cookie?.value;
        
    if (!token) {
        return NextResponse.json({ message: "Cookie no encontrada" }, { status: 400 });
    }
    
    try {
        if (!process.env.JWT_KEY) {
            throw new Error("La llave no está definida en las variables de entorno");
        }
        
        jwt.verify(token, process.env.JWT_KEY);

        const cookie = serialize("authToken", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Requires SSL in production.
            sameSite: "strict",
            maxAge: 0,
            path: "/",
        });

        const response = NextResponse.json({ message: "OK" }, { status: 200 });
        response.headers.set("Set-Cookie", cookie);
        return response;
    } catch(error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }
}