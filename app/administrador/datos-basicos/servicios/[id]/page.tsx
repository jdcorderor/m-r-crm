"use client"
import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Input from "@/components/ui/input"
import Button from "@/components/ui/button"
import Image from "next/image"
import Loading from "@/components/loading"
import HeaderC from "@/components/headerC"
import { Treatment } from "@/app/types/treatment"
import { Camera, Trash } from "lucide-react"

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

    // -----------------------------------------------------------------------------

    // Get treatment ID from URL params
    const { id } = useParams();

    // -----------------------------------------------------------------------------

    // State variable for loading view
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // -----------------------------------------------------------------------------
    
    // State variable for treatment update form fields
    const [treatment, setTreatment] = useState<Treatment>({ id: 0, nombre: "", descripcion: "", duracion: 0, precio: 0, caracteristicas: [], imagen_url: "", activo: false });

    // Load treatment data handler
    useEffect(() => {
        const fetchTreatment = async () => {
                
            if (!id) {
                console.error("Servicio no encontrado")
            }
    
            const response = await fetch(`/api/administrator/basic-data/treatments/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
                
            if (response.ok) {
                const data = await response.json();
                setTreatment(data);
                setIsLoading(false);
            }
        }
    
        fetchTreatment();
    }, [id]);

    // -----------------------------------------------------------------------------

    // State variable for characteristics input
    const [characteristic, setCharacteristic] = useState("");

    // Treatment update handler
    const handleTreatmentUpdate = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!treatment.caracteristicas || treatment.caracteristicas.length === 0) return;

        try {
            const response = await fetch(`/api/administrator/basic-data/treatments/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(treatment),
                credentials: "include",
            });

            if (response.ok) {
                setTreatment({ id: 0, nombre: "", descripcion: "", duracion: 0, precio: 0, caracteristicas: [], imagen_url: "", activo: false })
                router.push("/administrador/datos-basicos/servicios");
            }
        } catch (error) {
            console.error("Error al actualizar el servicio:", error);
        }
    }

    // -----------------------------------------------------------------------------
    
    // File change handler
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTreatment({ ...treatment, imagen_url: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    // -----------------------------------------------------------------------------
    
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

                    {/* Treatment update section */}
                    <main className="flex justify-center items-center min-h-[80vh]">
                        <div className="bg-white w-full max-w-5xl p-10">
                            <div>
                                <span className="block text-2xl text-gray-800 font-semibold mb-8 text-center">Actualización de Servicio/Tratamiento</span>
                                <form className="space-y-8" onSubmit={ handleTreatmentUpdate }>
                                    <div>
                                        <div className="flex items-center justify-center w-120 h-70 rounded-lg bg-gray-100 my-12 mx-auto relative">
                                            <label htmlFor="image" className="flex items-center justify-center w-full h-full cursor-pointer">
                                                <input id="image" name="image" type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                                                {treatment?.imagen_url ? (
                                                    <Image src={treatment?.imagen_url} width={1080} height={1080} alt="" className="absolute w-full h-full object-cover object-top rounded-lg" />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                        <Camera></Camera>
                                                    </svg>
                                                )}
                                            </label>
                                        </div>

                                        <span className="block text-lg text-gray-800 font-medium mb-2">Información del servicio/tratamiento</span>
                                        
                                        <hr className="border-gray-200 mb-5"/>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                            <div className="flex flex-col gap-1">
                                                <label className="block text-sm font-medium" htmlFor="name">Servicio/Tratamiento *</label>
                                                <Input id="name" className="border-gray-300 text-sm" type="text" placeholder="Servicio/Tratamiento" value={ treatment.nombre || "" } onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTreatment({ ...treatment, nombre: e.target.value })} required />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="block text-sm font-medium" htmlFor="duration">Duración (minutos) *</label>
                                                <Input id="duration" className="border-gray-300 text-sm" type="number" placeholder="Duración" value={ treatment.duracion || "" } onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTreatment({ ...treatment, duracion: Number(e.target.value) })} required />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label className="block text-sm font-medium" htmlFor="price">Precio (USD) *</label>
                                                <Input id="price" className="border-gray-300 text-sm" type="number" placeholder="Precio" value={ treatment.precio || "" } onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTreatment({ ...treatment, precio: Number(e.target.value) })} required />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-1 mb-6">
                                            <label className="block text-sm font-medium" htmlFor="description">Descripción *</label>
                                            <textarea id="description" className="w-full border border-gray-300 rounded-lg text-sm text-gray-500 p-2 outline-none" placeholder="Descripción" rows={4} value={ treatment.descripcion || "" } onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTreatment({ ...treatment, descripcion: e.target.value })} required />
                                        </div>

                                        <div className="flex flex-col w-full text-sm gap-1">
                                            <div className="flex flex-col w-full gap-1">
                                                <label htmlFor="characteristic" className="font-medium">Característica *</label>
                                                <Input id="characteristic" className="border border-gray-300 outline-none text-gray-500" placeholder="Característica" value={ characteristic || "" } onChange={ (e: React.ChangeEvent<HTMLInputElement>) => setCharacteristic(e.target.value) }></Input>
                                            </div>
                                    
                                            <div className="flex flex-row mx-auto gap-2 mb-2">
                                                <button type="button" className="w-fit bg-gray-200 hover:bg-gray-300 rounded-full font-medium px-5 py-1 mx-auto" onClick={ () => { treatment?.caracteristicas?.push(characteristic); setCharacteristic("") } }>
                                                    Agregar
                                                </button>
                                            </div>

                                            {(treatment.caracteristicas && treatment.caracteristicas.length > 0) && (
                                                <div className="border-y border-gray-200 my-3 py-4">
                                                    <table className="min-w-full border border-gray-300 rounded-md overflow-hidden">
                                                        <thead className="bg-gray-100 text-left text-sm font-medium text-gray-700">
                                                            <tr>
                                                                <th className="px-4 py-2">Característic del servicio/tratamiento</th>
                                                                <th className="px-4 py-2 text-center">Acciones</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="text-sm text-gray-800">
                                                            {treatment.caracteristicas.length > 0 && treatment.caracteristicas.map((c, index) => (
                                                                <tr key={index} className="bg-gray-50 border-t border-gray-200">
                                                                    <td className="px-4 py-2">{c}</td>
                                                                    <td className="px-4 py-2 text-center">
                                                                        <button onClick={() => { setTreatment({ ...treatment, caracteristicas: treatment.caracteristicas.filter((c, i) => (c != null && index != i))}) }} className="text-red-600 hover:text-red-800 font-medium transition">
                                                                            <Trash className="w-4 h-4"></Trash>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>

                                        <hr className="border-gray-200 mt-4 mb-5"/>
                                        
                                        <div className="flex items-center w-full gap-2 px-2 text-sm">
                                            <input type="checkbox" className="h-4 w-4 accent-blue-600" checked={ treatment.activo } onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTreatment({ ...treatment, activo: e.target.checked })}/><span className="leading-2">Mostrar la información del servicio/tratamiento en el sitio web</span>
                                        </div>

                                        <div className="flex justify-center my-7 gap-2">
                                            <Button type="submit" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl">
                                                Actualizar
                                            </Button>
                                            <Button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl" onClick={ () => { router.push("/administrador/datos-basicos/servicios") } }>
                                                Volver
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </main> 
                </div>
            )}
        </section>
    );
}