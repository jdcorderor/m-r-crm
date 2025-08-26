"use client"
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState, useRef } from "react"
import Loading from "@/components/loading"
import HeaderB from "@/components/headerB"
import Button from "@/components/ui/button"
import { Check } from 'lucide-react'
import { Odontodiagrama, OdontodiagramaHandle } from "@/components/odontodiagrama"
import { MedicalRecord } from '@/app/types/medical-record'
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
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchRecord();
    }, [id]);

    // --------------------------------------------------------------------------

    // Type definition for odontogram data
    interface SectorData {
        dientes: { segmentos: Record<number, number> }[];
    }

    // State variable for odontogram data
    const [currentOdontogramData, setCurrentOdontogramData] = useState<Record<number, SectorData>>({});

    // Get odontogram data from the DB using fetch
    useEffect(() => {
        const fetchOdontogramData = async () => {
            try {
                const response = await fetch(`/api/specialist/odontogram/${id}`, {
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

                setCurrentOdontogramData(data);
                setIsLoading(false);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchOdontogramData();
    }, [id]);

    // Odontogram change handler
    const handleOdontogramChange = (data: Record<number, SectorData>) => {
        setCurrentOdontogramData(data);
    };

    // --------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState(true);

    // State variable for alternative loading view
    const [loading, setLoading] = useState(false);

    // --------------------------------------------------------------------------

    // Use ref for odontogram component
    const ref = useRef<OdontodiagramaHandle>(null);

    // Save changes handler
    const handleSaveChanges = async () => {
        const sectors = ref.current?.getSectors();

        setLoading(true);
        
        try {
            const response = await fetch(`/api/specialist/consultation/odontogram/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(sectors),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            router.push(`/especialista/pacientes/${id}/`);
        } catch (error) {
            console.error("Error al obtener pacientes:", error);
        } finally {
            setLoading(false);
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

            {!isLoading && currentOdontogramData && (
                <div>
                    <HeaderB />

                    <main className="w-full px-30 py-10 bg-white">
                        <div className="flex flex-col items-center justify-center w-full">
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-8 py-2">
                                <div className="relative top-0">
                                    <Button className="flex absolute top-3 right-0 shadow-none bg-gray-100 border border-gray-200 rounded-full items-center text-gray-700" onClick={() => { handleSaveChanges(); }}>
                                        <Check className="w-5 h-5 mr-2" />Guardar
                                    </Button>
                                </div>

                                <div className="flex flex-col w-full justify-between my-6 text-sm">
                                    <p className="text-gray-600"><span><b>N° Historia:</b> <span>{record?.codigo}</span></span></p>
                                    <p className="text-gray-600"><span><b>Paciente:</b> <span>{record?.nombre} {record?.apellido}</span></span></p>
                                    <p className="text-gray-600"><span><b>Edad:</b> <span>{record?.fecha_nacimiento ? calculateAge(record?.fecha_nacimiento) : "-"} años</span></span></p>
                                </div>
                                <div className="block w-full">
                                    <div className="my-8">
                                        <Odontodiagrama ref={ref} onChange={handleOdontogramChange} initialData={currentOdontogramData} readOnly={false}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            )}

            {loading && (
                <div className="flex fixed top-0 left-0 w-full h-screen bg-white z-50 items-center justify-center">
                    <div className="flex flex-col items-center justify-center gap-8">
                        <div>
                            <Loading />
                        </div>
                        <span className="text-gray-700 text-sm mb-4">
                            Esto puede tardar un tiempo. Por favor, espere...
                        </span>
                    </div>
                </div>
            )}            
        </section>
    );
}