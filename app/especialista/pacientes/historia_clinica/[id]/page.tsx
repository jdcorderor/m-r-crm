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
    // const router = useRouter(); // No se usa en este archivo, se puede comentar o eliminar si no hay navegación

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
        <div>
            <HeaderB />
            <section className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
                {isLoading && (
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                        <Loading />
                    </div>
                )}
                {!isLoading && (
                    <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                        <main className="w-full">
                            <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                                Historia Clínica del Paciente
                            </h1>

                            <div className="flex flex-col items-center">
                                <div className="mt-8 flex flex-col border border-gray-200 shadow-lg p-8 rounded-lg w-full max-w-2xl">
                                    <div className="mb-5 border-b pb-4 border-gray-200">
                                        <h2 className="font-bold text-2xl text-gray-800 mb-2">{pacienteDetalles?.nombre}</h2>
                                        <p className="text-gray-600"><span>Código: <span className="font-medium">{pacienteDetalles?.codigo}</span></span></p>
                                    </div>
                                    <div className="my-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <p className="text-gray-600"><span>Sexo: <span className="font-medium">Género (dato de ejemplo)</span></span></p>
                                        <p className="text-gray-600"><span>Edad: <span className="font-medium">{calcularEdad(pacienteDetalles?.fecha_nacimiento)} años</span></span></p>
                                        <p className="text-gray-600"><span>Documento: <span className="font-medium">{pacienteDetalles?.cedula}</span></span></p>
                                        <p className="text-gray-600"><span>Teléfono: <span className="font-medium">04121234567 (dato de ejemplo)</span></span></p>
                                        <p className="text-gray-600 col-span-1 md:col-span-2"><span>Domicilio: <span className="font-medium">Casa 123, avenida 456, carabobo (dato de ejemplo)</span></span></p>
                                    </div>
                                    <div className="my-5 pt-4 border-t border-gray-200 text-center">
                                        <h2 className="font-semibold text-xl text-gray-800 mb-2">Antecedentes Médicos</h2>
                                        <p className="text-gray-600"><span>No refiere (dato de ejemplo)</span></p>
                                    </div>
                                </div>
                                <div className="flex justify-center mt-8">
                                    <Button
                                        className="px-8 py-3 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                                        onClick={() => { alert("Se debe implementar la edicion")}}
                                        >
                                        Editar
                                    </Button>
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
