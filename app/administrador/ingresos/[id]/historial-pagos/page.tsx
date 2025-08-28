'use client'
import { useRouter, useParams } from 'next/navigation'
import React, { useEffect, useState } from "react"
import Button from "@/components/ui/button"
import Input from '@/components/ui/input'
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import { X } from 'lucide-react';
import { MedicalRecord } from '@/app/types/medical-record'
import { ConsultationPayments } from '@/app/types/consultation-payments'
import { formatDate } from '@/hooks/homePageHooks'
import calculateAge from '@/app/services/calculateAge'

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

    // State variable for medical record data
    const [record, setRecord] = useState<MedicalRecord>();
    
    // Get record data from the DB using fetch
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
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };
        
        fetchRecord();
    }, [id]);
    
    // State variable for consultation payments array array
    const [consultationPayments, setConsultationPayments] = useState<ConsultationPayments[]>([]);
        
    // Get consultation payments data from the DB using fetch
    useEffect(() => {
        const fetchRecord = async () => {
            try {
                const response = await fetch(`/api/administrator/income/payments-record/${id}`, {
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
        
                setConsultationPayments(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };
    
        fetchRecord();
    }, [id]);

    // --------------------------------------------------------------------------
    
    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // State variable for modal visibility
    const [paymentModalID, setpaymentModalID] = useState<number | null>(null);
    const [detailsModalID, setDetailsModalID] = useState<number | null>(null);

    // --------------------------------------------------------------------------

    // State variable for payment data
    const [paymentData, setPaymentData] = useState<{ amount: number | null;  method: string | null; reference: string | null; }>({ amount: null, method: "", reference: "", });
    
    // --------------------------------------------------------------------------
    
    // Payment registration handler
    const handlePaymentRegistration = async (consultation: number) => {
        try {
            if (!paymentData.amount || !paymentData.method || !paymentData.reference ) {
                alert("Debe llenar todos los campos");
                return;
            }
    
            const response = await fetch(`/api/specialist/payment/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ consultation: consultation, payment: paymentData }),
                credentials: "include",
            });
    
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            window.location.reload();
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
        }
    };

    // --------------------------------------------------------------------------

    function calculateBalance() {
        return consultationPayments.reduce((acc, c) => { 
            const totalAmount = c.monto_total;
            const paidAmount = c.pagos ? c.pagos.reduce((sum, pago: { monto: number }) => sum + pago.monto, 0) : 0;
            const balance = totalAmount - paidAmount;
            return acc + balance;
        }, 0)
    }

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
                    <HeaderC />

                    <div className="w-full max-w-4xl bg-gray-50 border border-gray-200 rounded-lg my-10">
                        <div className="relative top-0">
                            <Button className="absolute top-3 left-2 shadow-none rounded-full" onClick={() => router.push(`/administrador/ingresos/${id}`)}>
                                <X className="text-gray-500 w-5 h-5" />
                            </Button>
                        </div>

                        <main className="flex flex-col w-full gap-12 py-12">
                            <h1 className="text-2xl font-bold text-gray-800 text-center">Historial de pagos</h1>

                            <div className="flex flex-col mx-20">
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex flex-row md:flex-row w-full justify-between gap-8">
                                        <div className="flex-1 flex flex-col gap-2">
                                            <p className="text-gray-600"><span><b>N° Historia:</b> <span>{record?.codigo}</span></span></p>
                                            <p className="text-gray-600"><span><b>Paciente:</b> <span className="font-medium">{record?.nombre} {record?.apellido}</span></span></p>
                                            <p className="text-gray-600"><span><b>Edad:</b> <span>{ record?.fecha_nacimiento ? calculateAge(record?.fecha_nacimiento) : "" } años</span></span></p>
                                        </div>

                                        <div className="flex-1 flex flex-col gap-2 text-right">
                                            <p className="text-gray-600"><span><b>Total de consultas:</b> <span>{consultationPayments.length}</span></span></p>
                                            <p className="text-gray-600"><span><b>Última consulta:</b> <span>{consultationPayments.length > 0 ? formatDate(consultationPayments[0].fecha) : "N/A"}</span></span></p>
                                            <p className="text-gray-600"><span><b>Balance administrativo:</b> <span className={`${(calculateBalance() === 0) ? "text-green-600" : "text-red-600" }`}> {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(calculateBalance())} </span></span></p>
                                        </div>
                                    </div>
                                </div>
                    
                                <div>
                                    {consultationPayments.length > 0 && (
                                        <div className="flex flex-col w-full justify-center gap-8 py-6">
                                            {consultationPayments.map((c) => {
                                                const totalAmount = c.monto_total;
                                                const paidAmount = c.pagos ? c.pagos.reduce((total, pago: { monto: number }) => total + pago.monto, 0) : 0;

                                                return (
                                                    <div key={c.id} className="flex flex-col bg-white rounded-xl p-6 w-full border border-gray-200 text-sm gap-1">
                                                        <div className="flex flex-row justify-between items-center mb-2">
                                                            <h3 className="text-lg font-semibold text-gray-800">{c.codigo}</h3> 
                                                            <h3 className="text-lg font-light text-gray-800">{formatDate(c.fecha)}</h3> 
                                                        </div>

                                                        <p className="text-gray-600"><span><b>Especialista:</b> <span>Od. {c.especialista}</span></span></p>
                                                        <p className="text-gray-600"><span><b>Monto total:</b> <span>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(totalAmount)}</span></span></p>
                                                        <p className="text-gray-600"><span><b>Monto cancelado:</b> <span>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(paidAmount)}</span></span></p>
                                                        <p><span className="text-gray-600"><b>Balance administrativo:</b> <span className={`text-gray-600 ${paidAmount >= totalAmount ? "text-green-600" : "text-red-600"}`}>{new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(totalAmount - paidAmount)}</span></span></p>

                                                        <div className="flex justify-center gap-2 mt-4">
                                                            <button className="bg-blue-600 hover:bg-blue-700 rounded-full border border-gray-300 px-5 py-1 text-xs font-medium text-white"
                                                                onClick={() => { setDetailsModalID(c.id) }}>
                                                                Ver detalles
                                                            </button>
                                                            <button className="bg-blue-600 hover:bg-blue-700 rounded-full border border-gray-300 px-5 py-1 text-xs font-medium text-white"
                                                                onClick={() => {if (paidAmount < totalAmount) { setpaymentModalID(c.id) }}}>
                                                                Registrar pago
                                                            </button>
                                                        </div>

                                                        {(detailsModalID === c.id) && (
                                                        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                                                            <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full flex flex-col gap-6">                                                
                                                                <div className="text-center">
                                                                    <h2 className="text-lg font-bold">Resumen de transacciones</h2>
                                                                </div>

                                                                <section className="w-full">
                                                                    {(c.pagos && c.pagos.length > 0) ? (
                                                                    c.pagos.map((pago: {monto: number, metodo: string, referencia: string, fecha: string}, index) => (
                                                                        <div key={index} className={`${(index !== c.pagos.length - 1) ? "mb-4" : ""}`}>
                                                                            <div className="text-sm text-gray-700 space-y-1">
                                                                                <p><strong>Monto:</strong> {new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'USD' }).format(pago.monto)}</p>
                                                                                <p><strong>Fecha:</strong> {formatDate(pago.fecha)}</p>
                                                                                <p><strong>Método de pago:</strong> {pago.metodo}</p>
                                                                                <p><strong>Referencia:</strong> {pago.referencia || "Sin referencia"}</p>
                                                                            </div>
                                                                            {index !== c.pagos.length - 1 && <hr className="border-t border-gray-200 mt-3" />}
                                                                        </div>
                                                                    ))
                                                                    ) : (
                                                                    <p className="text-gray-600 text-sm text-center">No se han encontrado registros de pago.</p>
                                                                    )}
                                                                </section>

                                                                <div className="flex justify-center">
                                                                    <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-1 rounded-full transition-colors" onClick={() => setDetailsModalID(null)}>
                                                                        Cerrar
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        )}            
                                                        
                                                        {(paymentModalID === c.id) && (
                                                            <div className="fixed inset-0 flex items-center justify-center z-[1000] bg-black/40 backdrop-blur-sm">
                                                                <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-full flex flex-col items-center gap-6">
                                                                    <span className="text-lg font-bold text-center">Ingrese los datos de la transacción</span>
                                                                    <div className="w-full flex flex-col text-sm gap-2 mt-2">
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-gray-700 font-semibold">Monto (USD) *</label>
                                                                            <Input required type="number" min="1" max={totalAmount - paidAmount} placeholder="Monto (USD)" className="border-gray-300" value={paymentData.amount || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), amount: Number(e.target.value) }))} />
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-gray-700 font-semibold">Método de pago *</label>
                                                                            <Input required type="text" placeholder="Método de pago" className="border-gray-300" value={paymentData.method || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), method: e.target.value }))} />
                                                                        </div>
                                                                        <div className="flex flex-col gap-1">
                                                                            <label className="text-gray-700 font-semibold">Referencia *</label>
                                                                            <Input required type="text" placeholder="Referencia" className="border-gray-300" value={paymentData.reference || ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPaymentData(prev => ({ ...(prev ?? {}), reference: e.target.value }))} />
                                                                        </div>
                                                                    </div>

                                                                    <div className="flex justify-center gap-2 mt-2">
                                                                        <button className="bg-gray-300 hover:bg-gray-400 rounded-full border border-gray-300 px-5 py-1 text-sm font-medium text-gray-800"
                                                                            onClick={() => { setpaymentModalID(null); }}>
                                                                            Volver
                                                                        </button>
                                                                        <button className="bg-blue-600 hover:bg-blue-700 rounded-full border border-gray-300 px-5 py-1 text-sm font-medium text-white"
                                                                            onClick={() => { handlePaymentRegistration(c.id) }}>
                                                                            Registrar pago
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </section>
            )}
        </section>
    );
}