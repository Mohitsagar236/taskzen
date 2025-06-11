import { Task } from '../types';
interface ExportStore {
    exportToPDF: (tasks: Task[]) => Promise<void>;
    exportToExcel: (tasks: Task[]) => Promise<void>;
}
export declare const useExportStore: import("zustand").UseBoundStore<import("zustand").StoreApi<ExportStore>>;
export {};
