import React from 'react';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { TaskStatus } from '../types';
import { useTaskStore } from '../store/taskStore';
import { KanbanColumn } from './KanbanColumn';
import { LayoutGrid, ListChecks, Clock, CheckCircle2 } from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; icon: any; color: string }[] = [
  { id: 'todo', label: 'To Do', icon: ListChecks, color: 'from-blue-500 to-blue-600' },
  { id: 'in_progress', label: 'In Progress', icon: Clock, color: 'from-yellow-500 to-yellow-600' },
  { id: 'review', label: 'Review', icon: LayoutGrid, color: 'from-purple-500 to-purple-600' },
  { id: 'done', label: 'Done', icon: CheckCircle2, color: 'from-green-500 to-green-600' }
];

export function KanbanBoard() {
  const { tasks, updateTask } = useTaskStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as TaskStatus;

    updateTask(taskId, { status: newStatus });
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {COLUMNS.map(({ id, label, icon: Icon, color }) => (
          <SortableContext
            key={id}
            items={tasks.filter((task) => task.status === id).map((t) => t.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="flex flex-col h-full">
              <div className={`bg-gradient-to-r ${color} p-4 rounded-t-xl text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-2" />
                    <h3 className="font-semibold">{label}</h3>
                  </div>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                    {tasks.filter((task) => task.status === id).length}
                  </span>
                </div>
              </div>
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 p-4 rounded-b-xl border border-t-0 border-gray-200 dark:border-gray-700">
                <KanbanColumn
                  status={id}
                  tasks={tasks.filter((task) => task.status === id)}
                />
              </div>
            </div>
          </SortableContext>
        ))}
      </div>
    </DndContext>
  );
}