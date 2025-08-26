// Define payment type
export type Payment = {
    id: number,
    consulta_id: number,
    paciente: string,
    codigo: string,
    monto: number,
    metodo: string,
    referencia: string,
    fecha: string
}