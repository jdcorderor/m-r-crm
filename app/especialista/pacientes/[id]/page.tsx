"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react"
import HeaderB from "@/components/headerB"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import 'bootstrap-icons/font/bootstrap-icons.css'

const PacientePage = () => {
    const { id } = useParams();

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
        <section>
            {isLoading && (
                <div className="flex justify-center items-center min-h-screen bg-white transition-opacity duration-500">
                    <Loading />
                </div>
            )}
            {!isLoading && (
                <div>
                    {/* Header */}
                    <HeaderB />
                    <main className="w-full px-[5vw] pt-4">
                        <div className="my-5"> {/* Información y datos del paciente */}
                            <hr className="border border-gray-200 my-5"></hr>
                            <span className="block text-gray-800 text-2xl font-semibold">Consulta Médica</span>
                            <div className="flex flex-row w-full justify-between my-6">
                                <div className="flex flex-col gap-2 mt-5">
                                    <h3><span className="text-2xl font-bold">Paciente</span></h3>
                                    <h3><span>{`Número de Historia: ${id}`}</span></h3>
                                    <h3><span>{`Nombre: ${pacienteDetalles?.nombre}`}</span></h3>
                                    <h3><span>{`Edad: ${calcularEdad(pacienteDetalles?.fecha_nacimiento)}`}</span></h3>
                                </div>
                                <div className="flex flex-col gap-2 justify-end text-right">
                                    <Button className='rounded-2xl text-sm shadow-md border border border-gray-300 hover:bg-gray-200'
                                            onClick={() => {
                                                const date = new Date()
                                                const numero = (Math.round(Math.random() * 1000000)).toString().padStart(7, "0")
                                                setdateFormat(`${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getFullYear()}`)
                                                setconsultaNumber(`${numero}`)
                                            }}>
                                        Nueva Consulta
                                    </Button>
                                    <h3>N° de Consulta: <span className="font-bold">{consultaNumber}</span></h3>
                                    <h3>Fecha: <span className="font-bold">{dateFormat}</span></h3>
                                </div>
                            </div>
                            <div className="flex flex-row w-full justify-center gap-15">
                                <Button className="text-white rounded-full border border-gray-300 bg-blue-500 hover:bg-blue-600"
                                        onClick={() => {window.open(`/especialista/pacientes/historia_clinica/${id}`, '_blank')}}>
                                    Historia Clínica
                                </Button>
                                <Button className="text-white rounded-full border border-gray-300 bg-blue-500 hover:bg-blue-600">
                                    Historia de Consultas
                                </Button>
                                <Button className="text-white rounded-full border border-gray-300 bg-blue-500 hover:bg-blue-600">
                                    Historia Pagos
                                </Button>
                                <Button className="text-white rounded-full border border-gray-300 bg-green-500 hover:bg-green-600">
                                    Odontodiagrama
                                </Button>
                            </div>
                        </div>
                        <div className="my-10"> {/* Diagnóstico y Tratamiento Adicional */}
                            <hr className="border border-gray-200 my-5"></hr>
                            <span className="block text-gray-800 text-2xl font-bold">Diagnóstico y Tratamiento Adicional</span>
                            <div className="flex flex-col w-full justify-between my-6">
                                <div className="flex flex-row gap-2 my-5 justify-center items-center gap-15">
                                    <h3><span className="text-md">Diagnóstico</span></h3>
                                    <select className='border border-gray-300 shadow-md rounded-2xl text-md p-3'>
                                        <option value="Diagnóstico 1">Diagnóstico 1</option>
                                        <option value="Diagnóstico 2">Diagnóstico 2</option>
                                        <option value="Diagnóstico 3">Diagnóstico 3</option>
                                        <option value="Diagnóstico 4">Diagnóstico 4</option>
                                    </select>
                                </div>
                                <div className="flex flex-row gap-2 my-5 justify-center items-center gap-15">
                                    <h3><span className="text-md">Tratamiento</span></h3>
                                    <select className='border border-gray-300 shadow-md rounded-2xl text-md p-3'>
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
    );
};

export default PacientePage;