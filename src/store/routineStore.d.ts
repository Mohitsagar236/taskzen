import { TaskTemplate, Routine } from '../types';
interface RoutineStore {
    templates: TaskTemplate[];
    routines: Routine[];
    fetchTemplates: () => Promise<void>;
    fetchRoutines: () => Promise<void>;
    addTemplate: (template: Omit<TaskTemplate, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
    updateTemplate: (id: string, template: Partial<TaskTemplate>) => Promise<void>;
    deleteTemplate: (id: string) => Promise<void>;
    addRoutine: (routine: Omit<Routine, 'id' | 'userId' | 'createdAt' | 'lastRun'>) => Promise<void>;
    updateRoutine: (id: string, routine: Partial<Routine>) => Promise<void>;
    deleteRoutine: (id: string) => Promise<void>;
    executeRoutine: (routineId: string) => Promise<void>;
    checkAndExecuteRoutines: () => Promise<void>;
}
export declare const useRoutineStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<RoutineStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<RoutineStore, RoutineStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: RoutineStore) => void) => () => void;
        onFinishHydration: (fn: (state: RoutineStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<RoutineStore, RoutineStore>>;
    };
}>;
export {};
