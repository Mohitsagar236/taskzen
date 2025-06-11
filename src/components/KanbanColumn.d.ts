import { Task, TaskStatus } from '../types';
interface KanbanColumnProps {
    status: TaskStatus;
    tasks: Task[];
}
export declare function KanbanColumn({ status, tasks }: KanbanColumnProps): import("react/jsx-runtime").JSX.Element;
export {};
