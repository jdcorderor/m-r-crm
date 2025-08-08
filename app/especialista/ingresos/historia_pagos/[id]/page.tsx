'use client'
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import Input from '@/components/ui/input';
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

    const consultas = [
        {
            "id": 1,
            "odontologo" : "Od. Patricia Román",
            "fecha": "2023-01-15",
            "servicio": ["Consulta General"],
            "precio" : [50],
            "pagos" : [10,20,20],
        },
        {
            "id": 2,
            "odontologo" : "Od. Ramón Mavarez",
            "fecha": "2023-03-15",
            "servicio": ["Consulta General","limpieza dental","extracción dental"],
            "precio" : [20,15,100],
            "pagos" : [10,20,90],
        },
        {
            "id": 3,
            "odontologo" : "Od. Patricia Román",
            "fecha": "2023-05-09",
            "servicio": ["Extracción dental"],
            "precio" : [30],
            "pagos" : [10,20],
        },
        {
            "id": 4,
            "odontologo" : "Od. Ramón Mavarez",
            "fecha": "2023-12-06",
            "servicio": ["Consulta General","limpieza dental"],
            "precio" : [40,100],
            "pagos" : [10,90,40],
        },
    ]
    let saldoPaciente = 0;
    consultas.forEach((consulta) => {
        let precio = consulta.precio?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
        let pagos = consulta.pagos?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
        saldoPaciente += (pagos - precio)
    })
    
    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);
    const [modalNuevoPago, setmodalNuevoPago] = useState(false);
    
    // variables para visualizar los datos pendientes
    const [verPendientes, setVerPendientes] = useState(false);
    
    const consultasFiltro = consultas.filter((consulta) => {
        if (verPendientes) {
            let precio = consulta.precio?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
            let pagos = consulta.pagos?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
            if (precio > pagos) {
                return consulta
            }
        } else {
            return consulta
        }
    });

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
                                Historial de Pagos
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
                                        <p className="text-gray-600">
                                            {saldoPaciente > 0 ? <span className="font-bold text-green-700">Saldo a favor: <span>{saldoPaciente}</span></span> : 
                                            saldoPaciente < 0 ? <span className="font-bold text-red-700 ">Deuda Pendiente: <span>{saldoPaciente * -1}</span></span> : 
                                            <span className="font-bold text-green-700">Deuda Pendiente: <span>{saldoPaciente}</span></span>}
                                        </p>
                                        <Button className="rounded-full border border-gray-300 self-end"
                                            onClick={() => {setmodalNuevoPago(true)}}>
                                            Registrar Abono
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="my-10">
                                <div className="flex flex-row justify-between">
                                    <h2 className="block text-2xl font-bold text-gray-800 mb-4">Consultas Realizadas</h2>
                                    <Button className={`rounded-full border border-gray-100 text-white self-end focus:outline-none ${verPendientes ? "bg-red-500 hover:bg-red-400" : "bg-red-400 hover:bg-red-500"}`}
                                        onClick={() => {verPendientes ? setVerPendientes(false) : setVerPendientes(true)}}>
                                        Ver Pendientes
                                    </Button>
                                </div>
                                <div className="flex flex-col w-full justify-center gap-8 my-6">
                                    { consultasFiltro.map((consulta) => {
                                        const PrecioTotal = consulta.precio?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
                                        const PagosTotal = consulta.pagos?.reduce((acumulador, valorActual) => acumulador + valorActual, 0) || 0;
                                        return (
                                            <div key={consulta.id} className="flex flex-col bg-white shadow-md rounded-xl p-6 w-full border border-gray-300">
                                                <div className="flex flex-row justify-between items-center">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{consulta.fecha}</h3> 
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-2 mr-5">{consulta.id}</h3> 
                                                </div>
                                                <div className="flex flex-row justify-between items-end">
                                                    <div className="flex flex-col">
                                                        <p className="text-gray-600"><span>Fecha: <span className="font-medium">{consulta.odontologo}</span></span></p>
                                                        <p className="text-gray-600"><span>Servicio: <span className="font-medium">{consulta.servicio.join(", ")}</span></span></p>
                                                        <p className="text-gray-600"><span>Precio Total: <span className="font-medium">{PrecioTotal}</span></span></p>
                                                        <p className={`text-gray-600 ${PagosTotal >= PrecioTotal ? "text-green-600" : "text-red-600"}`}>
                                                            <span>Total Abonado: <span className="font-medium">{consulta.pagos?.reduce((acumulador, valorActual) => acumulador + valorActual, 0)}</span></span>
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-row justify-end items-end">
                                                        <Button className="rounded-full border border-gray-300"
                                                                onClick={() => {setmodalNuevoPago(true)}}>
                                                            Registrar Pago
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </main>
                    </div>
                )}
            </section>
            {modalNuevoPago && (
            <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center">
                    <span className="text-xl font-bold text-center mb-4">Ingrese los datos del Pago</span>
                    <div className="w-full flex flex-col mb-4">
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2 font-semibold">Monto:</label>
                            <Input type="number" className=" border border-gray-300 shadow-sm"></Input>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2 font-semibold">Fecha:</label>
                            <Input type="date" className=" border border-gray-300 shadow-sm"></Input>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2 font-semibold">Método:</label>
                            <Input type="text" className=" border border-gray-300 shadow-sm"></Input>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2 font-semibold">Referencia:</label>
                            <Input type="text" className=" border border-gray-300 shadow-sm"></Input>
                        </div>
                        <div className="flex flex-col">
                            <label className="text-gray-700 mb-2 font-semibold">Código:</label>
                            <Input type="text" className=" border border-gray-300 shadow-sm"></Input>
                        </div>
                    </div>
                    <Button className="bg-green-500 hover:bg-green-600 text-white border border-gray-300 p-3 px-5 rounded rounded-full "
                            onClick={() => {setmodalNuevoPago(false);
                                alert("Editar esto para ingresar un pago a una consulta")
                            }}>
                        Aceptar
                    </Button>
                </div>
            </div>
            )}
        </div>
        
    );
};

export default PacientePage;
