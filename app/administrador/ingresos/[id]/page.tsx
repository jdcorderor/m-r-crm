"use client"
import React, { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import { Payment } from "@/app/types/payment"
import { formatDate } from "@/hooks/homePageHooks"
import { Trash } from "lucide-react"

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
    
    // Get patient ID from URL params
    const { id } = useParams();

    // --------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // ---------------------------------------------------------------------------

    // State variable for patient payments
    const [payments, setPayments] = useState<Payment[]>([])

    // State variables for search bar
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // Get patient payments data from the DB using fetch
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch(`/api/administrator/income/${id}`, {
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

                setPayments(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, [id]);

    // Filtered payments
    const normalize = (str: string): string => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const filtered = payments.filter((pago) => {
        const term = normalize(searchTerm || "");
        const codeMatch = normalize(pago.codigo || "").includes(term);
        const dateMatch = normalize(formatDate(pago.fecha)).includes(term);
        return codeMatch || dateMatch;
    }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())

    // --------------------------------------------------------------------------
    
    // Payment deletion handler
    async function handlePaymentDeletion(key: string) {
        try {
            const response = await fetch(`/api/administrator/income/${key}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            window.location.reload();
    
        } catch (error) {
            console.error('Error durante la solicitud:', error);
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

                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Historial de Pagos</span>
                        <div className="bg-white py-1 space-y-2">
                            <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. 123-01015 | 01/01/2025" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>
                            
                            <div className="overflow-x-auto duration-500 max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="sticky top-0 bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">N° Consulta</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Monto</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Método de pago</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Referencia</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filtered.flatMap((p, index) =>
                                            <tr key={`${index}`} className="hover:bg-gray-50 text-sm cursor-pointer">
                                                <td className="px-4 py-2">{p.codigo || "-"}</td>
                                                <td className="px-4 py-2">{p.paciente || "-"}</td>
                                                <td className="px-4 py-2">{p?.fecha ? formatDate(p.fecha) : "-"}</td>
                                                <td className="px-4 py-2">{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(p?.monto)}</td>
                                                <td className="px-4 py-2">{p?.metodo || "-"}</td>
                                                <td className="px-4 py-2">{p?.referencia || "-"}</td>
                                                <td className="px-4 py-2">
                                                    <button className="text-red-600 mx-auto" onClick={() => handlePaymentDeletion(p.id.toString())}>
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        )}

                                        {(payments.length > 0 && filtered.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(payments.length === 0 && filtered.length === 0) && (
                                            <tr>
                                                <td colSpan={5} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay pagos registrados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-center my-7 gap-2">
                                <button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl" onClick={ () => { router.push(`/administrador/ingresos/${id}/historial-pagos`) } }>
                                    Ver consultas
                                </button>
                                <button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl" onClick={ () => { router.push("/administrador/ingresos") } }>
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