"use client"
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Loading from "@/components/loading";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function ArchivosPage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const archivosMock = [
        {
            nombre: "Radiografía_María_González.jpg",
            paciente: "María González",
            tipo: "Imagen",
            tamaño: "2.4 MB",
            fecha: "2024-01-15",
            icon: "bi bi-file-image"
        },
        {
            nombre: "Historial_Carlos_Rodríguez.pdf",
            paciente: "Carlos Rodríguez",
            tipo: "PDF",
            tamaño: "1.2 MB",
            fecha: "2024-01-14",
            icon: "bi bi-file-earmark-pdf"
        },
        {
            nombre: "Presupuesto_Ana_Martínez.docx",
            paciente: "Ana Martínez",
            tipo: "Documento",
            tamaño: "856 KB",
            fecha: "2024-01-13",
            icon: "bi bi-file-earmark-word"
        },
    ];

    const archivosFiltrados = archivosMock.filter(archivo =>
        archivo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        archivo.paciente.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files || []);
        setSelectedFiles(prev => [...prev, ...files]);
    };
    
    const removeFile = (index: number) => {
        setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const getFileIcon = (fileName: string) => {
        const extension = fileName.split(".").pop()?.toLowerCase();
        switch (extension) {
            case "pdf": return "bi bi-file-earmark-pdf text-red-500";
            case "jpg":
            case "jpeg":
            case "png": return "bi bi-file-image text-blue-500";
            case "doc":
            case "docx": return "bi bi-file-earmark-word text-blue-700";
            default: return "bi bi-file-earmark text-gray-500";
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;
        setIsUploading(true);
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsUploading(false);
        setShowUploadModal(false);
        setSelectedFiles([]);
    };

    if (isLoading) {
        return <div className="flex justify-center items-center min-h-screen"><Loading /></div>;
    }

    return (
        <section className="min-h-screen bg-gray-100 p-8">
            <div className="w-full max-w-6xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-gray-800">Gestión de Archivos</h1>

                {/* --- Tarjetas de Resumen --- */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Espacio Usado</h3>
                            <i className="bi bi-folder text-blue-500 text-xl"></i>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
                        <p className="text-xs text-gray-500 mt-1">de 4 GB disponibles</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Total de Archivos</h3>
                            <i className="bi bi-file-earmark-text text-green-500 text-xl"></i>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">1,247</p>
                        <p className="text-xs text-gray-500 mt-1">archivos almacenados</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-medium text-gray-700">Archivos Recientes</h3>
                            <i className="bi bi-cloud-arrow-up text-purple-500 text-xl"></i>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">23</p>
                        <p className="text-xs text-gray-500 mt-1">subidos esta semana</p>
                    </div>
                </div>

                <main className="bg-white shadow-lg rounded-lg p-8">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex-1 max-w-md">
                            <Input
                                className="border border-gray-300 font-medium"
                                placeholder="Buscar por nombre o paciente..."
                                type="text"
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center"
                            onClick={() => setShowUploadModal(true)}
                        >
                            <i className="bi bi-upload mr-2"></i>
                            Subir Archivo
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Nombre</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Paciente</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Tamaño</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Fecha</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {archivosFiltrados.map((archivo, index) => (
                                    <tr key={index} className="hover:bg-gray-50 text-sm">
                                        <td className="px-4 py-3 flex items-center">
                                            <i className={`${archivo.icon} mr-3 text-xl`}></i>
                                            <span className="font-medium">{archivo.nombre}</span>
                                        </td>
                                        <td className="px-4 py-3">{archivo.paciente}</td>
                                        <td className="px-4 py-3">{archivo.tamaño}</td>
                                        <td className="px-4 py-3">{archivo.fecha}</td>
                                        <td className="px-4 py-3 flex gap-3">
                                            <button className="text-blue-600 hover:text-blue-800 p-1" title="Ver">
                                                <i className="bi bi-eye text-lg"></i>
                                            </button>
                                            <button className="text-green-600 hover:text-green-800 p-1" title="Descargar">
                                                <i className="bi bi-download text-lg"></i>
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 p-1" title="Eliminar">
                                                <i className="bi bi-trash text-lg"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>

            {/* --- Modal de Subida de Archivos --- */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl max-w-2xl w-full backdrop-filter backdrop-blur-md">
                        <div className="flex justify-between items-center mb-6">
                           <h2 className="text-2xl font-bold text-gray-800">Subir Nuevos Archivos</h2>
                           <button onClick={() => setShowUploadModal(false)} className="text-gray-500 hover:text-gray-800">
                               <i className="bi bi-x-lg text-xl"></i>
                           </button>
                        </div>
                        
                        <div
                            className="border-2 border-dashed border-gray-300 p-8 text-center rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => document.getElementById('file-input')?.click()}
                        >
                            <i className="bi bi-cloud-arrow-up text-5xl text-gray-400"></i>
                            <p className="mt-4 font-semibold text-gray-700">Arrastra archivos aquí o haz clic para seleccionar</p>
                            <p className="text-sm text-gray-500 mt-1">Soporte para PDF, JPG, DOCX, etc.</p>
                            <input
                                id="file-input"
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleFileSelect}
                            />
                        </div>

                        {selectedFiles.length > 0 && (
                            <div className="mt-6">
                                <h3 className="font-semibold mb-3">Archivos seleccionados:</h3>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                    {selectedFiles.map((file, index) => (
                                        <div key={file.name} className="flex items-center justify-between bg-gray-100 p-3 rounded-md">
                                            <div className="flex items-center gap-3">
                                                <i className={`${getFileIcon(file.name)} text-2xl`}></i>
                                                <span className="text-sm font-medium">{file.name}</span>
                                            </div>
                                            <button onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                                                <i className="bi bi-trash-fill"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 mt-8">
                            <Button
                                className="bg-gray-200 hover:bg-gray-300 rounded-full text-gray-800"
                                onClick={() => setShowUploadModal(false)}
                                disabled={isUploading}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="bg-blue-500 hover:bg-blue-600 text-white rounded-full"
                                onClick={handleUpload}
                                disabled={selectedFiles.length === 0 || isUploading}
                            >
                                {isUploading ? "Subiendo..." : `Subir ${selectedFiles.length} archivo(s)`}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}