import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

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

        const user = jwt.verify(token, process.env.JWT_KEY);
        return NextResponse.json({ message: user }, { status: 200 });
    } catch(error) {
        console.error("Error:", error);
        return NextResponse.json({ message: "Token inválido" }, { status: 401 });
    }
}