import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '../types';

interface KanbanTaskProps {
  task: Task;
}

export function KanbanTask({ task }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm cursor-move"
    >
      <h4 className="font-medium text-gray-900 dark:text-white">{task.title}</h4>
      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          {task.description}
        </p>
      )}
      <div className="flex items-center mt-2 space-x-2">
        {task.tags?.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-1 rounded-full text-xs text-white"
            style={{ backgroundColor: tag.color }}
          >
            {tag.name}
          </span>
        ))}
      </div>
    </div>
  );
}