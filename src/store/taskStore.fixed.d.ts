import { Task, TaskComment } from '../types';
interface TaskStore {
    tasks: Task[];
    comments: {
        [taskId: string]: TaskComment[];
    };
    selectedTask: Task | null;
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    toggleTask: (id: string) => Promise<void>;
    updateTask: (id: string, task: Partial<Task>) => Promise<void>;
    fetchTasks: () => Promise<Task[]>;
    fetchTeamTasks: (teamId: string) => Promise<void>;
    fetchComments: (taskId: string) => Promise<void>;
    addComment: (taskId: string, content: string, mentions: string[]) => Promise<void>;
    selectTask: (task: Task | null) => void;
    assignTask: (taskId: string, userId: string) => Promise<void>;
    shareTask: (taskId: string, email: string, role: 'view' | 'edit') => Promise<void>;
}
export declare const useTaskStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<TaskStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<TaskStore, TaskStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: TaskStore) => void) => () => void;
        onFinishHydration: (fn: (state: TaskStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<TaskStore, TaskStore>>;
    };
}>;
export {};
