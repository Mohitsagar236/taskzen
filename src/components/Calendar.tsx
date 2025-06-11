import React from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import { useTaskStore } from '../store/taskStore';
import { Button } from './ui/Button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const CustomToolbar = ({ onNavigate, label }: any) => (
  <div className="flex items-center justify-between mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm" onClick={() => onNavigate('PREV')}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onNavigate('NEXT')}>
        <ChevronRight className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => onNavigate('TODAY')}>
        Today
      </Button>
    </div>
    
    <h2 className="text-xl font-semibold dark:text-white flex items-center">
      <CalendarIcon className="w-5 h-5 mr-2" />
      {label}
    </h2>
  </div>
);

export function Calendar() {
  const tasks = useTaskStore((state) => state.tasks);

  const events = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    start: task.dueDate ? new Date(task.dueDate) : new Date(),
    end: task.dueDate ? new Date(task.dueDate) : new Date(),
    allDay: true,
    resource: {
      priority: task.priority,
      completed: task.completed,
    },
  }));

  const eventStyleGetter = (event: any) => {
    const isCompleted = event.resource.completed;
    const priority = event.resource.priority;

    const baseStyle = {
      className: `
        rounded-lg border-l-4 shadow-sm transition-all
        ${isCompleted ? 'opacity-60' : ''}
        ${priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/30' :
          priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' :
          'border-blue-500 bg-blue-50 dark:bg-blue-900/30'}
      `,
    };

    return baseStyle;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        components={{
          toolbar: CustomToolbar,
        }}
        className="p-4"
      />
    </div>
  );
}