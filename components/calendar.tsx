import React, { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

interface Event {
  id: string;
  title: string;
  start: string;
  end: string;
}

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: 'Consulta de Pedro Pérez', start: '2025-06-11T10:00:00', end: '2025-06-11T11:00:00' },
    { id: '2', title: 'Reconstrucción de Alejandro León', start: '2025-06-15T14:30:00', end: '2025-06-15T17:00:00' },
    { id: '3', title: 'Tratamiento de Conducto de Luis López', start: '2025-06-20T09:00:00', end: '2025-06-20T12:00:00' }
  ]);

  const today = new Date().toISOString().split("T")[0];

  const filteredEvents = events.filter(event => event.start.split("T")[0] === today);


  return (
    <div style={{ display: 'flex' }}>

      {/* Barra lateral con eventos próximos */}
      <div style={{ width: '20vw', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h3>Próximos Eventos</h3>
        {filteredEvents.map(event => (
            <div key={event.id}>
              <strong>{event.title}:</strong> {event.start.split("T")[1].slice(0, 5)} - {event.end.split("T")[1].slice(0, 5)}
            </div>
        ))}
      </div>

      {/* Calendario */}
      <div style={{ flex: 1, padding: '10px' }}>
        <FullCalendar
          locale="es"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
          events={events}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
            prev: '<',
            next: '>'
          }}
          eventContent={(arg) => (
            <div style={{ 
              fontSize: "0.9rem", 
              width: "100%", 
              height: "100%", 
              display: "flex",  
              overflow: "hidden", 
              textAlign: "center",
              whiteSpace: "nowrap"
            }}>
              {arg.event.title}
            </div>
          )}
        />
      </div>
    </div>
  );
};

export default Calendar;
