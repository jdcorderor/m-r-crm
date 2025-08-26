// Define dental consultations type
export type DentalConsultations = {
    id: number,
    codigo: string,
    fecha: string,
    especialista: string,
    diagnostico: string[],
    tratamiento: string[],
    observaciones: string,
    monto_total: number,
    monto_pagado: number,
}