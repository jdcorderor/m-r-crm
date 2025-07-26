'use client'
import { useState, useEffect, JSX } from 'react';
import Head from 'next/head';

// Definición de la interfaz para una cita
interface Appointment {
    id: number;
    time: string;
    patient: string;
    reason: string;
    date: string;
}

// Interfaz para la respuesta de las citas agrupadas por fecha
interface DailyAppointments {
    [date: string]: Appointment[];
}

export default function Calendario(): JSX.Element {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [allMonthAppointments, setAllMonthAppointments] = useState<DailyAppointments>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMonthAppointments = async (date: Date): Promise<void> => {
        setLoading(true);
        setError(null);
        try {
            // Simula una llamada a una API para obtener todas las citas del mes (Integrar con API)
            const response: DailyAppointments = await new Promise((resolve) =>
                setTimeout(() => {
                    const year = date.getFullYear();
                    const month = date.getMonth();

                    const citasEjemplo: DailyAppointments = {
                        [`${year}-${month}-${23}`]: [
                            { id: 1, time: '09:00 AM', patient: 'Juan Pérez', reason: 'Consulta general', date: `${year}-${month}-${23}` },
                            { id: 2, time: '10:30 AM', patient: 'María López', reason: 'Revisión anual', date: `${year}-${month}-${23}` },
                        ],
                        [`${year}-${month}-${24}`]: [
                            { id: 3, time: '11:00 AM', patient: 'Carlos Gómez', reason: 'Seguimiento', date: `${year}-${month}-${24}` },
                        ],
                        [`${year}-${month}-${25}`]: [
                            { id: 4, time: '03:00 PM', patient: 'Ana Ramírez', reason: 'Control', date: `${year}-${month}-${25}` },
                        ],
                        [`${year}-${month}-${10}`]: [
                            { id: 5, time: '10:00 AM', patient: 'Pedro Soler', reason: 'Primera consulta', date: `${year}-${month}-${10}` },
                        ],
                    };

                    resolve(citasEjemplo);
                }, 500)
            );

            setAllMonthAppointments(response);
            const currentDayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
            setAppointments(response[currentDayKey] || []);
        } catch (err: unknown) {
            setError('Error al cargar las citas del mes. Por favor, inténtalo de nuevo.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMonthAppointments(selectedDate);
    }, [selectedDate]); // Dependencia del efecto para recargar al cambiar el mes

    useEffect(() => {
        const currentDayKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
        setAppointments(allMonthAppointments[currentDayKey] || []);
    }, [selectedDate, allMonthAppointments]);


    const getDaysInMonth = (date: Date): number => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date: Date): number => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday, etc.
    };

    const hasAppointments = (day: number): boolean => {
        const dayKey = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${day}`;
        return allMonthAppointments[dayKey] && allMonthAppointments[dayKey].length > 0;
    };

    const handlePreviousMonth = (): void => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() - 1);
            return newDate;
        });
    };

    const handleNextMonth = (): void => {
        setSelectedDate((prevDate) => {
            const newDate = new Date(prevDate);
            newDate.setMonth(prevDate.getMonth() + 1);
            return newDate;
        });
    };

    const handleDayClick = (day: number): void => {
        setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), day));
    };

    const isToday = (day: number): boolean => {
        const today = new Date();
        return (
            selectedDate.getFullYear() === today.getFullYear() &&
            selectedDate.getMonth() === today.getMonth() &&
            day === today.getDate()
        );
    };

    const isSelected = (day: number): boolean => {
        return selectedDate.getDate() === day;
    };

    const renderCalendarDays = (): JSX.Element[] => {
        const days: JSX.Element[] = [];
        const daysInMonth: number = getDaysInMonth(selectedDate);
        const firstDay: number = getFirstDayOfMonth(selectedDate); // 0 (Domingo) - 6 (Sábado)

        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-10"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayHasAppointments = hasAppointments(day);
            days.push(
                <button
                    key={`day-${day}`}
                    onClick={() => handleDayClick(day)}
                    className={`
            h-10 w-10 flex items-center justify-center rounded-full text-sm font-medium
            ${isToday(day) ? 'bg-blue-500 text-white' : ''}
            ${isSelected(day) && !isToday(day) ? 'bg-blue-200 text-blue-800 border-2 border-blue-500' : ''}
            ${!isToday(day) && !isSelected(day) && dayHasAppointments ? 'bg-green-100 text-green-800 border-2 border-green-300' : ''}
            ${!isToday(day) && !isSelected(day) && !dayHasAppointments ? 'text-gray-700 hover:bg-gray-100' : ''}
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          `}
                >
                    {day}
                </button>
            );
        }
        return days;
    };

    const monthNames: string[] = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const dayNames: string[] = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
            <Head>
                <title>Calendario del Doctor</title>
                <meta name="description" content="Calendario de citas del doctor" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    Calendario de Citas del Doctor
                </h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Calendar Section */}
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-4">
                            <button
                                onClick={handlePreviousMonth}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Mes anterior"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-semibold text-gray-800">
                                {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                            </h2>
                            <button
                                onClick={handleNextMonth}
                                className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                aria-label="Mes siguiente"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-center">
                            {dayNames.map((day) => (
                                <div key={day} className="text-sm font-medium text-gray-500">
                                    {day}
                                </div>
                            ))}
                            {renderCalendarDays()}
                        </div>

                        {/* Leyenda de colores */}
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Leyenda</h3>
                            <div className="flex items-center mb-2">
                                <span className="w-5 h-5 rounded-full bg-blue-500 mr-2 border border-blue-600"></span>
                                <p className="text-gray-600">Día Actual</p>
                            </div>
                            <div className="flex items-center mb-2">
                                <span className="w-5 h-5 rounded-full bg-blue-200 mr-2 border-2 border-blue-500"></span>
                                <p className="text-gray-600">Día Seleccionado</p>
                            </div>
                            <div className="flex items-center">
                                <span className="w-5 h-5 rounded-full bg-green-100 mr-2 border-2 border-green-300"></span>
                                <p className="text-gray-600">Día con Citas</p>
                            </div>
                        </div>
                    </div>

                    {/* Appointments Section */}
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-gray-200 pt-8 md:pt-0 md:pl-8">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">
                            Citas para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </h2>

                        {loading ? (
                            <p className="text-gray-600">Cargando citas...</p>
                        ) : error ? (
                            <p className="text-red-500">{error}</p>
                        ) : appointments.length === 0 ? (
                            <p className="text-gray-600">No hay citas agendadas para este día.</p>
                        ) : (
                            <ul className="space-y-4">
                                {appointments.map((appointment) => (
                                    <li key={appointment.id} className="bg-blue-50 p-4 rounded-lg shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <p className="text-lg font-semibold text-blue-800">{appointment.time}</p>
                                            <span className="text-sm text-gray-500">ID: {appointment.id}</span>
                                        </div>
                                        <p className="text-gray-700">Paciente: <span className="font-medium">{appointment.patient}</span></p>
                                        <p className="text-gray-600 text-sm">Motivo: {appointment.reason}</p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}