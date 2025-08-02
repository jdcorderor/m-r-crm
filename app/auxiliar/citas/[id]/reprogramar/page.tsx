"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import HeaderD from "@/components/headerD";
import Loading from "@/components/loading";
import Input from "@/components/ui/input";
import Button from "@/components/ui/button";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function Home() {
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

  // State variables for loading view
  const [dentistsLoaded, setDentistsLoaded] = useState(false);
  const [reservationsLoaded, setReservationsLoaded] = useState(false);
  const [reservationDataLoaded, setReservationDataLoaded] = useState(false);

  // ------------------------------------------------------------------------------

  // Define dentist type
  type Dentist = {
    id: number;
    nombre: string;
    apellido: string;
  }
        
  // State variable for dentists list
  const [dentists, setDentists] = useState<Dentist[]>([]);
        
  // Get dentists from the DB using fetch
  useEffect(() => {
    fetch("/api/dentists", {
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
    .finally(() => {
      setDentistsLoaded(true);
    })
  }, []);
  
  // ------------------------------------------------------------------------------

  // Define confirmed reservation type
  type ConfirmedReservation = {
    id: number;
    odontologo_id: number;
    fecha: string;
    fin_tentativo: string;
  }
  
  // State variable for confirmed reservations list
  const [confirmedReservations, setConfirmedReservations] = useState<ConfirmedReservation[]>([]);

  // Get confirmed reservations from the DB using fetch
  useEffect(() => {
    fetch("/api/reservations/all/confirmed", {
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
    .finally(() => {
      setReservationsLoaded(true);
    })
  }, []);

  // ------------------------------------------------------------------------------

  // State variables for alert and modal visibility
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showSentModal, setShowSentModal] = useState<boolean>(false);
  const [showFailModal, setShowFailModal] = useState<boolean>(false);
  
  // State variables for form inputs
  const [dentist, setDentist] = useState<number | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [ci, setCI] = useState<string | null>(null);
  const [birthDate, setBirthDate] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [phone, setPhone] = useState<string | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string | null>(null);
  const [appointmentTime, setAppointmentTime] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [appointmentEndTime, setAppointmentEndTime] = useState<string | null>(null);
  const [isUnderage, setIsUnderage] = useState<boolean>(false);
  const [isApple, setIsApple] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent;
    if (/iPad|iPhone|iPod|Macintosh/.test(ua)) {
      setIsApple(true);
    }
  }, []);

  useEffect(() => {
    if (birthDate) {
      const today = new Date();
      const birthDateObj = new Date(birthDate);
      let age = today.getFullYear() - birthDateObj.getFullYear();
      const m = today.getMonth() - birthDateObj.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
        age--;
      }
      setIsUnderage(age < 18);
    }
  }, [birthDate]);

  // ------------------------------------------------------------------------------

  // Get reservation ID from the route params
  const { id } = useParams();

  // Get reservation data from the DB using fetch
  useEffect(() => {
    const handleDataLoad = async () => {

        if (!id) {
            console.error("Reservación no encontrada")
        }

        const response = await fetch(`/api/reservations/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (response.ok) {
            const data = await response.json();
            setDentist(data[0].odontologo_id);
            setName(data[0].paciente_nombre);
            setLastName(data[0].paciente_apellido);
            setBirthDate(data[0].fecha_nacimiento.split("T")[0]);
            setCI(data[0].cedula);
            setEmail(data[0].email);
            setPhone(data[0].telefono);
            setAddress(data[0].direccion);
            setGender(data[0].genero);
            setAppointmentDate(data[0].fecha.split("T")[0]);
            const date = new Date(data[0].fecha)
            setAppointmentTime(`${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`);
            const end = new Date(data[0].fin_tentativo)
            setAppointmentEndTime(`${end.getHours().toString().padStart(2, "0")}:${end.getMinutes().toString().padStart(2, "0")}`);
            setReason(data[0].motivo);
            setReservationDataLoaded(true);
        }
    }

    handleDataLoad();
  }, [id])

  // ------------------------------------------------------------------------------

  // Email submission handler
  const handleEmailSubmission = async () => {
    const data = {
      email,
      subject: `Reprogramación de cita - ${name} ${lastName} | Mavarez & Román`,
      text: `
        <p>Estimado paciente,</p>
        <p>Le informamos que su cita en <strong>Mavarez & Román</strong> ha sido reprogramada.</p>

        <table style="width: 100%; border-collapse: collapse; margin: 1em 0;">
          <tr>
            <td><strong>Nombre:</strong></td>
            <td>${name}</td>
          </tr>
          <tr>
            <td><strong>Apellido:</strong></td>
            <td>${lastName}</td>
          </tr>
          <tr>
            <td><strong>Cédula:</strong></td>
            <td>${ci}</td>
          </tr>
          <tr>
            <td><strong>Odontólogo:</strong></td>
            <td>Od. ${dentist !== null && dentists.some((d) => d.id === dentist) ? dentists.filter((d) => d.id === dentist)[0].nombre.split(" ")[0] + " " + dentists.filter((d) => d.id === dentist)[0].apellido.split(" ")[0] : ""}</td>
          </tr>
          <tr>
            <td><strong>Fecha de cita:</strong></td>
            <td>${appointmentDate?.split("-")[2]}-${appointmentDate?.split("-")[1]}-${appointmentDate?.split("-")[0]}</td>
          </tr>
          <tr>
            <td><strong>Hora:</strong></td>
            <td>${appointmentTime} - ${appointmentEndTime}</td>
          </tr>
          <tr>
            <td><strong>Motivo:</strong></td>
            <td>${reason}</td>
          </tr>
        </table>
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

  // Reservation rescheduling handler
  const handleRescheduling = async () => {
    const data = {
      paciente: {
        nombre: name,
        apellido: lastName,
        cedula: ci,
        fecha_nacimiento: birthDate,
        email: email,
        telefono: phone,
        genero: gender,
        direccion: address
      },
      odontologo: dentist ? dentist : null,
      detalles: {
        id: id,
        fecha_cita: appointmentDate,
        hora_cita: appointmentTime,
        fin_tentativo: appointmentEndTime,
        motivo: reason
      }
    }

    try { 
      const response = await fetch("/api/reservations/confirm", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (response.ok) {
          setDentist(null);
          setName(null);
          setLastName(null);
          setCI(null);
          setBirthDate(null);
          setEmail(null);
          setPhone(null);
          setAddress(null);
          setGender(null);
          setAppointmentDate(null);
          setAppointmentTime(null);
          setAppointmentEndTime(null);
          setReason(null);
          setShowModal(false);
          setShowSentModal(true);
          handleEmailSubmission();
        }
      } catch (error) {
        console.error("Error al reprogramar la reservación:", error);
        setShowFailModal(true);
      }
  }

  // ------------------------------------------------------------------------------

  // Verify user variable
  if (user.username === "" && user.role === "") return null;

  return (
    <section>
      {(!dentistsLoaded && !reservationsLoaded && !reservationDataLoaded) && (
        <div className="flex justify-center items-center min-h-screen bg-white transition-opacity duration-500">
          <Loading />
        </div>
      )}
      
      {(dentistsLoaded && reservationsLoaded && reservationDataLoaded) && (
        <div> 
          {/* Header */}
          <HeaderD />

          {/* Reservation management form */}
          <main className="flex justify-center items-center min-h-[80vh]">
            <div className="bg-white w-full max-w-5xl p-10">
              <span className="block text-2xl text-gray-800 font-semibold mb-8 text-center">Reprogramación de Citas</span>
              
              <form className="space-y-8">
                <span className="block text-lg text-gray-800 font-medium mb-2">Información básica</span>
                <hr className="border-gray-200 mb-5"/>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Nombre *</label>
                    <Input required placeholder="Nombre" className="border-gray-300 text-sm" value={name ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Apellido *</label>
                    <Input required placeholder="Apellido" className="border-gray-300 text-sm" value={lastName ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Fecha de nacimiento *</label>
                    <input required className={`px-3 py-2 bg-white text-gray-500 outline-none border border-gray-300 text-sm shadow-sm rounded-lg duration-150 mb-2 ${isApple ? "w-[94%] h-10" : "w-full"}`} type="date" value={birthDate ?? ""} lang="es" inputMode="numeric" pattern="\d{4}-\d{2}-\d{2}" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBirthDate(e.target.value)} max={new Date().toISOString().split('T')[0]}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Cédula de Identidad *</label>
                    <Input required type="number" min="100000" max="99999999" placeholder="Cédula (ej. 12345678)" className="border-gray-300 text-sm" value={ci ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCI(e.target.value)}/>
                  </div>
                </div>      

                {isUnderage && (
                  <span className="text-red-600 text-xs block text-center mb-4">
                    Si el paciente no dispone de cédula de identidad, por favor proporcionar la de su representante legal.
                  </span>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Correo electrónico *</label>
                    <Input required type="email" placeholder="nombre@correo.com" className="border-gray-300 text-sm" value={email ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Teléfono *</label>
                    <Input required type="number" placeholder="Teléfono (ej. 04241234567)" className="border-gray-300 text-sm" value={phone ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Dirección *</label>
                    <Input required type="text" placeholder="Dirección" className="border-gray-300 text-sm" value={address ?? ""} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value)}/>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Género *</label>
                    <div className="flex justify-center gap-4 mt-2 ml-2">
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="gender" value="M" checked={gender === "M"} onChange={() => setGender("M")} className="accent-blue-600 w-3 h-3" required/>
                        <span className="ml-2 text-sm">Masculino</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input type="radio" name="gender" value="F" checked={gender === "F"} onChange={() => setGender("F")} className="accent-blue-600 w-3 h-3"/>
                        <span className="ml-2 text-sm">Femenino</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Odontólogo *</label>
                  <div className="flex gap-2 mb-3 flex-col md:flex-row">
                    {dentists.map((dentistItem) => (
                      <div className="w-full" key={dentistItem.id}>
                        <button key={dentistItem.id} type="button" className={`w-full bg-gray-100 hover:bg-gray-200 text-sm text-gray-800 font-semibold py-2 px-8 rounded-3xl shadow-sm transition-colors border-3 cursor-pointer ${dentist === dentistItem.id ? "border-blue-500" : "border-gray-300"}`} onClick={() => setDentist(dentistItem.id)}>
                          {dentistItem.nombre.split(" ")[0]} {dentistItem.apellido.split(" ")[0]}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Fecha de cita *</label>
                    <input required type="date" className={`px-3 py-2 bg-white text-gray-500 outline-none border border-gray-300 text-sm shadow-sm rounded-lg duration-150 mb-2 ${isApple ? "w-[94%] h-10" : "w-full"}`} value={appointmentDate ?? ""} lang="es" inputMode="numeric" pattern="\d{4}-\d{2}-\d{2}" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentDate(e.target.value)}
                      min={(() => {
                        const now = new Date();
                        
                        if (now.getHours() > 14 || (now.getHours() === 14 && now.getMinutes() > 0)) {
                          const tomorrow = new Date(now);
                          tomorrow.setDate(now.getDate() + 1);
                          return tomorrow.toISOString().split('T')[0];
                        }

                        return now.toISOString().split('T')[0];
                      })()}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Hora de cita *</label>
                    <input required type="time" className={`px-3 py-2 bg-white text-gray-500 outline-none border border-gray-300 text-sm shadow-sm rounded-lg duration-150 mb-2 ${isApple ? "w-[94%] h-10" : "w-full"}`} value={appointmentTime ?? ""} lang="es" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentTime(e.target.value)}
                      min={ appointmentDate === new Date().toISOString().split('T')[0] ? (() => {
                        const now = new Date();
                        const maxHour = 14;
                        if (now.getHours() > maxHour || (now.getHours() === maxHour && now.getMinutes() > 0)) {
                          return "14:00";
                        }
                          return now.toTimeString().slice(0, 5);
                        })() : "08:00"
                      }
                      max="14:00"
                    />
                  </div>
                </div>

                {dentist !== null && appointmentDate && appointmentTime && new Date(`${appointmentDate}T${appointmentTime}`).toISOString() > new Date().toISOString() && confirmedReservations.some((c) => {
                  if (c.odontologo_id !== dentist || c.id === Number(id)) return false;
                    
                  const start = new Date(`${c.fecha}`).toISOString();
                  const end = new Date(`${c.fin_tentativo}`).toISOString();
                  const selected = new Date(`${appointmentDate}T${appointmentTime}`).toISOString();
                  
                  return selected >= start && selected < end;
                  
                }) && (
                  <span className="text-red-600 text-xs block text-center mt-1 mb-4">
                    Ya existe una cita agendada para este odontólogo en el horario seleccionado. <br /> Por favor, elija otro horario.
                  </span>
                )}

                {appointmentDate && appointmentTime && (() => {
                  const selectedDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
                  const now = new Date();
                  const selectedHour = selectedDateTime.getHours();
                  const selectedMinute = selectedDateTime.getMinutes();

                  const isValidHour = (
                    (selectedHour > 8 && selectedHour < 14) ||
                    (selectedHour === 8 && selectedMinute >= 0) ||
                    (selectedHour === 14 && selectedMinute === 0)
                  );

                  {/* Validates past dates */} 
                  if (selectedDateTime.toISOString() < now.toISOString()) {
                    return (
                      <span className="text-red-600 text-xs block text-center mt-1 mb-4">
                        Ha seleccionado un horario inválido. <br /> Por favor, elija otro horario.
                      </span>
                    );
                  }

                  {/* Validates schedule */}
                  if (!isValidHour) {
                    return (
                      <span className="text-red-600 text-xs block text-center mt-1 mb-4">
                        El horario debe estar entre las 08:00 y las 14:00. <br /> Por favor, elija otro horario.
                      </span>
                    );
                  }

                  return null;
                })()}

                <div>
                  <div>
                    <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Motivo *</label>
                    <Input required placeholder="Motivo" value={reason ?? ""} className="border-gray-300 text-sm" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReason(e.target.value)}/>
                  </div>
                </div>

                <span className="block text-lg text-gray-800 font-medium mb-2">Información adicional</span>
                <hr className="border-gray-200 mb-5"/>

                <div>
                  <label className="block text-sm font-medium mb-1 pl-2" htmlFor="">Hora de finalización (aprox.) *</label>
                  <input required type="time" className={`px-3 py-2 bg-white text-gray-500 outline-none border border-gray-300 text-sm shadow-sm rounded-lg duration-150 ${isApple ? "w-[94%] h-10" : "w-full"}`} value={appointmentEndTime ?? ""} lang="es" inputMode="numeric" pattern="[0-9]{2}:[0-9]{2}" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentEndTime(e.target.value)} min={ appointmentTime ?? "" } max="16:00"/>
                </div>

                { appointmentTime && appointmentEndTime && (appointmentTime > appointmentEndTime) && (
                  <span className="text-red-600 text-xs block text-center mt-1 mb-6">
                        La hora de finalización debe ser posterior a la hora de la cita. <br /> Por favor, elija otro horario.
                  </span>
                )}
                
                <div>
                  <div className="flex justify-center gap-2">
                    <Button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl" onClick={ () => { if (appointmentEndTime) { setShowModal(true) } } }>
                      Reprogramar
                    </Button>

                    <Button type="button" className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2 px-8 rounded shadow-sm transition-colors border-3 border-gray-300 rounded-3xl" onClick={ () => { router.push("/auxiliar/citas") } }>
                      Cancelar
                    </Button>

                    {/* Confirm modal */}
                    {showModal && (
                        <div className="fixed inset-0 flex items-center justify-center z-50 bg-transparent bg-opacity-30 backdrop-blur-sm ">
                          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
                            <span className="block text-2xl font-bold text-center my-3">Reprogramar la cita</span>
                            <span className="block text-center text-medium mb-8">Al reprogramar la cita, se enviará una notificación al correo electrónico del paciente: <strong>{email}</strong>.</span>
                            <div className="flex justify-between mt-4">
                            <Button className="w-[48%] bg-gray-200 hover:bg-gray-300 rounded-3xl" onClick={() => setShowModal(false)}>Cancelar</Button>
                            <Button className="w-[48%] bg-gray-600 text-white hover:bg-gray-400 rounded-3xl" onClick={() => { handleRescheduling(); setShowModal(false); }}>Continuar</Button>
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
                            <span className="text-xl font-semibold text-center mb-2">¡La cita ha sido reprogramada!</span>
                            <span className="text-center text-sm text-gray-600 my-2">Por favor, <strong> verifique que haya sido enviado un correo electrónico. </strong></span>
                            <Button className="w-full bg-green-300 hover:bg-green-500 rounded mt-3" onClick={() => { setShowSentModal(false); router.push("/auxiliar/citas") }}> Continuar </Button>
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
                  </div>
                </div>
              </form>
            </div>
          </main>
        </div>
      )}
    </section>
  );
}