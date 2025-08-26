"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import HeaderB from "@/components/headerB";

export default function Page() {
    // Router
    const router = useRouter();

    // State variable for user role
    const [user, setUser] = useState({
        username: "",
        role: "",
    });

    // User verification handler
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch("/api/auth/verify", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(user => ({
                        ...user,
                        username: data.message.username,
                        role: data.message.role,
                    }));
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/login");
            }
        };
        verifyAuth();
    }, [router]);

    // --------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <section>
            <HeaderB />

            <div className="flex flex-col max-w-xl bg-gray-50 border border-gray-200 rounded-2xl p-16 mx-auto my-24 gap-4">
                <p className="text-2xl text-center font-bold text-gray-700 pb-3 mb-4 border-b border-gray-200">Gestión de Reportes</p>
                <Button onClick={() => router.push("/especialista/reportes/orden-medica")} className="bg-gray-200 opacity-80 border-3 border-gray-300 rounded-full">Orden médica</Button>
                <Button onClick={() => router.push("/especialista/reportes/constancia")} className="bg-gray-200 opacity-80 border-3 border-gray-300 rounded-full">Constancia</Button>
                <Button onClick={() => router.push("/especialista/reportes/presupuesto")} className="bg-gray-200 opacity-80 border-3 border-gray-300 rounded-full">Presupuesto</Button>
                <Button onClick={() => router.push("/especialista/reportes/recipe")} className="bg-gray-200 opacity-80 border-3 border-gray-300 rounded-full">Récipe</Button>
                <Button onClick={() => router.push("/especialista/reportes/natalicios")} className="bg-gray-200 opacity-80 border-3 border-gray-300 rounded-full">Cumpleaños</Button>
            </div>
        </section>
    );
}