"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Loading from "@/components/loading";
import HeaderB from "@/components/headerB";
import { Eye, Upload, Download, Trash, X, Cloud } from "lucide-react";
import { Paciente } from "@/app/types/patient";
import { UploadedFile } from "@/app/types/file";
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
    
    // ---------------------------------------------------------------------------

    // State variable for files array
    const [files, setFiles] = useState<UploadedFile[]>([])

    // State variable for search bar
    const [searchTerm, setSearchTerm] = useState("");

    // ---------------------------------------------------------------------------

    // Get files data from the DB using fetch
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/specialist/files", {
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
                setFiles(data);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, []);

    // Filtered files
    const filtered = files.filter(archivo =>
        archivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archivo.paciente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        formatDate(archivo.fecha).toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --------------------------------------------------------------------------

    // State variable for patients array
    const [patients, setPatients] = useState<Paciente[]>([])
    
    // --------------------------------------------------------------------------

    // Get patients data from the DB using fetch
    useEffect(() => {
        const fetchPatients = async () => {
            try {
                const response = await fetch("/api/specialist/patients", {
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
                setPatients(data);
            } catch (error) {
                console.error("Error al obtener pacientes:", error);
            }
        };

        fetchPatients();
    }, []);

    // ---------------------------------------------------------------------------

    // State variable for files statistics
    const [statistics, setStatistics] = useState<{ spaceUsed: number, allFiles: number, recentlyUploaded: number }>()
    
    // Get files stats from the DB using fetch
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/specialist/files/stats", {
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
                    
                setStatistics(data);
                setIsLoading(false);
            } catch (error) {
                console.error(error);
            }
        };
    
        fetchStats();
    }, []);

    // --------------------------------------------------------------------------
    
    // State variables for upload modal, selected files and selected patient
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedPatientID, setSelectedPatientID] = useState<number | null>(null)

    // File select handler
    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files) return;
        const filesArray = Array.from(event.target.files);
        setSelectedFiles(prev => [...prev, ...filesArray]);
    };

    // File removal handler
    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    // --------------------------------------------------------------------------

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    // --------------------------------------------------------------------------
    
    // File view handler
    const handleView = async (fileID: number) => {
        try {
            const response = await fetch(`/api/specialist/files/${fileID}`, {
                method: "GET",
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to get preview URL:", error.message);
                return;
            }

            const { previewUrl } = await response.json();
            window.open(previewUrl, "_blank");
        } catch (err) {
            console.error("Unexpected error during preview:", err);
        }
    };

    // File download handler
    const handleDownload = async (fileID: number, nombre: string) => {
        try {
            const response = await fetch(`/api/specialist/files/${fileID}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ id: fileID }),
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to get download URL:", error.message);
                return;
            }

            const { downloadUrl } = await response.json();

            const link = document.createElement("a");
            link.href = downloadUrl;
            link.download = nombre;
            link.click();
        } catch (err) {
            console.error("Unexpected error during download:", err);
        }
    };

    // File deletion handler
    const handleDelete = async (fileID: number) => {
        try {
            const response = await fetch(`/api/specialist/files/${fileID}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                console.error("Failed to delete file:", error.message);
                return;
            }

            window.location.reload();
        } catch (err) {
            console.error("Unexpected error during deletion:", err);
        }
    };

    // File upload handler
    const handleUpload = async () => {
        if (!selectedPatientID) {
            alert("Selecciona un paciente antes de cargar archivos.");
            return;
        }

        for (const file of selectedFiles) {
            const base64 = await fileToBase64(file);

            const response = await fetch("/api/specialist/files", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({ codigo_paciente: selectedPatientID, base64, nombre: file.name })
            });

            if (!response.ok) {
                const error = await response.json();
                console.error(error.message);
            }
        }

        setSelectedFiles([]);
        setShowUploadModal(false);
        window.location.reload();
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
                    <HeaderB />

                    <div className="w-full px-[5vw] mx-auto space-y-6 py-16">
                        <span className="block text-gray-800 text-2xl font-semibold mb-6">Gestión de Archivos</span>

                        {/* Stat cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Espacio usado</h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">
                                    {statistics?.spaceUsed
                                        ? statistics.spaceUsed >= 1024 * 1024 * 8
                                        ? `${(statistics.spaceUsed / (1024 * 128 * 8)).toFixed(2)} MB`
                                        : `${(statistics.spaceUsed / (128 * 8)).toFixed(2)} KB`
                                        : '0 KB'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">de 1 GB disponible</p>
                            </div>
                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Total de archivos</h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{statistics?.allFiles}</p>
                                <p className="text-xs text-gray-500 mt-1">archivos almacenados</p>
                            </div>
                            <div className="bg-gray-50 p-6 border border-gray-200 rounded-lg flex flex-col justify-between">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-700">Archivos recientes</h3>
                                </div>
                                <p className="text-2xl font-bold text-gray-900">{statistics?.recentlyUploaded}</p>
                                <p className="text-xs text-gray-500 mt-1">subidos esta semana</p>
                            </div>
                        </div>

                        <main className="bg-gray-50 border border-gray-200 rounded-lg p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center flex-1 max-w-md">
                                    <Input className="text-sm border border-gray-300 font-medium" placeholder="ej. Pedro Pérez | archivo.pdf | 01/01/2025" type="text" value={searchTerm} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}/>
                                </div>
                                <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center text-sm font-medium" onClick={() => setShowUploadModal(true)}>
                                    <Upload className="w-4 h-4 mr-2"></Upload>Cargar archivo
                                </Button>
                            </div>

                            <div className="overflow-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Archivo</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Paciente</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Cédula de identidad</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tamaño</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {filtered.map((archivo, index) => (
                                            <tr key={index} className="hover:bg-gray-50 text-sm">
                                                <td className="px-4 py-3">
                                                    <span className="font-medium">{archivo.nombre}</span>
                                                </td>
                                                <td className="px-4 py-3">{archivo.paciente}</td>
                                                <td className="px-4 py-3">{archivo.cedula || "-"}</td>
                                                <td className="px-4 py-3">{archivo.tamaño >= 1024 * 1024 * 8 ? `${(archivo.tamaño / (1024 * 128 * 8)).toFixed(2)} MB` : `${(archivo.tamaño / (128 * 8)).toFixed(2)} KB`}</td>
                                                <td className="px-4 py-3">{formatDate(archivo.fecha)}</td>
                                                <td className="px-4 py-3 flex gap-3">
                                                    <button className="text-blue-600 hover:text-blue-800 p-1" title="Ver" onClick={ () => handleView(archivo.id) }>
                                                        <Eye className="w-5 h-5" />
                                                    </button>
                                                    <button className="text-green-600 hover:text-green-800 p-1" title="Descargar" onClick={ () => handleDownload(archivo.id, archivo.nombre) }>
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                    <button className="text-red-600 hover:text-red-800 p-1" title="Eliminar" onClick={ () => handleDelete(archivo.id) }>
                                                        <Trash className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}

                                        {(files.length > 0 && filtered.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No se han encontrado resultados coincidentes
                                                </td>
                                            </tr>
                                        )}

                                        {(files.length === 0 && filtered.length === 0) && (
                                            <tr>
                                                <td colSpan={6} className="bg-gray-50 border-b border-gray-200 text-center text-sm text-gray-600 py-5">
                                                    No hay archivos almacenados
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </main>
                    </div>

                    {showUploadModal && (
                        <div className="fixed inset-0 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full backdrop-filter backdrop-blur-md">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-gray-800">Cargar archivo(s)</h2>
                                    <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-800">
                                        <X></X>
                                    </button>
                                </div>
                                
                                <div className="flex flex-col mb-4 gap-2">
                                    <label className="text-sm font-medium">Seleccione el paciente *</label>
                                    <select value={ Number(selectedPatientID) || "" } onChange={(e) => setSelectedPatientID(Number(e.target.value))} className="border border-gray-300 rounded px-3 py-2 w-full text-sm text-gray-600 outline-none">
                                        <option value="" disabled>Selecciona un paciente</option>
                                        
                                        {patients.map((p) => (
                                            <option key={p.codigo} value={p.codigo}>
                                                {p.nombre} {p.apellido} - C.I. {p.cedula}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => document.getElementById('file-input')?.click()}>
                                    <Cloud className="w-10 h-10 mx-auto"></Cloud>
                                    <p className="mt-4 font-semibold text-gray-700">Arrastra archivos aquí o haz clic para seleccionar</p>
                                    <p className="text-sm text-gray-500 mt-1">Soporte para PDF, JPG, DOCX, etc.</p>
                                    <input id="file-input" type="file" multiple className="hidden" onChange={ handleFileSelect }/>
                                </div>

                                {selectedFiles.length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-semibold mb-3">Archivos seleccionados:</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {selectedFiles.map((file, index) => (
                                                <div key={file.name} className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium">{file.name}</span>
                                                    </div>
                                                    <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                                                        <Trash className="w-4 h-4"></Trash>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end gap-4 mt-8">
                                    <Button className="bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800 text-sm" onClick={() => setShowUploadModal(false)}>
                                        Cancelar
                                    </Button>
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm" onClick={() => { if (selectedFiles.length > 0) { handleUpload() }}}>
                                        Cargar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}