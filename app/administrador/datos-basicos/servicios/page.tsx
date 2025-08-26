"use client"
import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import { Pencil, Trash } from "lucide-react"
import { Treatment } from "@/app/types/treatment"

export default function Page() {
    // Router
    const router = useRouter();
    
    // State variable for user role
    const [user, setUser] = useState({
        username: "",
        role: "",
    });
    
    // User verification handler
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch("/api/auth/verify", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(user => ({
                        ...user,
                        username: data.message.username,
                        role: data.message.role,
                    }));
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/login");
            }
        };
        verifyAuth();
    }, [router]);

    // --------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // State variables for search bar
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // State variable for treatments array
    const [treatments, setTreatments] = useState<Treatment[]>([]);
    
    // Get treatments data from the DB using fetch
    useEffect(() => {
        const fetchTreatments = async () => {
            try {
                const response = await fetch("/api/administrator/basic-data/treatments", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
    
                const data = await response.json();
                setTreatments(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener servicios:", error);
            }
        };
    
        fetchTreatments();
    }, []); 
        
    // Filtered treatments
    const filteredTreatments = treatments.filter((t) => {
        const nombre = t?.nombre?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const descripcion = t?.descripcion?.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return nombre?.includes(termino) || descripcion?.includes(termino);
    });

    // --------------------------------------------------------------------------

    // Treatment deletion handler
    async function handleTreatmentDeletion(id: number) {
        try {
            const response = await fetch(`/api/administrator/basic-data/treatments/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    }

    // --------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <section>
            {isLoading && (
                <div className="flex justify-center items-center min-h-screen bg-white transition-opacity duration-500">
                    <Loading />
                </div>
            )}            
            
            {!isLoading && (
                <div>
                    <HeaderC />

                    {/* Treatments table */}
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Servicios/Tratamientos</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Tratamiento de Conducto" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Servicio/Tratamiento</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Descripción</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Duración</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Precio</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Visibilidad</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredTreatments.map((t) => (
                                            <tr key={t.id} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{t.nombre || "-"}</td>
                                                <td className="px-4 py-2 max-w-sm truncate">{t.descripcion || "-"}</td>
                                                <td className="px-4 py-2">{t.duracion} minutos</td>
                                                <td className="px-4 py-2 capitalize">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(t.precio)}</td>
                                                <td className="px-4 py-2 capitalize">{t.activo ? "Sí" : "No"}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Editar" onClick={() => { router.push(`/administrador/datos-basicos/servicios/${t.id}`) }}> 
                                                        <Pencil className="w-4 h-4"></Pencil>
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Eliminar" onClick={ () => handleTreatmentDeletion(Number(t.id)) }>
                                                        <Trash className="w-4 h-4"></Trash>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(treatments.length > 0 && filteredTreatments.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(treatments.length === 0 && filteredTreatments.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay servicios/tratamientos registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-8 flex justify-center gap-2">
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => { router.push("/administrador/datos-basicos/servicios/registro") }}
                                >
                                    Registrar servicio
                                </button>
                                <button
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer"
                                    type="button"
                                    onClick={() => router.push("/administrador/datos-basicos") }
                                >
                                    Volver
                                </button>
                            </div>
                        </div>
                    </main>
                </div>
            )}
        </section>
    );
}