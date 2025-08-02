"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderD from "@/components/headerD";
import Loading from "@/components/loading";
import SearchBar from "@/components/searchBar";
import Button from "@/components/ui/button";
import { getAllReservations } from "@/app/services/allReservationsService";
import { formatDate } from "@/hooks/homePageHooks";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Reservations() {
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

    // ---------------------------------------------------------------------------

    // State variables for filter buttons
    const [pending, setPending] = useState(true);
    const [confirmed, setConfirmed] = useState(false);
    const [cancelled, setCancelled] = useState(false);

    // State variables for alert and modal visibility
    const [showModal, setShowModal] = useState<boolean>(false);
    const [showSentModal, setShowSentModal] = useState<boolean>(false);
    const [showFailModal, setShowFailModal] = useState<boolean>(false);

    // State variable for selected reservation
    const [reservation, setReservation] = useState<Reservation>();

    // ---------------------------------------------------------------------------
        
    // Reservation type
    type Reservation = {
        id?: number,
        patient_firstname?: string,
        patient_lastname?: string,
        patient_id?: number,
        patient_birthdate?: string,
        patient_email?: string,
        patient_phone?: string,
        patient_address?: string,
        patient_gender?: string,
        dentist_firstname?: string,
        dentist_lastname?: string,
        date?: string,
        end_time?: string,
        reason?: string,
        status?: string,
    };
    
    // State variable for reservations array
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filtered, setFiltered] = useState<Reservation[]>([]);
        
    // Get reservations data from the DB using fetch (for auxiliar)
    useEffect(() => {
        if (user.role === "auxiliar") {
            getAllReservations()
            .then(data => {
                setReservations(data || []);
                setFiltered(data || []);
                setIsLoading(false);
            });
        } else if (user.role !== "") {
            setReservations([]);
        }
    }, [user.role]);

    // ---------------------------------------------------------------------------

    // Search handler
    const handleSearch = (query: string) => {        
        if (query != "") {
            const result = reservations.filter((r) =>
                r.patient_firstname?.toLowerCase().includes(query.toLowerCase()) ||
                r.patient_lastname?.toLowerCase().includes(query.toLowerCase()) ||
                r.patient_email?.toLowerCase().includes(query.toLowerCase()) ||
                r.patient_id?.toString().includes(query) ||
                r.dentist_firstname?.toLowerCase().includes(query.toLowerCase()) ||
                r.dentist_lastname?.toLowerCase().includes(query.toLowerCase()) ||
                formatDate(r.date!).toLowerCase().includes(query.toLowerCase()) ||
                formatDate(r.end_time!).toLowerCase().includes(query.toLowerCase())
            );

            setFiltered(result);
        } else {
            setFiltered(reservations);
        }
    };

    // ---------------------------------------------------------------------------

    // Email submission handler
    const handleEmailSubmission = async () => {
        const data = {
            email: reservation?.patient_email,
            subject: `Cancelación de cita - ${reservation?.patient_firstname} ${reservation?.patient_lastname} | Mavarez & Román`,
            text: `
                <p>Estimado paciente,</p>
                <p>Le informamos que su cita en <strong>Mavarez & Román</strong>, pautada para el día 
                <strong>${reservation?.date?.split("T")[0].split("-")[2]}-${reservation?.date?.split("-")[1]}-${reservation?.date?.split("-")[0]}</strong> 
                con el/la <strong>Od.  ${reservation?.dentist_firstname?.split(" ")[0]} ${reservation?.dentist_lastname?.split(" ")[0]}</strong>; ha sido cancelada.</p>
            `
        }
        
        const response = await fetch("/api/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
            credentials: "include",
        });

        if (!response.ok) {
            console.error("Error en la petición:", response.statusText);
        }
    }

    // Reservation cancellation handler
    const handleCancellation = async (id: number) => {
        try { 
            const response = await fetch("/api/reservations/cancel", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: id }),
                credentials: "include",
            });

            if (response.ok) {
                handleEmailSubmission();
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
                    {/* Header */}
                    <HeaderD />

                    {/* Reservations table */}
                    <main className="w-full px-[5vw] pt-8">
                        <span className="block text-gray-800 text-2xl font-semibold mb-8">Gestión de Citas Agendadas</span>
                        
                        <div className="w-fit border-2 border-gray-200 rounded-3xl mb-4 shadow-sm">
                            <button className={`text-sm px-4 py-2 border-gray-300  ${pending ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setPending(true); setConfirmed(false); setCancelled(false); } }>Pendiente por confirmación</button>
                            <button className={`text-sm px-4 py-2 border-gray-300 ${confirmed ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setPending(false); setConfirmed(true); setCancelled(false); } }>Confirmada</button>
                            <button className={`text-sm px-4 py-2 ${cancelled ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setPending(false); setConfirmed(false); setCancelled(true); } }>Cancelada</button>
                        </div>

                        {/* Search bar */}
                        <SearchBar onSearch={ handleSearch } />

                        <div className="bg-white py-1">
                            <div className="overflow-x-auto max-h-[60vh]">
                                {pending && (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Motivo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Odontólogo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha y hora</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filtered.map((r) => r.status === "pendiente por confirmación" && (
                                                <tr key={r.id} className="hover:bg-gray-50 text-sm">
                                                    <td className="px-4 py-2">{r.patient_firstname} {r.patient_lastname}</td>
                                                    <td className="px-4 py-2">{r.patient_phone}</td>
                                                    <td className="px-4 py-2">{r.patient_email}</td>
                                                    <td className="px-4 py-2">{r.reason}</td>
                                                    <td className="px-4 py-2">{r.dentist_firstname} {r.dentist_lastname}</td>
                                                    <td className="px-4 py-2">{formatDate(r.date!)}</td>
                                                    <td className="px-4 py-2 flex gap-2 text-lg justify-center">
                                                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Ver más" onClick={() => { router.push(`/auxiliar/citas/${r.id}/confirmar`) }}> 
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Cancelar" onClick={() => { setReservation(r); setShowModal(true); }}> 
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filtered.filter((r) => r.status === "pendiente por confirmación").length === 0 && (
                                                <tr className="w-full hover:bg-gray-50">
                                                    <td className="px-4 py-5 text-center text-xs text-gray-400" colSpan={7}>No se encontraron coincidencias</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {confirmed && (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Motivo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Odontólogo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Hora</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filtered.map((r) => r.status === "confirmada" && (
                                                <tr key={r.id} className="hover:bg-gray-50 text-sm">
                                                    <td className="px-4 py-2">{r.patient_firstname} {r.patient_lastname}</td>
                                                    <td className="px-4 py-2">{r.patient_phone}</td>
                                                    <td className="px-4 py-2">{r.patient_email}</td>
                                                    <td className="px-4 py-2">{r.reason}</td>
                                                    <td className="px-4 py-2">{r.dentist_firstname} {r.dentist_lastname}</td>
                                                    <td className="px-4 py-2">{formatDate(r.date!).split(",")[0]}</td>
                                                    <td className="px-4 py-2">{formatDate(r.date!).split(",")[1]} - {formatDate(r.end_time!).split(",")[1]}</td>
                                                    <td className="px-4 py-2 flex gap-2 text-lg justify-center">
                                                        <button className="text-blue-600 hover:text-blue-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Ver más" onClick={() => { router.push(`/auxiliar/citas/${r.id}/reprogramar`) }}> 
                                                            <i className="bi bi-eye"></i>
                                                        </button>
                                                        <button className="text-red-600 hover:text-red-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Cancelar" onClick={() => { setReservation(r); setShowModal(true); }}> 
                                                            <i className="bi bi-x"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filtered.filter((r) => r.status === "confirmada").length === 0 && (
                                                <tr className="w-full hover:bg-gray-50">
                                                    <td className="px-4 py-5 text-center text-xs text-gray-400" colSpan={8}>No se encontraron coincidencias</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}

                                {cancelled && (
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Paciente</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Teléfono</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Correo Electrónico</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Motivo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Odontólogo</th>
                                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Fecha y hora</th>
                                                <th className="px-4 py-2 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filtered.map((r) => r.status === "cancelada" && (
                                                <tr key={r.id} className="hover:bg-gray-50 text-sm">
                                                    <td className="px-4 py-2">{r.patient_firstname} {r.patient_lastname}</td>
                                                    <td className="px-4 py-2">{r.patient_phone}</td>
                                                    <td className="px-4 py-2">{r.patient_email}</td>
                                                    <td className="px-4 py-2">{r.reason}</td>
                                                    <td className="px-4 py-2">{r.dentist_firstname} {r.dentist_lastname}</td>
                                                    <td className="px-4 py-2">{formatDate(r.date!)}</td>
                                                    <td className="px-4 py-2 flex gap-2 text-lg">
                                                        <button className="block mx-auto text-green-600 hover:text-green-800 p-1 rounded disabled:opacity-50 cursor-pointer" title="Reestablecer" onClick={() => { router.push(`/auxiliar/citas/${r.id}/reestablecer`) }}> 
                                                            <i className="bi bi-arrow-counterclockwise"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}

                                            {filtered.filter((r) => r.status === "cancelada").length === 0 && (
                                                <tr className="w-full hover:bg-gray-50">
                                                    <td className="px-4 py-5 text-center text-xs text-gray-400" colSpan={7}>No se encontraron coincidencias</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="mt-8 flex justify-center">
                                <Button className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl cursor-pointer" type="button" onClick={ () => { router.push(`/auxiliar/citas/registro`) }}>
                                    Registrar cita
                                </Button>
                            </div>
                        </div>

                        {/* Confirm modal */}
                        {showModal && (
                            <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm ">
                            <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                                <span className="block text-2xl font-bold text-center my-3">Cancelar la cita</span>
                                <span className="block text-center text-medium mb-8">Al cancelar la cita, se enviará una notificación al correo electrónico del paciente: <strong>{reservation?.patient_email}</strong>.</span>
                                <div className="flex justify-between mt-4">
                                <Button className="w-[48%] bg-gray-200 hover:bg-gray-300 rounded-3xl" onClick={() => setShowModal(false)}>Cancelar</Button>
                                <Button className="w-[48%] bg-gray-600 text-white hover:bg-gray-400 rounded-3xl" onClick={() => { handleCancellation(Number(reservation?.id)); setShowModal(false); }}>Continuar</Button>
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
                                <Button className="w-full bg-green-300 hover:bg-green-500 rounded mt-3" onClick={() => { setShowSentModal(false); router.push("/auxiliar/citas"); location.reload(); }}> Continuar </Button>
                            </div>
                        </div>
                        )}

                        {/* Fail modal */}
                        {showFailModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-sm w-full flex flex-col items-center">
                                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <span className="text-xl font-semibold text-center mb-2">¡Ups, ha ocurrido un error!</span>
                                <span className="text-center text-sm text-gray-600 my-2">Ha ocurrido un error inesperado. Por favor, intente nuevamente. Si el problema persiste, comuníquese con soporte.</span>
                                <Button className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg py-2 mt-3 transition" onClick={() => setShowFailModal(false)}> Continuar </Button>
                            </div>
                        </div>
                        )}
                    </main>  
                </div>
            )}
        </section>
    );
}