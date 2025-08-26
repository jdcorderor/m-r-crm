'use client'
import { useParams, useRouter } from "next/navigation"
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import Input from "@/components/ui/input"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB"
import { X } from "lucide-react"
import { MedicalRecord } from "@/app/types/medical-record"
import { formatDate } from "@/hooks/homePageHooks"
import calculateAge from "@/app/services/calculateAge"

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
    
    // --------------------------------------------------------------------------

    // Function for creating a consultation number
    const [consultationNumber] = useState<string>(() => {
        const fecha = new Date().toISOString().slice(2, 10).replace(/-/g, "");
        const aleatorio = Math.floor(Math.random() * 90 + 10);
        return `${id}-${fecha}-${aleatorio}`;
    });
    
    // --------------------------------------------------------------------------

    // State variable for medical record data
    const [record, setRecord] = useState<MedicalRecord>();

    // Get patients data from the DB using fetch
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await fetch(`/api/specialist/medical-record/${id}`, {
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

                setRecord(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchRecord();
    }, [id]);

    // --------------------------------------------------------------------------

    // State variable for consultation date
    const [date, setDate] = useState("");

    // Get current date
    useEffect(() => {
        const now = new Date().toISOString();
        setDate(now);
    }, []);

    // --------------------------------------------------------------------------

    // State variables for diagnosis, treatment and observations
    const [diagnosis, setDiagnosis] = useState([]);
    const [treatment, setTreatment] = useState([]);
    const [observations, setObservations] = useState("");

    // Get diagnosis and treatment data using fetch
    useEffect(() => {
        async function fetchConsultationData() {
            try {
                const response = await fetch(`/api/specialist/consultation/diagnosis-treatment`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    console.error("Failed to fetch consultation data:", response.statusText);
                    return;
                }

                const data = await response.json();

                setDiagnosis(data.diagnosis || []);
                setTreatment(data.treatment || []);

            } catch (error) {
                console.error("Error fetching consultation data:", error);
            }
        }

        fetchConsultationData();
    }, [id]);

    // --------------------------------------------------------------------------

    // State variable for payment data
    const [paymentData, setPaymentData] = useState<{ totalAmount: number | null; paidAmount: number | null; method: string | null; reference: string | null; }>({ totalAmount: null, paidAmount: null, method: "", reference: "", });

    // --------------------------------------------------------------------------

    // Dental consultation registration handler
    const handleConsultationRegistration = async () => {
        try {
            if (!consultationNumber || !diagnosis || !treatment || !observations || !paymentData.totalAmount || ((diagnosis.length === 0) && (treatment.length === 0)) ) {
                alert("Debe llenar todos los campos");
                return;
            }

            const response = await fetch(`/api/specialist/consultation/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ user: user.username, code: consultationNumber, diagnosis: diagnosis, treatment: treatment, observations: observations, payment: paymentData }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            } 
                
            router.push(`/especialista/pacientes`);
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
        }
    };

    // --------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <section>
            {isLoading && (
                    <div className="min-h-screen flex items-center justify-center">
                        <Loading />
                    </div>
            )}

            {!isLoading && (
                <section className="flex flex-col items-center justify-center">
                    <HeaderB />

                    <div className="w-full max-w-4xl bg-gray-50 border border-gray-200 rounded-lg my-10">

                        <div className="relative top-0">
                            <Button className="absolute top-3 left-2 shadow-none rounded-full"onClick={() => { if (diagnosis.length === 0 && treatment.length === 0) { router.push("/especialista/pacientes") }} }>
                                <X className="text-gray-500 w-5 h-5" />
                            </Button>
                        </div>

                        <main className="flex flex-col w-full py-12 gap-4">
                            <h1 className="text-2xl font-bold text-gray-800 text-center">Consulta odontológica</h1>

                            <div className="flex flex-col items-center">
                                <div className="flex flex-row w-full max-w-3xl px-2 py-6 justify-between border-b border-gray-200">
                                    <div className="flex-1 flex flex-col gap-2">
                                        <p className="text-gray-600"><span><b>Paciente:</b> <span>{record?.nombre} {record?.apellido}</span></span></p>
                                        <p className="text-gray-600"><span><b>Cédula de Identidad:</b> <span>{record?.cedula || "-"}</span></span></p>
                                        <p className="text-gray-600"><span><b>Edad:</b> <span>{record?.fecha_nacimiento ? calculateAge(record?.fecha_nacimiento) : "-"} años</span></span></p>
                                    </div>
                                    <div className="flex flex-col gap-2 md:text-left justify-start">
                                        <p className="text-gray-600"><span><b>N° Historia:</b> <span>{id}</span></span></p>
                                        <p className="text-gray-600"><b>N° Consulta:</b> {consultationNumber}<span>{}</span></p>
                                        <p className="text-gray-600"><b>Fecha:</b> <span>{formatDate(date).split(",")[0]}</span></p>
                                    </div>
                                </div>

                                <div className="flex flex-col w-full max-w-3xl justify-center gap-4 py-4 border-b border-gray-200">
                                    <Button className="px-6 py-1 w-fit mx-auto bg-green-500 text-white text-sm rounded-full shadow-md hover:bg-green-600 focus:outline-none transition duration-200 ease-in-out" onClick={() => { router.push(`/especialista/pacientes/${id}/odontodiagrama`) }}>
                                        Odontodiagrama
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-col mx-auto w-full max-w-3xl py-6 gap-6 text-gray-600">
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-bold">Diagnóstico</h2>
                                    <textarea name="" id="" className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none text-sm" rows={6} disabled={true} value={diagnosis.join("\n") ?? ""}></textarea>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-bold">Tratamiento</h2>
                                    <textarea name="" id="" className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none text-sm" rows={6} disabled={true} value={treatment.join("\n") ?? ""}></textarea>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <h2 className="font-bold">Observaciones</h2>
                                    <textarea name="" id="" className="w-full bg-white border border-gray-200 rounded-lg p-2 outline-none text-sm" rows={6} value={observations ?? ""} onChange={(e) => setObservations(e.target.value)}></textarea>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 mx-auto w-full max-w-3xl gap-6 text-gray-600 py-8 border-t border-gray-200 text-sm">
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="monto-total" className="font-semibold">Monto total (USD) *</label>
                                    <Input id="monto-total" required type="number" min="1" placeholder="Monto total (USD)" className="border-gray-300" value={paymentData.totalAmount ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), totalAmount: Number(e.target.value) }))} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="monto-pagado" className="font-semibold">Monto cancelado (USD) *</label>
                                    <Input id="monto-pagado" type="number" min="1" max={paymentData.totalAmount} placeholder="Monto cancelado (USD)" className="border-gray-300" value={paymentData.paidAmount ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), paidAmount: Number(e.target.value) }))} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="metodo" className="font-semibold">Método de pago *</label>
                                    <Input id="metodo" placeholder="Método de pago" className="border-gray-300" value={paymentData.method ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), method: e.target.value }))} />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label htmlFor="referencia" className="font-semibold">Referencia *</label>
                                    <Input id="referencia" placeholder="Referencia" className="border-gray-300" value={paymentData.reference ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), reference: e.target.value }))} />
                                </div>
                            </div>

                            <div className="flex justify-center text-sm">
                                <Button className="bg-blue-500 text-white px-6 py-2 rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out" onClick={ handleConsultationRegistration }>
                                    Guardar
                                </Button>
                            </div>
                        </main>
                    </div>
                </section>
            )}
        </section>
    );
};