"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "@/components/loading";
import HeaderD from "@/components/headerD";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import { getAllReservations } from "@/app/services/allReservationsService";
import { formatDate } from "@/hooks/homePageHooks";
import { Eye, X } from "lucide-react";
import { Reservation } from "@/app/types/date";

export default function Page() {
    // Router
    const router = useRouter();
    
    // State variable for user
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

    // ---------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // State variable for search term
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // State variables for filter buttons
    const [selectedState, setSelectedState] = useState("pendiente por confirmación");

    // State variables for alert and modal visibility
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showSentModal, setShowSentModal] = useState<boolean>(false);
    const [showFailModal, setShowFailModal] = useState<boolean>(false);

    // ---------------------------------------------------------------------------
    
    // State variable for reservations array
    const [reservations, setReservations] = useState<Reservation[]>([]);

    // State variable for selected reservation
    const [reservation, setReservation] = useState<Reservation | null>(null);
        
    // Get reservations data from the DB using fetch
    useEffect(() => {
        if (user.role === "auxiliar") {
            getAllReservations()
            .then(data => {
                setReservations(data || []);
                setIsLoading(false);
            });
        } else if (user.role !== "") {
            setReservations([]);
        }
    }, [user.role]);

    // Filtered dates
    const filteredDates = reservations.filter((d) => {
        const paciente = `${d.patient_firstname} ${d.patient_lastname}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const fecha = formatDate(d.date).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const especialista = `${d.dentist_firstname} ${d.dentist_lastname}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "") || "";
        const termino = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return ((paciente.includes(termino) || fecha.includes(termino) || especialista.includes(termino)) && (d.status === selectedState));
    });

    // ---------------------------------------------------------------------------

    // Reservation cancellation handler
    const handleReservationCancellation = async (id: number) => {
        try { 
            const response = await fetch("/api/assistant/reservations/cancel", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id }),
                credentials: "include",
            });

            if (response.ok) {
                setShowSentModal(true);
            }
        } catch (error) {
            console.error("Error: ", error);
            setShowFailModal(true);
        }
    }
    
    // ---------------------------------------------------------------------------

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
                    <HeaderD />

                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-8">Gestión de Citas</span>
                        
                        <div className="w-fit border-2 border-gray-200 rounded-3xl mb-4 shadow-sm">
                            <button className={`text-sm px-4 py-2 border-gray-300  ${(selectedState === "pendiente por confirmación") ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setSelectedState("pendiente por confirmación") } }>Pendiente por confirmación</button>
                            <button className={`text-sm px-4 py-2 border-gray-300 ${(selectedState === "confirmada") ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setSelectedState("confirmada") } }>Confirmada</button>
                            <button className={`text-sm px-4 py-2 ${(selectedState === "cancelada") ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setSelectedState("cancelada") } }>Cancelada</button>
                        </div>

                        <Input className="border border-gray-300 text-sm font-medium shadow-none" placeholder="ej. Pedro Pérez | Od. Ramón Mavarez | 01/01/2025" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}></Input>

                        <div className="bg-white py-1">
                            <div className="overflow-x-auto max-h-[60vh]">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Motivo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Odontólogo</th>
                                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha y hora</th>
                                            <th className={`${(selectedState != "cancelada") ? "px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider" : "hidden"}`}>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filteredDates.map((r) => (
                                            <tr key={r.id} className="hover:bg-gray-50 text-sm">
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>{r.patient_firstname} {r.patient_lastname}</td>
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>{r.patient_phone}</td>
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>{r.patient_email}</td>
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>{r.reason}</td>
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>Od. {r.dentist_firstname} {r.dentist_lastname}</td>
                                                <td className={`px-4 ${(selectedState != "cancelada") ? "py-2" : "py-3"}`}>{formatDate(r.date!)} {r.end_time ? `- ${formatDate(r.end_time).split(", ")[1]}` : ""}</td>
                                                <td className={`${(selectedState != "cancelada") ? "px-4 py-2 flex gap-2 text-lg justify-center" : "hidden"}`}>
                                                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Ver más" onClick={() => { router.push(`/auxiliar/citas/${r.id}`); }}> 
                                                            <Eye className="w-5 h-5"></Eye>
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Cancelar" onClick={() => { setReservation(r); setShowModal(true); }}> 
                                                            <X className="w-5 h-5"></X>
                                                        </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(reservations.length > 0 && filteredDates.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(reservations.length === 0 && filteredDates.length === 0) && (
                                            <tr>
                                                <td colSpan={7} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay citas registradas
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Confirm deletion modal */}
                            {showModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm ">
                                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                                        <span className="block text-xl font-semibold text-center my-3">Cancelar la cita</span>
                                        <span className="block text-center text-sm mb-8">Al cancelar la cita, se enviará una notificación al correo electrónico del paciente: <strong>{reservation?.patient_email}</strong>.</span>
                                        <div className="flex justify-between mt-4 gap-2">
                                            <Button className="w-full bg-gray-200 hover:bg-gray-300 rounded-full text-sm" onClick={() => { setReservation(null); setShowModal(false); }}>
                                                Cancelar
                                            </Button>
                                            <Button className="w-full bg-gray-600 text-white hover:bg-gray-400 rounded-full text-sm" onClick={() => { handleReservationCancellation(Number(reservation?.id)); setShowModal(false); }}>
                                                Continuar
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success modal */}
                            {showSentModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm ">
                                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center">
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <span className="text-xl font-semibold text-center mb-2">¡La cita ha sido cancelada!</span>
                                        <span className="text-center text-sm text-gray-600 my-2">Por favor, <strong> verifique que haya sido enviado un correo electrónico. </strong></span>
                                        <Button className="w-full bg-green-300 hover:bg-green-400 rounded-full mt-3" onClick={() => { setShowSentModal(false); window.location.reload(); }}> 
                                            Continuar 
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Fail modal */}
                            {showFailModal && (
                                <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm">
                                    <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center">
                                        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <span className="text-xl font-semibold text-center mb-2">¡Ups, ha ocurrido un error!</span>
                                        <span className="text-center text-sm text-gray-600 my-2">Ha ocurrido un error inesperado. Por favor, intente nuevamente. Si el problema persiste, comuníquese con soporte.</span>
                                        <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-full py-2 mt-3 transition" onClick={() => setShowFailModal(false)}> 
                                            Continuar 
                                        </Button>
                                    </div>
                                </div>
                            )}                            

                            <div className="mt-8 flex justify-center gap-2">
                                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer" type="button" onClick={ () => { router.push(`/auxiliar/citas/registro`) }}>
                                    Registrar cita
                                </Button>
                                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer" type="button" onClick={ () => { router.push(`/auxiliar/citas/registro-paciente`) }}>
                                    Registrar paciente
                                </Button>
                            </div>
                        </div>
                    </main>  
                </div>
            )}
        </section>
    );
}