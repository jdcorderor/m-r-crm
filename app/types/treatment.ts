// Define treatment type
export type Treatment = {
    id: number,
    nombre: string,
    descripcion: string,
    duracion: number,
    precio: number,
    caracteristicas: string[],
    imagen_url: string,
    activo: boolean,
}

// Define treatment data type (for registration form)
export type TreatmentForm = Omit<Treatment, 'id'>;