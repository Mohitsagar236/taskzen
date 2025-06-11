import React, { useState, useCallback, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMinutes, isBefore, isAfter, startOfToday } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { Button } from './ui/Button';
import { Clock, Plus, Calendar as CalendarIcon, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import enUS from 'date-fns/locale/en-US';
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

interface TimeBlock {
  id: string;
  title: string;
  start: Date;
  end: Date;
  taskId?: string;
  project?: string;
  priority?: Task['priority'];
  isOverdue?: boolean;
}

const WORK_HOURS = {
  start: 6, // 6 AM
  end: 22, // 10 PM
};

const priorityColors = {
  high: 'bg-red-100 border-red-500 dark:bg-red-900/50',
  medium: 'bg-yellow-100 border-yellow-500 dark:bg-yellow-900/50',
  low: 'bg-blue-100 border-blue-500 dark:bg-blue-900/50',
};

export function AgendaView() {
  const { tasks, updateTask } = useTaskStore();
  const [view, setView] = useState<'week' | 'day'>('week');
  const [date, setDate] = useState(new Date());
  const [timeBlocks, setTimeBlocks] = useState<TimeBlock[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showGoogleSync, setShowGoogleSync] = useState(false);

  const events = useMemo(() => {
    const taskEvents = tasks
      .filter(task => task.dueDate)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: new Date(task.dueDate!),
        end: addMinutes(new Date(task.dueDate!), 30),
        taskId: task.id,
        project: task.category,
        priority: task.priority,
        isOverdue: isBefore(new Date(task.dueDate!), startOfToday()) && !task.completed,
      }));

    return [...taskEvents, ...timeBlocks];
  }, [tasks, timeBlocks]);

  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      if (!isCreating) return;

      const newBlock: TimeBlock = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New Task',
        start,
        end,
        priority: 'medium',
      };

      setTimeBlocks(prev => [...prev, newBlock]);
      setIsCreating(false);
    },
    [isCreating]
  );

  const handleEventResize = useCallback(
    ({ event, start, end }: any) => {
      if (event.taskId) {
        updateTask(event.taskId, { dueDate: start });
      } else {
        setTimeBlocks(prev =>
          prev.map(block =>
            block.id === event.id ? { ...block, start, end } : block
          )
        );
      }
    },
    [updateTask]
  );

  const handleEventDrop = useCallback(
    ({ event, start, end }: any) => {
      if (event.taskId) {
        updateTask(event.taskId, { dueDate: start });
      } else {
        setTimeBlocks(prev =>
          prev.map(block =>
            block.id === event.id ? { ...block, start, end } : block
          )
        );
      }
    },
    [updateTask]
  );

  const calculateProgress = useMemo(() => {
    const totalPlanned = events.length;
    const completed = tasks.filter(task => task.completed).length;
    return {
      planned: totalPlanned,
      completed,
      percentage: totalPlanned ? Math.round((completed / totalPlanned) * 100) : 0,
    };
  }, [events, tasks]);

  const eventStyleGetter = useCallback(
    (event: any) => {
      const isOverdue = event.isOverdue;
      const baseStyle = event.priority ? priorityColors[event.priority] : 'bg-gray-100 dark:bg-gray-700';
      
      return {
        className: `
          ${baseStyle}
          border-l-4
          rounded-lg
          shadow-sm
          transition-all
          ${isOverdue ? 'border-red-500' : ''}
          ${isBefore(new Date(event.start), new Date()) ? 'opacity-60' : ''}
        `,
      };
    },
    []
  );

  const CustomToolbar = ({ onNavigate, label }: any) => (
    <div className="flex items-center justify-between mb-4 p-2">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
        >
          Today
        </Button>
      </div>
      
      <h2 className="text-lg font-semibold dark:text-white">{label}</h2>
      
      <div className="flex items-center space-x-2">
        <Button
          variant={view === 'week' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setView('week')}
        >
          Week
        </Button>
        <Button
          variant={view === 'day' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setView('day')}
        >
          Day
        </Button>
        <Button
          variant={showGoogleSync ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setShowGoogleSync(!showGoogleSync)}
        >
          <CalendarIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-xl text-white">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <CalendarIcon className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Agenda</h2>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            variant={isCreating ? 'primary' : 'outline'}
            className="bg-white text-blue-600 hover:bg-blue-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isCreating ? 'Cancel' : 'Block Time'}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Planned</span>
              <Clock className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-2xl font-semibold">{calculateProgress.planned}</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Completed</span>
              <Clock className="w-5 h-5 text-green-200" />
            </div>
            <p className="text-2xl font-semibold">{calculateProgress.completed}</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm opacity-90">Progress</span>
              <Clock className="w-5 h-5 text-yellow-200" />
            </div>
            <p className="text-2xl font-semibold">{calculateProgress.percentage}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="h-[600px] relative">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            views={[Views.WEEK, Views.DAY]}
            selectable
            resizable
            draggable
            onSelectSlot={handleSelectSlot}
            onEventResize={handleEventResize}
            onEventDrop={handleEventDrop}
            min={new Date(0, 0, 0, WORK_HOURS.start, 0, 0)}
            max={new Date(0, 0, 0, WORK_HOURS.end, 0, 0)}
            eventPropGetter={eventStyleGetter}
            components={{
              toolbar: CustomToolbar,
            }}
            tooltipAccessor={event => `
              ${event.title}
              ${event.isOverdue ? '(Overdue!)' : ''}
              ${event.project ? `\nProject: ${event.project}` : ''}
              ${event.priority ? `\nPriority: ${event.priority}` : ''}
            `}
            className="rounded-lg shadow bg-white dark:bg-gray-800"
          />

          {isCreating && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-black text-white px-4 py-2 rounded-full text-sm">
                Click and drag to block time
              </div>
            </div>
          )}
        </div>

        {showGoogleSync && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold dark:text-white">Google Calendar Sync</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connect your Google Calendar to sync events
                </p>
              </div>
              <Button onClick={() => toast.success('Google Calendar connected!')}>
                Connect
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}