import { Task, TaskComment } from '../types';

class LocalStorage {
  private getItem<T>(key: string): T | null {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  getTasks(): Task[] {
    return this.getItem<Task[]>('tasks') || [];
  }

  saveTasks(tasks: Task[]): void {
    this.setItem('tasks', tasks);
  }

  getComments(taskId: string): TaskComment[] {
    const allComments = this.getItem<Record<string, TaskComment[]>>('comments') || {};
    return allComments[taskId] || [];
  }

  saveComments(taskId: string, comments: TaskComment[]): void {
    const allComments = this.getItem<Record<string, TaskComment[]>>('comments') || {};
    allComments[taskId] = comments;
    this.setItem('comments', allComments);
  }

  getUser() {
    return this.getItem('user');
  }

  saveUser(user: any) {
    this.setItem('user', user);
  }

  clearUser() {
    localStorage.removeItem('user');
  }
}

export const storage = new LocalStorage();