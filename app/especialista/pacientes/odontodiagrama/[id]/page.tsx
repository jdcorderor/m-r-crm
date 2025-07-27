"use client"
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from "react"
import HeaderB from "@/components/headerB"
import Button from "@/components/ui/button"
import Loading from "@/components/loading"
import { Odontodiagrama } from "@/components/odontodiagrama";
import 'bootstrap-icons/font/bootstrap-icons.css'

const OdontodiagramaPage = () => {
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
    const [consultaNumber, setconsultaNumber] = useState<string>("");
    const [dateFormat, setdateFormat] = useState<string>("");
    
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

    interface SectorData {
        dientes: { segmentos: Record<number, number> }[];
    }

    const testOdontodiagramaData = {
        1: {
            dientes: {
            0: { segmentos: { 1: 1, 2: 0, 3: 0, 4: 0, 5: 0 } }, // Diente 11, 
            1: { segmentos: { 1: 0, 2: 2, 3: 0, 4: 0, 5: 0 } }, // Diente 12, 
            2: { segmentos: { 1: 0, 2: 0, 3: 3, 4: 0, 5: 0 } }, // Diente 13, 
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 4, 5: 0 } }, // Diente 14,
            4: { segmentos: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 } }, // Diente 15,
            5: { segmentos: { 1: 6, 2: 6, 3: 6, 4: 6, 5: 6 } }, // Diente 16,
            6: {segmentos: { 1: 7, 2: 8, 3: 7, 4: 8, 5: 7 } }, // Diente 17,
            7: { segmentos: { 1: 8, 2: 7, 3: 8, 4: 7, 5: 8 } }, // Diente 18,
            },
        },
        2: {
            dientes: {
            0: { segmentos: { 1: 9, 2: 9, 3: 9, 4: 9, 5: 9 } }, // Diente 21
            1: { segmentos: { 1: 10, 2: 10, 3: 10, 4: 10, 5: 10 } }, // Diente 22
            2: { segmentos: { 1: 11, 2: 11, 3: 11, 4: 11, 5: 11 } }, // Diente 23
            3: { segmentos: { 1: 12, 2: 12, 3: 12, 4: 12, 5: 12 } }, // Diente 24
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }  }, // Diente 25
            5: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, // Diente 26
            6: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, // Diente 27
            7: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }, // Diente 28
            },
        },
        3: {
            dientes: {
            0: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            5: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            6: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            7: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
        4: {
            dientes: {
            0: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            5: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            6: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            7: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
        5: {
            dientes: {
            0: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
        6: {
            dientes: {
            0: { segmentos: { 1: 13, 2: 13, 3: 13, 4: 13, 5: 13 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
        7: {
            dientes: {
            0: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
        8: {
            dientes: {
            0: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            1: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            2: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            3: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            4: { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
            },
        },
    };

    const historias = [
        {
            "1": {
            "dientes": {
                "0": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 2, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 3, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 4, "5": 0 } },
                "4": { "segmentos": { "1": 5, "2": 5, "3": 5, "4": 5, "5": 5 } },
                "5": { "segmentos": { "1": 6, "2": 6, "3": 6, "4": 6, "5": 6 } },
                "6": { "segmentos": { "1": 7, "2": 8, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 8, "4": 7, "5": 0 } }
            }
            },
            "2": {
            "dientes": {
                "0": { "segmentos": { "1": 9, "2": 9, "3": 9, "4": 9, "5": 9 } },
                "1": { "segmentos": { "1": 10, "2": 10, "3": 10, "4": 10, "5": 10 } },
                "2": { "segmentos": { "1": 11, "2": 11, "3": 11, "4": 11, "5": 11 } },
                "3": { "segmentos": { "1": 12, "2": 12, "3": 12, "4": 12, "5": 12 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 } }
            }
            },
            "3": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "4": {
            "dientes": {
                "0": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 1, "2": 0, "3": 1, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "5": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "6": {
            "dientes": {
                "0": { "segmentos": { "1": 13, "2": 13, "3": 13, "4": 13, "5": 13 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "7": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "8": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            }
        },
        {
            "1": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 5, "2": 5, "3": 5, "4": 5, "5": 5 } },
                "5": { "segmentos": { "1": 6, "2": 6, "3": 6, "4": 6, "5": 6 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 2, "2": 0, "3": 0, "4": 1, "5": 0 } }
            }
            },
            "2": {
            "dientes": {
                "0": { "segmentos": { "1": 9, "2": 9, "3": 9, "4": 9, "5": 9 } },
                "1": { "segmentos": { "1": 10, "2": 10, "3": 10, "4": 10, "5": 10 } },
                "2": { "segmentos": { "1": 11, "2": 11, "3": 11, "4": 11, "5": 11 } },
                "3": { "segmentos": { "1": 12, "2": 12, "3": 12, "4": 12, "5": 12 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "3": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 3 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 3, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 2, "5": 0 } }
            }
            },
            "4": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 3, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 1, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 2, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 3 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "5": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "6": {
            "dientes": {
                "0": { "segmentos": { "1": 13, "2": 13, "3": 13, "4": 13, "5": 13 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "7": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "8": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            }
        },
        {
            "1": {
            "dientes": {
                "0": { "segmentos": { "1": 3, "2": 0, "3": 0, "4": 0, "5": 2 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 5, "2": 5, "3": 5, "4": 5, "5": 5 } },
                "5": { "segmentos": { "1": 6, "2": 6, "3": 6, "4": 6, "5": 6 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 3, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "2": {
            "dientes": {
                "0": { "segmentos": { "1": 9, "2": 9, "3": 9, "4": 9, "5": 9 } },
                "1": { "segmentos": { "1": 10, "2": 10, "3": 10, "4": 10, "5": 10 } },
                "2": { "segmentos": { "1": 11, "2": 11, "3": 11, "4": 11, "5": 11 } },
                "3": { "segmentos": { "1": 12, "2": 12, "3": 12, "4": 12, "5": 12 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "3": {
            "dientes": {
                "0": { "segmentos": { "1": 3, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 1 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 1, "3": 1, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 2, "3": 0, "4": 2, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "7": { "segmentos": { "1": 3, "2": 0, "3": 1, "4": 0, "5": 0 } }
            }
            },
            "4": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 3 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 1, "2": 0, "3": 3, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 1, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 2, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "5": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "6": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 1, "5": 2 } },
                "7": { "segmentos": { "1": 1, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "5": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "6": {
            "dientes": {
                "0": { "segmentos": { "1": 13, "2": 13, "3": 13, "4": 13, "5": 13 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "7": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            },
            "8": {
            "dientes": {
                "0": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "1": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "2": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "3": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } },
                "4": { "segmentos": { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 } }
            }
            }
        }
    ]
    const [currentOdontodiagramaData, setCurrentOdontodiagramaData] = useState<Record<number, SectorData>>({});
    const [seeHystori, setSeehystori] = useState<boolean>(false);
    const [seeNewOdonto, setSeeNewOdonto] = useState<boolean>(false);
    
    const handleOdontodiagramaChange = (data: Record<number, SectorData>) => {
        console.log("Odontodiagrama data changed:", data);
        setCurrentOdontodiagramaData(data);
        // Aquí podrías guardar los datos en una base de datos, enviarlos a una API, etc.
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
                    <main className="w-full px-[5vw] pt-4 bg-gray-100 min-h-screen">
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                                <div className="flex flex-row w-full justify-start">
                                    <Button className="bg-gray-300 rounded-full"
                                            onClick = {() => {window.history.back()}}>
                                        Volver
                                    </Button>
                                </div>
                                <h1 className="text-3xl font-bold text-gray-800 text-center">
                                    Odontodiagrama
                                </h1>
                                <div className="flex flex-row w-full justify-between my-3">
                                    <div className="flex flex-col gap-2 mt-5">
                                        <h3><span className="text-2xl font-bold">Paciente</span></h3>
                                        <p className="text-gray-600"><span>Número de Historia: <span className="font-medium">{id}</span></span></p>
                                        <p className="text-gray-600"><span>Nombre: <span className="font-medium">{pacienteDetalles?.nombre}</span></span></p>
                                        <p className="text-gray-600"><span>Edad: <span className="font-medium">{calcularEdad(pacienteDetalles?.fecha_nacimiento)} años</span></span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5">
                                    <div className="flex flex-row w-full justify-center gap-15">
                                        <Button className="text-white rounded-full border border-gray-300 bg-green-500 hover:bg-green-600"
                                                onClick={() => {setSeeNewOdonto(true); setSeehystori(false);}}>
                                            Nuevo Odontodiagrama
                                        </Button>
                                        <Button className="text-white rounded-full border border-gray-300 bg-green-500 hover:bg-green-600"
                                            onClick={() => {setSeeNewOdonto(false); setSeehystori(true);}}>
                                            Historico de Odontodiagrama
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className={seeNewOdonto ? "block" : "hidden"}>
                                <div className="mb-8">
                                    <div className="flex justify-between mt-10 mb-4">
                                        <h2 className="text-xl font-semibold mb-4">Id: 0000000</h2>
                                        <h2 className="text-xl font-semibold mb-4">{`Número de Historia: ${id}`}</h2>
                                        <h2 className="text-xl font-semibold mb-4">{`Nombre: ${pacienteDetalles?.nombre}`}</h2>
                                    </div>
                                    <Odontodiagrama
                                        onChange={handleOdontodiagramaChange}
                                        readOnly={false}
                                    />
                                </div>
                                <div className="flex justify-end mb-8">
                                    <Button className="bg-blue-500 hover:bg-blue-600 rounded-full text-white"
                                        onClick = {() => {alert("Implementar guardar cambios aquí :D")}}>
                                        Guardar Cambios
                                    </Button>
                                </div>
                            </div>
                            <div className={seeHystori ? "block" : "hidden"}>
                                {historias.map((historia, index) => (
                                    <div className="mb-8 mt-12" key={index}> {/* Added a unique key prop */}
                                        <div className="flex justify-between mt-10 mb-4">
                                            <h2 className="text-xl font-semibold mb-4">Id: {index}</h2>
                                            <h2 className="text-xl font-semibold mb-4">{`Número de Historia: ${id}`}</h2> 
                                            <h2 className="text-xl font-semibold mb-4">{`Nombre: ${pacienteDetalles?.nombre || 'N/A'}`}</h2>
                                        </div>
                                        <Odontodiagrama
                                            onChange={() => {}} // No hacer nada en modo lectura
                                            initialData={historia} // This is correct, 'historia' is the current JSON object
                                            readOnly={true}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
};

export default OdontodiagramaPage;