"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderC from "@/components/headerC";
import Loading from "@/components/loading";
import Input from "@/components/ui/input";
import { X, Check, Trash } from "lucide-react";
import { Comment } from "@/app/types/comment";
import { formatDate } from "@/hooks/homePageHooks";

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

    // State variable for comments array
    const [comments, setComments] = useState<Comment[]>([]);

    // Get comments data from the DB using fetch
    useEffect(() => {
        const fetchComments = async () => {
            try {
                const response = await fetch("/api/administrator/basic-data/comments", {
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
                setComments(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener comentarios:", error);
            }
        };

        fetchComments();
    }, []); 
    
    // Filtered comments
    const filteredComments = comments.filter((c) => {
        const emisor = c.emisor.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const email = c.email.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const fecha = formatDate(c.fecha).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const estado = c.estado.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const comentario = c.comentario.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return emisor.includes(termino) || email.includes(termino) || fecha.includes(termino) || estado.includes(termino) || comentario.includes(termino);
    });

    // ---------------------------------------------------------------------------

    // Comment update handler
    const handleUpdate = async (id: number, status: string) => {
        try {
            const response = await fetch(`/api/administrator/basic-data/comments/${id}`, {
                method: "PUT",
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ estado: status }),
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Comment deletion handler
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/administrator/basic-data/comments/${id}`, {
                method: 'DELETE',
                headers: { 
                    'Content-Type': 'application/json' 
                }
            });

            if (response.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
        }
    };

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

                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Comentarios</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Pedro Pérez | 01/01/2025 | pedroperez@gmail.com" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Emisor</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Comentario</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo electrónico</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Estado</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredComments.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-2">{c.emisor || "-"}</td>
                                                <td className="px-4 py-2">{c.comentario || "-"}</td>
                                                <td className="px-4 py-2">{c.email || "-"}</td>
                                                <td className="px-4 py-2">{formatDate(c.fecha) || "-"}</td>
                                                <td className="px-4 py-2">{c.estado.charAt(0).toUpperCase()}{c.estado.slice(1).toLowerCase()}</td>
                                                <td className="px-4 py-2 flex gap-2">
                                                    <button className="text-green-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Aprobar"
                                                        onClick={() => { handleUpdate(c.id, "aprobado") }}>
                                                        <Check className="w-4 h-4"></Check>
                                                    </button>
                                                    <button className="text-red-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Rechazar"
                                                        onClick={() => { handleUpdate(c.id, "rechazado") }}>
                                                        <X className="w-4 h-4"></X>
                                                    </button>
                                                    <button className="text-gray-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Eliminar"
                                                        onClick={() => { handleDelete(c.id) }}>
                                                        <Trash className="w-4 h-4"></Trash>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(comments.length > 0 && filteredComments.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(comments.length === 0 && filteredComments.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay comentarios registrados
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