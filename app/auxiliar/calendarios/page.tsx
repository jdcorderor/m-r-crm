'use client'
import { useState, useEffect, JSX } from 'react';
import { useRouter } from 'next/navigation';
import { Appointment } from '@/app/types/appointment';
import { DailyAppointments } from '@/app/types/daily-appointments';
import Loading from "@/components/loading";
import HeaderD from "@/components/headerD";
import { formatDate } from '@/hooks/homePageHooks';

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
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // State variable for error message
    const [error, setError] = useState<string | null>(null);

    // --------------------------------------------------------------------------
    
    // Month names array
    const monthNames: string[] = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    // Day names array
    const dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    // --------------------------------------------------------------------------

    // Days in a month getter
    const getDaysInMonth = (date: Date): number => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    // First day of a month getter
    const getFirstDayOfMonth = (date: Date): number => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    // Move back to previous month
    const handlePreviousMonth = (): void => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() - 1);
            return newDate;
        });
    };

    // Move forward to next month
    const handleNextMonth = (): void => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + 1);
            return newDate;
        });
    };

    // Handle day click to select a date
    const handleDayClick = (day: number): void => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    };

    // Check if a day is today
    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            selectedDate.getFullYear() === today.getFullYear() &&
            selectedDate.getMonth() === today.getMonth() &&
            day === today.getDate()
        );
    };

    // Check if a day is selected
    const isSelected = (day: number): boolean => {
        return selectedDate.getDate() === day;
    };

    // Render calendar days
    const renderCalendarDays = (): JSX.Element[] => {
        const days: JSX.Element[] = [];
        const daysInMonth: number = getDaysInMonth(selectedDate);
        const firstDay: number = getFirstDayOfMonth(selectedDate);
        const year = selectedDate.getFullYear();
        const month = (selectedDate.getMonth() + 1).toString().padStart(2, "0");

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayStr = day.toString().padStart(2, "0");
            const dateKey = `${year}-${month}-${dayStr}`;
            const dayAppointments = allMonthAppointments[dateKey] || [];
            const hasDentistAppointments = dayAppointments.some(a => a.dentist_id === selectedDentist);

            days.push(
                <button
                    key={`day-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`
                        h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium mx-auto my-[1px]
                        ${isToday(day) ? 'bg-blue-500 text-white' : ''}
                        ${isSelected(day) && !isToday(day) ? 'bg-blue-200 text-blue-800 border-2 border-blue-500' : ''}
                        ${!isToday(day) && !isSelected(day) && hasDentistAppointments ? 'bg-green-100 text-green-800 border-2 border-green-300' : ''}
                        ${!isToday(day) && !isSelected(day) && !hasDentistAppointments ? 'text-gray-700 hover:bg-gray-100' : ''}
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    // --------------------------------------------------------------------------
    
    // State variable for selected dentist
    const [selectedDentist, setSelectedDentist] = useState<number | null>(null)
    
    // State variable for selected date
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    // --------------------------------------------------------------------------

    // State variable for dentists array
    const [dentists, setDentists] = useState<{ id: number, nombre: string, apellido: string }[] | null>(null);

    // Get dentists from the DB using fetch
    useEffect(() => {
        const fetchDentists = async (): Promise<void> => {
            setError(null);

            try {
                const response = await fetch(`/api/assistant/dentists`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    setError("Error al cargar los especialistas");
                }

                const data = await response.json();

                setDentists(data);

                if (Array.isArray(data) && data.length > 0) {
                    setSelectedDentist(data[0].id);
                }
            } catch (err: unknown) {
                setError("Error al cargar los especialistas");
                console.error(err);
            }
        };
        
        fetchDentists();
    }, []); 

    // --------------------------------------------------------------------------
    
    // State variable for appointments array
    const [appointments, setAppointments] = useState<Appointment[]>([]);

    // State variable for all-month appointments array
    const [allMonthAppointments, setAllMonthAppointments] = useState<DailyAppointments>({});
    
    // Get month appointments from the DB using fetch
    useEffect(() => {
        const fetchMonthAppointments = async (date: Date): Promise<void> => {
            setIsLoading(true);
            setError(null);
            
            if (!user.username) {
                return;
            }

            try {
                const response = await fetch(`/api/assistant/calendar`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });

                if (!response.ok) {
                    setError("Error al cargar las citas del mes, intente más tarde");
                }

                const data = await response.json();

                setAllMonthAppointments(data);
                const currentDayKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${(date.getDate()).toString().padStart(2, "0")}`;
                setAppointments(data[currentDayKey] || []);
                setIsLoading(false);
            } catch (err: unknown) {
                setError("Error al cargar las citas del mes, intente más tarde");
                console.error(err);
            }
        };
        
        fetchMonthAppointments(selectedDate);
    }, [selectedDate, user]);

    // Update appointments when selected date changes
    useEffect(() => {
        const currentDayKey = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}-${(selectedDate.getDate()).toString().padStart(2, "0")}`;
        setAppointments(allMonthAppointments[currentDayKey] || []);
    }, [selectedDate, allMonthAppointments]);

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
                    <HeaderD />
  
                    <div className="flex flex-col max-w-4xl mx-auto my-10 gap-4">
                        {(dentists && dentists?.length > 0) && (<div className="w-fit border-2 border-gray-200 rounded-3xl shadow-sm">
                                {dentists?.map((d, index) => (
                                    <button key={index} className={`text-sm px-4 py-2 border-gray-300  ${(selectedDentist === d.id) ? "bg-gray-200 rounded-3xl" : ""}`} onClick={ () => { setSelectedDentist(d.id) } }>Od. {d.nombre.split(" ")[0]} {d.apellido.split(" ")[0]}</button>
                                ))}
                            </div>
                        )}

                        <main className="flex flex-col max-w-4xl p-12 mx-auto  w-full bg-gray-50 border border-gray-200 rounded-xl">
                            <div className="flex flex-col md:flex-row gap-8">
                                
                                {/* Calendar section */}
                                <div className="flex flex-col flex-1 gap-2">
                                    <div className="flex justify-between items-center mb-4">
                                        <button onClick={handlePreviousMonth} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Mes anterior">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                        </button>
                                        
                                        <h2 className="font-semibold text-gray-800">
                                            {monthNames[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
                                        </h2>

                                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Mes siguiente">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-7 text-center">
                                        {dayNames.map((day) => (
                                            <div key={day} className="text-sm font-medium text-gray-500">
                                                {day}
                                            </div>
                                        ))}
                                        {renderCalendarDays()}
                                    </div>

                                    <div className="border-t border-gray-200 pt-6 mt-6">
                                        <h3 className="font-semibold text-gray-700 mb-3">Leyenda</h3>
                                        <div className="flex items-center mb-2">
                                            <span className="w-5 h-5 rounded-full bg-blue-500 mr-2 border border-blue-600"></span>
                                            <p className="text-sm text-gray-600">Día actual</p>
                                        </div>
                                        <div className="flex items-center mb-2">
                                            <span className="w-5 h-5 rounded-full bg-blue-200 mr-2 border-2 border-blue-500"></span>
                                            <p className="text-sm text-gray-600">Día seleccionado</p>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="w-5 h-5 rounded-full bg-green-100 mr-2 border-2 border-green-300"></span>
                                            <p className="text-sm text-gray-600">Día con citas agendadas</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Appointments Section */}
                                <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-8 space-y-6">
                                    <div className="space-y-1">
                                        <h2 className="text-xl font-bold text-gray-800">Citas agendadas</h2>
                                        <p className="text-sm font-medium">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    </div>
                                    {error ? (<p className="text-sm text-red-500">{error}</p>) : appointments.length === 0 ? (<p className="text-sm text-gray-600">No hay citas agendadas para este día</p>) : (
                                        <ul className="space-y-4">
                                            {appointments.map((appointment) => 
                                                (selectedDentist && (appointment.dentist_id === selectedDentist)) && (
                                                    <li key={appointment.id} className="bg-white p-4 border border-gray-200 rounded-lg shadow-sm">
                                                        <div className="flex justify-between items-center mb-2">
                                                            <p className="text-lg font-semibold text-blue-800">{(formatDate(appointment.date)).split(", ")[1]} - {(formatDate(appointment.end)).split(", ")[1]}</p>
                                                        </div>
                                                        <p className="text-gray-600 text-sm"><b>Paciente:</b> <span>{appointment.patient}</span></p>
                                                        <p className="text-gray-600 text-sm"><b>Motivo:</b> {appointment.reason}</p>
                                                    </li>
                                                ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </main>
                    </div>
                </div>
            )}
        </section>
    );
}