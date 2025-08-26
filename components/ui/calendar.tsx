import React, { useEffect, useState } from 'react';
import Button from './button';
import { NextArrow, PrevArrow } from '@/components/ui/arrows/arrows';
import { ConfirmedDate } from "@/app/types/date";

const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ISOStringToLocal = (iso: string): { date: string; time: string } => {
  const date = new Date(iso);
  const localYear = date.getFullYear();
  const localMonth = String(date.getMonth() + 1).padStart(2, "0");
  const localDay = String(date.getDate()).padStart(2, "0");

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const isPM = hours >= 12;
  const displayHour = hours % 12 || 12;

  return {
    date: `${localYear}-${localMonth}-${localDay}`,
    time: `${displayHour}:${minutes} ${isPM ? "PM" : "AM"}`,
  };
};

const parseHourToMinutes = (hourStr: string): number => {
  const [time, meridian] = hourStr.split(" ");
  const [h, m] = time.split(":").map(Number);
  const hour = meridian === "PM" && h !== 12 ? h + 12 : meridian === "AM" && h === 12 ? 0 : h;
  return hour * 60 + m;
};

const formatMinutesToTime = (totalMinutes: number): string => {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

interface CalendarProps {
  onHandleChange: (date: string | null, hour: string | null, end: string | null) => void;
  data: { id: string | undefined, fecha: string | null | undefined, fin_tentativo: string | null | undefined } | null;
  confirmedDates: ConfirmedDate[] | null;
  dentistID: string | null;
}

const Calendar: React.FC<CalendarProps> = ({ onHandleChange, data, confirmedDates, dentistID }) => {
  // State variables for dates array and selected date
  const [dates, setDates] = useState<Date[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(data?.fecha ? new Date(data.fecha) : null);

  // State variables for hours array and selected hour
  const [hours, setHours] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(data?.fecha ? ISOStringToLocal(data.fecha).time : null);

  // State variables for end hours array and selected end hour
  const [endHours, setEndHours] = useState<string[]>([]);
  const [selectedEndHour, setSelectedEndHour] = useState<string | null>(data?.fin_tentativo ? ISOStringToLocal(data.fin_tentativo).time : null);

  // ------------------------------------------------------------------
  
  useEffect(() => {
    generateDates();
  }, []);
  
  // Date generator
  const generateDates = () => {
    const today = new Date();
    const generatedDates: Date[] = [];

    for (let i = 0; i < 120; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      if (i === 0) {
        const currentHour = today.getHours();
        if (currentHour >= 14) continue;
      }

      generatedDates.push(date);
    }

    setDates(generatedDates);
  };

  // Day formatter
  const formatDay = (date: Date) => date.getDate();

  // Weekday formatter
  const formatWeekday = (date: Date) => {
    const weekdays = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    return weekdays[date.getDay()];
  };  
  
  // ------------------------------------------------------------------
  
  useEffect(() => {
    if (selectedDate && confirmedDates && dentistID && data) {
      generateHours(confirmedDates, dentistID, selectedDate, selectedHour, data?.id);
    }
  }, [selectedDate, confirmedDates, dentistID, selectedHour, data]);

  // Hour generator
  const generateHours = (confirmedDates: ConfirmedDate[] | null, dentistID: string | null, selectedDate: Date, selectedHour: string | null, id: string | undefined, start = 8, end = 14, interval = 30) => {
    const pickedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1).toString().padStart(2, "0")}-${selectedDate.getDate().toString().padStart(2, "0")}`;
    const now = new Date();
    const isToday = selectedDate.toDateString() === now.toDateString();

    const filteredDates = confirmedDates?.filter((d) => {
      const confirmedDate = d.fecha.split("T")[0];
      return d.odontologo_id.toString() === dentistID && confirmedDate === pickedDate && d.id.toString() != id;
    });

    const generateTimeSlots = (checkBuffer: boolean) => {
      const slots: string[] = [];

      for (let h = start; h < end; h++) {
        for (let m = 0; m < 60; m += interval) {
          const hour = h % 12 === 0 ? 12 : h % 12;
          const meridian = h < 12 ? "AM" : "PM";
          const minutes = m.toString().padStart(2, "0");
          const fullDate = new Date(`${pickedDate}T${h.toString().padStart(2, "0")}:${minutes}:00-04:00`);

          if (isToday && fullDate <= now) continue;

          const isTaken = filteredDates?.some((d) => {
            const start = new Date(d.fecha);
            const end = new Date(d.fin_tentativo);
            const bufferedStart = new Date(start.getTime() - (checkBuffer ? 30 * 60 * 1000 : 0));
            return fullDate >= bufferedStart && fullDate < end;
          });

          if (!isTaken) slots.push(`${hour}:${minutes} ${meridian}`);
        }
      }

      return slots;
    };

    // Start
    const startHours = generateTimeSlots(true);
    setHours(startHours);

    // End
    if (selectedHour) {
      const selectedMinutes = parseHourToMinutes(selectedHour);
      const selectedTime = new Date(`${pickedDate}T${formatMinutesToTime(selectedMinutes)}:00-04:00`);

      // Slots libres
      const freeSlots = generateTimeSlots(false).filter((h) => {
        const minutes = parseHourToMinutes(h);
        if (minutes <= selectedMinutes) return false;

        const fullDate = new Date(`${pickedDate}T${formatMinutesToTime(minutes)}:00-04:00`);

        const isOverlapping = filteredDates?.some((d) => {
          const start = new Date(d.fecha);
          const end = new Date(d.fin_tentativo);
          return fullDate > start && fullDate <= end;
        });

        return !isOverlapping;
      });

      // Horas de inicio de citas posteriores
      const startTimesFromCitas = filteredDates
        ?.map((d) => {
          const start = new Date(d.fecha);
          if (start > selectedTime) {
            const h = start.getHours();
            const m = start.getMinutes();
            const hour = h % 12 === 0 ? 12 : h % 12;
            const meridian = h < 12 ? "AM" : "PM";
            const minutes = m.toString().padStart(2, "0");
            return `${hour}:${minutes} ${meridian}`;
          }
          return null;
        })
        .filter((h): h is string => h !== null);

      // Unificar y eliminar duplicados
      const endHours = Array.from(new Set([...freeSlots, ...(startTimesFromCitas ?? [])]));

      // Verificar si el rango hasta las 2:00 PM está libre
      const twoPM = new Date(`${pickedDate}T14:00:00-04:00`);
      const isRangeFree = !filteredDates?.some((d) => {
        const start = new Date(d.fecha);
        const end = new Date(d.fin_tentativo);
        return selectedTime < end && twoPM > start;
      });

      if (isRangeFree && parseHourToMinutes("2:00 PM") > selectedMinutes) {
        endHours.push("2:00 PM");
      }

      // Ordenar cronológicamente
      endHours.sort((a, b) => parseHourToMinutes(a) - parseHourToMinutes(b));

      setEndHours(endHours);
    } else {
      setEndHours([]);
    }
  };

  // ------------------------------------------------------------------

  // Date picker's handler
  const handleDateSelect = (date: Date) => {
    const isSameDate = selectedDate && selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth() && selectedDate.getFullYear() === date.getFullYear();

    if (formatWeekday(date) != "Dom") {
      const newDate = isSameDate ? null : date;
      setSelectedDate(newDate);

      if (isSameDate) {
        setHours([])
      }

      const formattedDate = newDate ? formatLocalDate(newDate) : null;

      onHandleChange(formattedDate, selectedHour, selectedEndHour);
    }
  };

  // Hour picker's handler
  const handleHourSelect = (hour: string) => {
    const newHour = hour === selectedHour ? null : hour;
    setSelectedHour(newHour);

    const formattedDate = selectedDate ? formatLocalDate(selectedDate) : null;

    onHandleChange(formattedDate, newHour, selectedEndHour);
  };

  //  End hour picker's handler
  const handleEndHourSelect = (hour: string) => {
    const newHour = hour === selectedEndHour ? null : hour;
    setSelectedEndHour(newHour);

    const formattedDate = selectedDate ? formatLocalDate(selectedDate) : null;

    onHandleChange(formattedDate, selectedHour, newHour);
  };

  return (
    <section className="space-y-6 max-w-[600px] mx-auto">
      <div className="justify-center overflow-hidden space-y-4">
        <div className="flex justify-between items-center px-1.5">
          <span className="text-sm text-gray-800 font-semibold">
            {(selectedDate ?? new Date()).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', })}
          </span>

          <div className="flex gap-2">
            <button type="button" className="w-fit h-fit transform text-gray-300 text-2xl rounded-full cursor-pointer" onClick={() => document.querySelector('.scroll-container')?.scrollBy({ left: -240, behavior: 'smooth' })}>
              <PrevArrow></PrevArrow>
            </button>
            
            <button type="button" className="w-fit h-fit transform text-gray-300 text-2xl rounded-full cursor-pointer" onClick={() => document.querySelector('.scroll-container')?.scrollBy({ left: 240, behavior: 'smooth' })}>
              <NextArrow></NextArrow>
            </button>
          </div>   
        </div>

        <div className="flex justify-center items-center">
          <div className="flex gap-3 overflow-hidden scroll-container scroll-smooth max-w-[600px]">
            {dates.map((date, index) => {
              const isSelected = selectedDate && selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth() && selectedDate.getFullYear() === date.getFullYear();

              return (
                <div key={index} id={`date-${index}`} className={`flex flex-col items-center justify-center cursor-pointer ${ isSelected ? 'font-semibold' : '' }`} onClick={() => handleDateSelect(date)}>
                  <div className={`flex w-12 h-12 rounded-full justify-center items-center ${ isSelected ? "bg-blue-600 text-white" : "" } ${ formatWeekday(date) === "Dom" ? "bg-gray-300" : "" } ${ !isSelected && formatWeekday(date) != "Dom" ? "bg-gray-100 text-gray-800 border-3 border-gray-300 hover:bg-gray-300" : ""}`}>
                    {formatDay(date)}
                  </div>
                  <span className="text-xs text-gray-500 my-1">
                    {formatWeekday(date)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedDate && (      
        <div className="flex flex-col mt-12 gap-6">
          <span className="block text-gray-800 text-base font-semibold">Hora de inicio *</span>
          <div className="grid md:grid-cols-4 gap-2">
              {hours.map((hour, index) => {
                return (
                  <div key={index}>
                    <Button key={index} type="button" className={`w-full ${hour === selectedHour ? "border-blue-600" : "border-gray-200"} bg-white border-3 rounded-full shadow-none py-1`} onClick={() => handleHourSelect(hour)}>     
                      <span className="text-sm">{hour}</span>
                    </Button>
                  </div>
                )
              })}
          </div>
        </div>
      )}
      
      {selectedDate && (endHours.length > 0) && (
        <div className="flex flex-col mt-12 gap-6">
          <span className="block text-gray-800 text-base font-semibold">Hora de finalización *</span>
          <div className="grid md:grid-cols-4 gap-2">
              {endHours.map((hour, index) => {
                return (
                  <div key={index}>
                    <Button key={index} type="button" className={`w-full ${hour === selectedEndHour ? "border-blue-600" : "border-gray-200"} bg-white border-3 rounded-full shadow-none py-1`} onClick={() => handleEndHourSelect(hour)}>     
                      <span className="text-sm">{hour}</span>
                    </Button>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Calendar;