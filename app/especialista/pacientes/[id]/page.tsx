'use client'
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react"
import HeaderB from "@/components/headerB" // Eliminado para simplificar y centrarse en el estilo interno
import Button from "@/components/ui/button" // Reemplazado por botones con estilo Tailwind directo
// import Input from "@/components/ui/input" // No utilizado en el código original, eliminado
import Loading from "@/components/loading"
import 'bootstrap-icons/font/bootstrap-icons.css' // Mantenido si los íconos son necesarios

const PacientePage = () => {
    const { id } = useParams();
    const router = useRouter();

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
    const pacienteDetalles = pacientesMock.find(paciente => paciente.codigo === Number(id))

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => { // Esto debe ir en el GET
        setIsLoading(false);
    }, []);

    const [consultaNumber, setconsultaNumber] = useState<string>("");
    const [dateFormat, setdateFormat] = useState<string>("");

    const calcularEdad = (fecha: string | undefined) => {
        if (!fecha) {
            return 0
        }
        const nacimiento = new Date(fecha);
        const hoy = new Date();
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const m = hoy.getMonth() - nacimiento.getMonth();
        if (m < 0 || (m === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }
        return edad;
    };

    return (
        <div>
            <section className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
                {isLoading && (
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                        <Loading />
                    </div>
                )}
                {!isLoading && (
                    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                        <main className="w-full">
                            <div className="flex flex-row w-full justify-start">
                                <Button className="bg-gray-300 rounded-full"
                                        onClick = {() => {window.history.back()}}>
                                    Volver
                                </Button>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                                Detalles del Paciente
                            </h1>

                            {/* Información y datos del paciente */}
                            <div className="my-5 pb-8 border-b border-gray-200">
                                <h2 className="block text-2xl font-bold text-gray-800 mb-4">Consulta Médica</h2>
                                <div className="flex flex-col md:flex-row w-full justify-between my-6 gap-8">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <h3 className="text-xl font-bold text-gray-700">Paciente</h3>
                                        <p className="text-gray-600"><span>Número de Historia: <span className="font-medium">{id}</span></span></p>
                                        <p className="text-gray-600"><span>Nombre: <span className="font-medium">{pacienteDetalles?.nombre}</span></span></p>
                                        <p className="text-gray-600"><span>Edad: <span className="font-medium">{calcularEdad(pacienteDetalles?.fecha_nacimiento)} años</span></span></p>
                                    </div>
                                    <div className="flex flex-col gap-2 md:text-right justify-end">
                                        <Button
                                            className='px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out max-w-fit'
                                            onClick={() => {
                                                const date = new Date()
                                                const numero = (Math.round(Math.random() * 1000000)).toString().padStart(7, "0")
                                                setdateFormat(`${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`)
                                                setconsultaNumber(`${numero}`)
                                            }}>
                                            Nueva Consulta
                                        </Button>
                                        <p className="text-gray-600">N° de Consulta: <span className="font-bold text-gray-800">{consultaNumber}</span></p>
                                        <p className="text-gray-600">Fecha: <span className="font-bold text-gray-800">{dateFormat}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col md:flex-row w-full justify-center gap-4 md:gap-8 mt-8">
                                    <Button
                                        className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                        onClick={() => { router.push(`/especialista/pacientes/historia_clinica/${id}`)}}>
                                        Historia Clínica
                                    </Button>
                                    <Button
                                        className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                            onClick={() => {router.push(`/especialista/pacientes/historia_consultas/${id}`)}}>
                                        Historia de Consultas
                                    </Button>
                                    <Button
                                        className="px-6 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                        onClick={() => {router.push(`/especialista/ingresos/historia_pagos/${id}`)}}>
                                        Historia Pagos
                                    </Button>
                                    <Button
                                        className="px-6 py-3 bg-green-500 text-white rounded-full shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                        onClick={() => { router.push(`/especialista/pacientes/odontodiagrama/${id}`) }}>
                                        Odontodiagrama
                                    </Button>
                                </div>
                            </div>
                            {/* Diagnóstico y Tratamiento Adicional */}
                            <div className="my-10">
                                <h2 className="block text-2xl font-bold text-gray-800 mb-4">Diagnóstico y Tratamiento Adicional</h2>
                                <div className="flex flex-col md:flex-row w-full justify-center gap-8 my-6">
                                    <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
                                        <label htmlFor="diagnostico-select" className="text-lg font-medium text-gray-700 mb-2">Diagnóstico</label>
                                        <select
                                            id="diagnostico-select"
                                            className='w-full md:w-auto border border-gray-300 shadow-sm rounded-lg text-md p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out'
                                        >
                                            <option value="Diagnóstico 1">Diagnóstico 1</option>
                                            <option value="Diagnóstico 2">Diagnóstico 2</option>
                                            <option value="Diagnóstico 3">Diagnóstico 3</option>
                                            <option value="Diagnóstico 4">Diagnóstico 4</option>
                                        </select>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2 items-center md:items-start">
                                        <label htmlFor="tratamiento-select" className="text-lg font-medium text-gray-700 mb-2">Tratamiento</label>
                                        <select
                                            id="tratamiento-select"
                                            className='w-full md:w-auto border border-gray-300 shadow-sm rounded-lg text-md p-3 focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out'
                                        >
                                            <option value="Tratamiento 1">Tratamiento 1</option>
                                            <option value="Tratamiento 2">Tratamiento 2</option>
                                            <option value="Tratamiento 3">Tratamiento 3</option>
                                            <option value="Tratamiento 4">Tratamiento 4</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </section>
        </div>
    );
};

export default PacientePage;
