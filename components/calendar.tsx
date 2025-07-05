import React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

const Calendar: React.FC = () => {

  return (
    <div style={{ display: 'flex' }}>

      {/* Barra lateral con eventos próximos */}
      <div style={{ width: '20vw', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h3>Próximos Eventos</h3>
      </div>

      {/* Calendario */}
      <div style={{ flex: 1, padding: '10px' }}>
        <FullCalendar
          locale="es"
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          editable={true}
          selectable={true}
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
