// Define patient payments type
export type PatientPayments = {
    codigo: string,
    cedula: number,
    paciente: string,
    fecha_nacimiento: string,
    email: string,
    telefono: string,
    monto_total: number,
    monto_pagado: number
}