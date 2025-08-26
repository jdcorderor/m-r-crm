"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Loading from "@/components/loading";
import HeaderD from "@/components/headerD";
import { ConfirmedDate } from "@/app/types/date";
import Calendar from "@/components/ui/calendar";

const localToISOString = (dateStr: string, timeStr: string): string => {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hourRaw, minuteRaw] = timeStr.split(":");
  const hour = timeStr.includes("PM") && hourRaw !== "12" ? Number(hourRaw) + 12 : Number(hourRaw);
  const minute = Number(minuteRaw.replace(/\D/g, ""));

  const localDate = new Date(year, month - 1, day, hour, minute);
  return localDate.toISOString();
};

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
  
  // ------------------------------------------------------------------------------

  // State variable for loading view
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // ------------------------------------------------------------------------------
        
  // State variable for dentists array
  const [dentists, setDentists] = useState<{ id: number, nombre: string, apellido: string }[]>([]);
        
  // Get dentists from the DB using fetch
  useEffect(() => {
    fetch("/api/assistant/dentists", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    .then((response) => response.json())
    .then((data) => setDentists(data))
    .catch(error => {
      console.error("Error en el fetch", error);
    })
  }, []);
  
  // ------------------------------------------------------------------------------
  
  // State variable for confirmed reservations array
  const [confirmedReservations, setConfirmedReservations] = useState<ConfirmedDate[]>([]);

  // Get confirmed reservations from the DB using fetch
  useEffect(() => {
    fetch("/api/assistant/reservations/all/confirmed", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    .then((response) => response.json())
    .then((data) => setConfirmedReservations(data))
    .catch(error => {
      console.error("Error en el fetch", error);
    })
  }, []);

  // ------------------------------------------------------------------------------

  // State variable for patients array
  const [patients, setPatients] = useState<{ id: number, nombre: string, apellido: string, cedula: string, email: string }[]>([]);

  // Get patients from the DB using fetch
  useEffect(() => {
    fetch("/api/assistant/patients", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
    .then((response) => response.json())
    .then((data) => setPatients(data))
    .catch(error => {
      console.error("Error en el fetch", error);
    })
    .finally(() => {
      setIsLoading(false);
    })
  }, []);

  // ------------------------------------------------------------------------------

  // State variables for booking form inputs
  const [reservation, setReservation] = useState<{ paciente_id: number | null; odontologo_id: number; fecha: string | null; fin_tentativo: string | null; motivo: string } | null>({ paciente_id: null, odontologo_id: 0, fecha: "", fin_tentativo: "", motivo: "" });

  // State variables for modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSentModal, setShowSentModal] = useState<boolean>(false);
  const [showFailModal, setShowFailModal] = useState<boolean>(false);

  // ------------------------------------------------------------------------------

  // Datetime select handler
  const handleDatetimeSelect = (date: string | null, hour: string | null, endHour: string | null) => {
    setReservation(prev => prev ? { ...prev, fecha: (date && hour) ? localToISOString(date, hour) : null } : prev);
    setReservation(prev => prev ? { ...prev, fin_tentativo: (date && endHour) ? localToISOString(date, endHour) : null } : prev);
  };

  // ------------------------------------------------------------------------------

  // Form submission handler
  const handleSubmit = () => {
    if (reservation?.paciente_id && reservation?.odontologo_id && reservation?.fecha && reservation?.fin_tentativo && reservation?.motivo) {
      setShowModal(true);
      return;
    }
  }

  // Date confirmation handler
  const handleReservationConfirmation = async () => {
    try {
      const response = await fetch("/api/assistant/reservations/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ paciente_id: reservation?.paciente_id, odontologo_id: reservation?.odontologo_id, fecha: reservation?.fecha, fin_tentativo: reservation?.fin_tentativo,  motivo: reservation?.motivo }),
        credentials: "include",
      });

      if (response.ok) {
        setShowModal(false);
        setShowSentModal(true);
      } else {
        setShowFailModal(true);
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setShowFailModal(true);
    }
  };

  // ------------------------------------------------------------------------------

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
          
          <div className="flex flex-col w-full max-w-3xl bg-gray-50 border border-gray-200 rounded-2xl p-16 mx-auto my-16"> 
            <div className="flex flex-col w-full max-w-3xl text-sm gap-4">
              <span className="block text-gray-800 text-2xl text-center font-semibold">Registro de Citas</span>

              <hr className="border-gray-200"/>

              <div className="flex flex-col w-full max-w-[600px] mx-auto py-6 gap-4">
                <span className="block text-gray-800 text-base font-semibold">Paciente *</span>

                <div className="flex flex-col flex-1 gap-1">
                  <select name="paciente" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none" value={reservation?.paciente_id ?? ""} onChange={(e) => { setReservation(prev => prev ? { ...prev, paciente_id: Number(e.target.value) } : prev); }}>
                    <option value="" disabled>Seleccione un paciente</option>
                    {patients.map((p, index) => (
                      <option key={index} value={p.id}>{p.nombre} {p.apellido} - {p.cedula}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="border-gray-200"/>

              <div className="flex flex-col w-full max-w-[600px] mx-auto py-6 gap-4">
                <span className="block text-gray-800 text-base font-semibold">Especialista *</span>

                <div className="grid grid-cols-2 gap-2">
                  {dentists.map((d, index) => (
                    <div className="w-full" key={index}>
                      <Button key={index} type="button" className={`${reservation?.odontologo_id === d.id ? "border-blue-600" : "border-gray-200"} w-full bg-white border-3 rounded-full shadow-none py-3 hover:bg-white hover:border-blue-600`} onClick={() => setReservation(prev => prev ? { ...prev, odontologo_id: Number(d.id) } : prev)}>
                        {d.nombre.split(" ")[0]} {d.apellido.split(" ")[0]}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-gray-200"/>

              <div className="flex flex-col overflow-hidden py-6 gap-4">
                <Calendar onHandleChange={ handleDatetimeSelect } data={{ id: undefined, fecha: null, fin_tentativo: null }} confirmedDates={ confirmedReservations } dentistID={ (reservation?.odontologo_id != null) ? (reservation.odontologo_id).toString() : null }/> 
              </div>

              <hr className="border-gray-200"/>
                                
              <div className="flex flex-col w-full max-w-[600px] mx-auto py-6 gap-4">
                <span className="block text-gray-800 text-base font-semibold px-1">Motivo *</span>

                <textarea id="motivo" required placeholder="Motivo" value={reservation?.motivo ?? ""} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReservation(prev => prev ? { ...prev, motivo: e.target.value } : prev)} rows={4}
                className="w-full bg-white text-gray-700 border border-gray-300 rounded-lg outline-none px-3 py-2 transition duration-150"/>
              </div>

              <div className="flex justify-center gap-2 text-sm">
                <Button className="px-8 py-1 bg-blue-500 text-white rounded-full shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                onClick={ () => { handleSubmit() } }>
                  Guardar
                </Button>
                <Button className="px-8 py-1 bg-gray-200 rounded-full shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 ease-in-out"
                onClick={() => router.push(`/auxiliar/citas`)}>
                  Volver
                </Button>
              </div>
            </div>
          </div>

          {/* Confirm modal */}
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm ">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                <span className="block text-xl font-semibold text-center my-3">Confirmar la cita</span>
                <span className="block text-center text-sm mb-8">Al confirmar la cita, se enviará una notificación al correo electrónico del paciente: <strong>{patients.filter((p) => p.id === reservation?.paciente_id)[0].email}</strong>.</span>
                <div className="flex justify-between mt-4 gap-2">
                  <Button className="w-full bg-gray-200 hover:bg-gray-300 rounded-full text-sm" onClick={() => { setShowModal(false); }}>
                    Cancelar
                  </Button>
                  <Button className="w-full bg-gray-600 text-white hover:bg-gray-400 rounded-full text-sm" onClick={() => { handleReservationConfirmation(); setShowModal(false); }}>
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
                <span className="text-xl font-semibold text-center mb-2">¡La cita ha sido confirmada!</span>
                <span className="text-center text-sm text-gray-600 my-2">Por favor, <strong> verifique que haya sido enviado un correo electrónico. </strong></span>
                <Button className="w-full bg-green-300 hover:bg-green-400 rounded-full mt-3" onClick={() => { setShowSentModal(false); router.push("/auxiliar/citas"); }}> 
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
        </div>
      )}
    </section>
  );
}