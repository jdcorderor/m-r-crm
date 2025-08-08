"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import { Receipt, Eye } from "lucide-react"

export default function Users() {
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
    // State variable for loading view

    const [isLoading, setIsLoading] = useState(true);
    
    // ---------------------------------------------------------------------------
    type Paciente = {
        codigo?: number;
        cedula?: string;
        nombre: string;
        telefono: string;
        servicios_costo: number[]
        pagos: number[]
    }

    const calcular_deuda = (paciente : Paciente) => {
        let precio = paciente.servicios_costo?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
        let pagos = paciente.pagos?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
        return (pagos - precio)
    }

    const pacientesMock = [
        {
            "codigo": 1001,
            "cedula": "12345678",
            "nombre": "Ana González",
            "telefono": "0412-1234567",
            "servicios_costo" : [20,20,30],
            "pagos" : [10,30,50],
        },
        {
            "codigo": 1002,
            "cedula": "23456789",
            "nombre": "Carlos Pérez",
            "telefono": "0412-1234567",
            "servicios_costo" : [150,30],
            "pagos" : [10, 30, 80, 20],
        },
        {
            "codigo": 1003,
            "cedula": "34567890",
            "nombre": "María Rodríguez",
            "telefono": "0412-1234567",
            "servicios_costo" : [30],
            "pagos" : [10,10,10],
        },
        {
            "codigo": 1004,
            "cedula": "45678901",
            "nombre": "Luis Ramírez",
            "telefono": "0412-1234567",
            "servicios_costo" : [20],
            "pagos" : [10, 10],
        },
        {
            "codigo": 1005,
            "cedula": "56789012",
            "nombre": "Juliana Herrera",
            "telefono": "0412-1234567",
            "servicios_costo" : [50,20,30],
            "pagos" : [100,50],
        },
        {
            "codigo": 1006,
            "cedula": "67890123",
            "nombre": "Santiago Ortega",
            "telefono": "0412-1234567",
            "servicios_costo" : [25,36,30],
            "pagos" : [10,20, 91],
        },
        {
            "codigo": 1007,
            "cedula": "78901234",
            "nombre": "Raquel Medina",
            "telefono": "0412-1234567",
            "servicios_costo" : [230],
            "pagos" : [10,30,50,120],
        },
        {
            "codigo": 1008,
            "cedula": "89012345",
            "nombre": "Esteban Castillo",
            "telefono": "0412-1234567",
            "servicios_costo" : [20,10,5,30],
            "pagos" : [60],
        },
        {
            "codigo": 1009,
            "cedula": "90123456",
            "nombre": "Natalia Lugo",
            "telefono": "0412-1234567",
            "servicios_costo" : [20,30,15],
            "pagos" : [10,30],
        },
        {
            "codigo": 1010,
            "cedula": "01234567",
            "nombre": "Javier Suárez",
            "telefono": "0412-1234567",
            "servicios_costo" : [25,25,25],
            "pagos" : [15,20,30],
        },
        {
            "codigo": 9000,
            "cedula": "32067861",
            "nombre": "Nelson Guerrero",
            "telefono": "0412-1234567",
            "servicios_costo" : [20,25],
            "pagos" : [10,45],
        },
    ]
    const [searchTerm, setSearchTerm] = useState("");
    
    const pacientesFiltrados = pacientesMock.filter((paciente) => {
        const nombre = paciente.nombre.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cedula = paciente.cedula?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const id = paciente.codigo?.toString() || "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre.includes(termino) || cedula.includes(termino) || id.includes(termino);
    });
    pacientesFiltrados.sort((a, b) => calcular_deuda(a) - calcular_deuda(b)); // filtra segun la deuda más grande
    

    useEffect(() => { // Esto debe ir en el GET
        setIsLoading(false);
    }, []);

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <section>
            {isLoading && (
                <div className="flex justify-center items-center min-h-screen bg-white transition-opacity duration-500">
                    <Loading />
                </div>
            )}            
            
            {!isLoading && (
                <div>
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Buscar Paciente</span>
                        <div className="bg-white py-1">
                            <Input className="border border-gray-300 font-medium" 
                                    placeholder= "#id / 1234567 / Pedro Peréz"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}>
                            </Input>
                            <div className={`overflow-x-auto duration-500 max-h-[60vh]`}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Deuda</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Ver Pagos</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pacientesFiltrados.map((paciente) => (
                                            <tr key={paciente.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{paciente.codigo || "-"}</td>
                                                <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                <td className="px-4 py-2">{paciente.nombre || "-"}</td>
                                                <td className="px-4 py-2">{paciente.telefono || "-"}</td>
                                                {calcular_deuda(paciente) < 0 ? 
                                                    <td className="px-4 py-2 text-red-600">{calcular_deuda(paciente)}</td> : 
                                                    <td className="px-4 py-2 text-green-600">{calcular_deuda(paciente)}</td>
                                                }
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer flex flex-row" title="Ver Paciente"
                                                            onClick={() => router.push(`/especialista/pacientes/${paciente.codigo}`)}>
                                                        <Eye className="h-5 w-5"/>
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer flex flex-row" title="Historia de Pagos"
                                                            onClick={() => router.push(`/especialista/ingresos/historia_pagos/${paciente.codigo}`)}>
                                                        <Receipt className="h-5 w-5"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}