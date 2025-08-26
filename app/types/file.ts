// Define uploaded file type
export type UploadedFile = {
    id: number,
    paciente_id: number,
    paciente: string,
    cedula: number,
    ruta: string,
    fecha: string,
    nombre: string,
    tamaño: number,
}