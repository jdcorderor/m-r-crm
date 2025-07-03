import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const protectedRoutes = ["/inicio", "/administracion", "/archivos", "/calendario", "/micuenta", "/pacientes", "/reportes", "/usuarios"];
 
export async function middleware(request: NextRequest) {
    const token = request.cookies.get("authToken")?.value;
    
    // Protect all routes
    if (protectedRoutes.some(route => request.nextUrl.pathname.includes(route))) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            if (!process.env.JWT_KEY) {
                throw new Error("La llave no está definida en las variables de entorno");
            }

            await jwtVerify(token, new TextEncoder().encode(process.env.JWT_KEY));
            return NextResponse.next();
        } catch (error) {
            console.error(error);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
}