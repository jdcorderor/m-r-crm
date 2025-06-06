import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { jwtVerify } from "jose"

const protectedRoutes = ["/inicio", "/administracion", "/archivos", "/calendario", "/micuenta", "/pacientes", "/reportes"];
 
export async function middleware(request: NextRequest) {
    const token = request.cookies.get("authToken")?.value;
    
    // Protect all routes
    if (protectedRoutes.some(route => request.nextUrl.pathname.includes(route))) {
        if (!token) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        try {
            await jwtVerify(token, new TextEncoder().encode("$auth$key"));
            return NextResponse.next();
        } catch (error) {
            console.error(error);
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }
}