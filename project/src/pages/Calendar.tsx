import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { useTaskStore } from '../store/taskStore';
import { Task } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import TaskForm from '../components/TaskForm';
import Modal from '../components/ui/Modal';

const Calendar: React.FC = () => {
  const { tasks } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = getDay(monthStart);
  
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.dueDate && 
      format(new Date(task.dueDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };
  
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setIsModalOpen(true);
  };
  
  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  return (
    <div className="p-6">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={nextMonth}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {weekdays.map(day => (
            <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-400 py-2">
              {day}
            </div>
          ))}
          
          {Array.from({ length: startDay }).map((_, index) => (
            <div key={`empty-${index}`} className="h-24 p-1 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800"></div>
          ))}
          
          {monthDays.map(day => {
            const dayTasks = getTasksForDate(day);
            const isToday = format(new Date(), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
            
            return (
              <div
                key={day.toString()}
                onClick={() => handleDateClick(day)}
                className={`h-24 p-1 border border-gray-200 dark:border-gray-800 overflow-hidden ${
                  isToday 
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' 
                    : 'bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800'
                } cursor-pointer transition-colors`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-sm font-medium ${
                    isToday ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                      {dayTasks.length}
                    </span>
                  )}
                </div>
                
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTaskClick(task);
                      }}
                      className={`text-xs p-1 rounded truncate ${
                        task.completed 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? "Edit Task" : `Add Task for ${selectedDate ? format(selectedDate, 'MMMM d, yyyy') : ''}`}
      >
        <TaskForm
          task={selectedTask || undefined}
          onClose={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
};

export default Calendar;