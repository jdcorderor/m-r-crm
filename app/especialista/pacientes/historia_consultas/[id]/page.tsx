'use client'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
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

    const consultas = [
        {
            "id": 1,
            "odontologo" : "Od. Patricia Román",
            "fecha": "2023-01-15",
            "servicio": ["Consulta General"],
            "observaciones" : "Revisión dental completa sin complicaciones",
            "estado_administrativo": "Pagado",
        },
        {
            "id": 2,
            "odontologo" : "Od. Ramón Mavarez",
            "fecha": "2023-03-15",
            "servicio": ["Consulta General","limpieza dental","extracción dental"],
            "observaciones" : "Revisión dental completa sin complicaciones",
            "estado_administrativo": "Sin pagar",
        },
        {
            "id": 3,
            "odontologo" : "Od. Patricia Román",
            "fecha": "2023-05-09",
            "servicio": ["Extracción dental"],
            "observaciones" : "Revisión dental completa sin complicaciones",
            "estado_administrativo": "Pagado",
        },
        {
            "id": 4,
            "odontologo" : "Od. Ramón Mavarez",
            "fecha": "2023-12-06",
            "servicio": ["Consulta General","limpieza dental"],
            "observaciones" : "Revisión dental completa sin complicaciones",
            "estado_administrativo": "Pagado",
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
                                Historial de Consultas
                            </h1>

                            {/* Información y datos del paciente */}
                            <div className="my-5 pb-8 border-b border-gray-200">
                                <h3 className="text-xl font-bold text-gray-700">Paciente</h3>
                                <div className="flex flex-row md:flex-row w-full justify-between gap-8 mt-2">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <p className="text-gray-600"><span>Número de Historia: <span className="font-medium">{id}</span></span></p>
                                        <p className="text-gray-600"><span>Nombre: <span className="font-medium">{pacienteDetalles?.nombre}</span></span></p>
                                        <p className="text-gray-600"><span>Edad: <span className="font-medium">{calcularEdad(pacienteDetalles?.fecha_nacimiento)} años</span></span></p>
                                    </div>
                                    <div className="flex-1 flex flex-col gap-2 text-right">
                                        <p className="text-gray-600"><span>Cantidad de Colsultas: <span className="font-medium">{consultas.length}</span></span></p>
                                        <p className="text-gray-600"><span>Última Consulta: <span className="font-medium">{consultas[consultas.length - 1].fecha}</span></span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Diagnóstico y Tratamiento Adicional */}
                            <div className="my-10">
                                <h2 className="block text-2xl font-bold text-gray-800 mb-4">Consultas Realizadas</h2>
                                <div className="flex flex-col w-full justify-center gap-8 my-6">
                                    { consultas.map((consulta) => (
                                        <div key={consulta.id} className="flex flex-col bg-white shadow-md rounded-xl p-6 w-full border border-gray-300">
                                            <div className="flex flex-row justify-between items-center mr-10">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{consulta.fecha}</h3> 
                                                <h3 className="text-lg font-semibold text-gray-800 mb-2">{consulta.id}</h3> 
                                            </div>
                                            <p className="text-gray-600"><span>Fecha: <span className="font-medium">{consulta.odontologo}</span></span></p>
                                            <p className="text-gray-600"><span>Servicio: <span className="font-medium">{consulta.servicio.join(", ")}</span></span></p>
                                            <p className="text-gray-600"><span>Observaciones: <span className="font-medium">{consulta.observaciones}</span></span></p>
                                            <p className={`text-gray-600 ${consulta.estado_administrativo === "Pagado" ? "text-green-600" : "text-red-600"}`}>
                                                <span>Estado Administrativo: <span className="font-medium">{consulta.estado_administrativo}</span></span>
                                            </p>
                                        </div>
                                    ))}
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
