"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import { HousePlus, Eye } from "lucide-react"

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
        fecha_nacimiento: string;
    }
    const [verPaciente, setverPaciente] = useState<boolean>(false);
    const [PacienteDettales, setPacienteDettales] = useState<Paciente | null>(null);

    const pacientesMock = [
        {
            "codigo": 1001,
            "cedula": "12345678",
            "nombre": "Ana González",
            "fecha_nacimiento": "1990-03-12"
        },
        {
            "codigo": 1002,
            "cedula": "23456789",
            "nombre": "Carlos Pérez",
            "fecha_nacimiento": "1985-07-22"
        },
        {
            "codigo": 1003,
            "cedula": "34567890",
            "nombre": "María Rodríguez",
            "fecha_nacimiento": "2000-11-02"
        },
        {
            "codigo": 1004,
            "cedula": "45678901",
            "nombre": "Luis Ramírez",
            "fecha_nacimiento": "1978-01-18"
        },
        {
            "codigo": 1005,
            "cedula": "56789012",
            "nombre": "Juliana Herrera",
            "fecha_nacimiento": "1996-09-05"
        },
        {
            "codigo": 1006,
            "cedula": "67890123",
            "nombre": "Santiago Ortega",
            "fecha_nacimiento": "1989-06-30"
        },
        {
            "codigo": 1007,
            "cedula": "78901234",
            "nombre": "Raquel Medina",
            "fecha_nacimiento": "1993-12-21"
        },
        {
            "codigo": 1008,
            "cedula": "89012345",
            "nombre": "Esteban Castillo",
            "fecha_nacimiento": "1980-04-15"
        },
        {
            "codigo": 1009,
            "cedula": "90123456",
            "nombre": "Natalia Lugo",
            "fecha_nacimiento": "2002-08-10"
        },
        {
            "codigo": 1010,
            "cedula": "01234567",
            "nombre": "Javier Suárez",
            "fecha_nacimiento": "1995-05-27"
        },
        {
            "codigo": 9000,
            "cedula": "32067861",
            "nombre": "Nelson Guerrero",
            "fecha_nacimiento": "2007-01-08"
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


    useEffect(() => { // Esto debe ir en el GET
        setIsLoading(false);
    }, []);


    const calcularEdad = (fecha: string) => {
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };
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
                            <div className={`overflow-x-auto duration-500 ${verPaciente ? "max-h-[20vh]" : "max-h-[60vh]"}`}>
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">#</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Cédula</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Edad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {pacientesFiltrados.map((paciente) => (
                                            <tr key={paciente.nombre} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{paciente.codigo || "-"}</td>
                                                <td className="px-4 py-2">{paciente.cedula || "-"}</td>
                                                <td className="px-4 py-2">{paciente.nombre || "-"}</td>
                                                <td className="px-4 py-2">{calcularEdad(paciente.fecha_nacimiento)}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Ver Detalles"
                                                            onClick={() => {setPacienteDettales(paciente);
                                                                            setverPaciente(true);
                                                            }}> 
                                                        <Eye className="h-5 w-5"/>
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Atender"
                                                            onClick={() => router.push(`/especialista/pacientes/${paciente.codigo}`)}>
                                                        <HousePlus className="h-5 w-5"/>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className={`bg-white my-8 py-1 duration-500 ${verPaciente ? "block" : "hidden"}`}>
                            <div className="flex flex-col border border-gray-200 shadow-md w-full p-5 rounded-3xl gap-6">
                                <span className="block text-gray-800 text-3xl font-semibold ml-10">Detalles del Paciente</span>
                                <div className="flex flex-row w-full items-center justify-center">
                                    <div className="mx-3 w-[30%]">
                                        <p><span className="font-bold">Código:</span> {PacienteDettales ? `${PacienteDettales.codigo}` : "Prueba Código"}</p>
                                        <p><span className="font-bold">Cédula / RIF:</span> {PacienteDettales ? `${PacienteDettales.cedula}` : "Prueba Cédula / RIF"}</p>
                                    </div>
                                    <div className="mx-3 w-[30%]">
                                        <p><span className="font-bold">Nombre:</span> {PacienteDettales ? `${PacienteDettales.nombre}` : "Prueba Nombre"}</p>
                                        <p><span className="font-bold">Fecha de Nacimiento:</span> {PacienteDettales ? `${PacienteDettales.fecha_nacimiento}` : "Prueba fecha"}</p>
                                        <p><span className="font-bold">Edad:</span> {PacienteDettales ? `${calcularEdad(PacienteDettales.fecha_nacimiento)}` : "Prueba Edad"}</p>
                                    </div>
                                    <div className="mx-3 w-[30%]">
                                        <p><span className="font-bold">Email:</span> correo@ejemplo.com</p>
                                        <p><span className="font-bold">Número de Telefono:</span> 58 412 1234567</p>
                                    </div>
                                </div>
                                <div className="w-full flex items-center justify-center">
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-white mx-3"
                                    onClick={() => {if (PacienteDettales && PacienteDettales.codigo) {
                                                        router.push(`/especialista/pacientes/historia_clinica/${PacienteDettales.codigo}`)
                                            }}}>
                                        Historia Clínica
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-white mx-3"
                                            onClick={() => {if (PacienteDettales && PacienteDettales.codigo) {
                                            router.push(`/especialista/pacientes/historia_consultas/${PacienteDettales.codigo}`)
                                            }}}>
                                        Historia de Consultas
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-white mx-3"
                                            onClick={() => {if (PacienteDettales && PacienteDettales.codigo) {
                                            router.push(`/especialista/ingresos/historia_pagos/${PacienteDettales.codigo}`)
                                            }}}>
                                        Historia de Pagos
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 cursor-pointer rounded-full text-white mx-3"
                                            onClick={() => {if (PacienteDettales && PacienteDettales.codigo) {
                                            router.push(`/especialista/pacientes/odontodiagrama/${PacienteDettales.codigo}`)
                                            }}}>
                                        Odontodiagrama
                                    </Button>
                                    <Button className="bg-green-500 hover:bg-green-600 cursor-pointer rounded-full text-white mx-3"
                                            onClick={() => {if (PacienteDettales && PacienteDettales.codigo) {
                                            router.push(`/especialista/pacientes/${PacienteDettales.codigo}`)
                                            }}}>
                                        Iniciar Atención
                                    </Button>
                                    <Button className="bg-gray-300 rounded-full mx-3"
                                            onClick={() => setverPaciente(false)}>
                                        Volver
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}