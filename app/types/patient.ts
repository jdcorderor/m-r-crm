// Define patient type
export type Paciente = {
    codigo?: number;
    cedula?: string;
    nombre: string;
    apellido: string;
    fecha_nacimiento: string;
    email: string;
    telefono: string;
}