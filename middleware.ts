import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

// Protected routes
const protectedRoutes = ["/administrador", "/especialista", "/auxiliar"];

// Restricted routes for each role
const roleRestrictions: Record<string, string[]> = {
  administrador: ["/especialista", "/auxiliar"],
  general: ["/administrador", "/auxiliar"],
  auxiliar: ["/administrador", "/especialista"]
};

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("authToken")?.value;
  
  const currentPath = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => currentPath.startsWith(route));

  if (!token) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  try {
    if (!process.env.JWT_KEY) {
      throw new Error("JWT_KEY is not defined in environment variables");
    }

    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_KEY));
    const userRole = payload.role as string;

    const restrictedPaths = roleRestrictions[userRole] || [];
    const isRestricted = restrictedPaths.some(route => currentPath.startsWith(route));

    if (isRestricted) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}