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
                        <div className="flex flex-col justify-center items-center">
                            <div className="mt-8 flex flex-col border border-gray-200 shadow-md p-10 pb-2 rounded-3xl">
                                <div className="mb-5">
                                    <h1><span className="font-bold text-2xl">{pacienteDetalles?.nombre}</span></h1>
                                </div>
                                <div className="my-5">
                                    <p><span>Sexo: género</span></p>
                                    <p><span>Edad: {calcularEdad(pacienteDetalles?.fecha_nacimiento)}</span></p>
                                    <p><span>Código: {pacienteDetalles?.codigo}</span></p>
                                </div>
                                <div className="my-5">
                                    <p><span>Documento: {pacienteDetalles?.cedula}</span></p>
                                    <p><span>Domicilio: Casa 123, avenida 456, carabobo</span></p>
                                    <p><span>Teléfono: 04121234567</span></p>
                                </div>
                                <div className="my-5 text-center">
                                    <h1><span className="font-semibold text-xl">Antecedentes Médicos</span></h1>
                                    <p><span>No refiere</span></p>
                                </div>
                            </div>
                            <div className="flex flex-row mt-5">
                                <Button className="border border-gray-200 rounded-full px-10 hover:bg-gray-200">
                                    Editar
                                </Button>
                            </div>
                        </div>
                        
                    </main>
                </div>
            )}
        </section>
    );
};

export default PacientePage;