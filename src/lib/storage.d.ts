import { Task, TaskComment } from '../types';
declare class LocalStorage {
    private getItem;
    private setItem;
    getTasks(): Task[];
    saveTasks(tasks: Task[]): void;
    getComments(taskId: string): TaskComment[];
    saveComments(taskId: string, comments: TaskComment[]): void;
    getUser(): unknown;
    saveUser(user: any): void;
    clearUser(): void;
}
export declare const storage: LocalStorage;
export {};
