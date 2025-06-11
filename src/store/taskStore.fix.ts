import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, TaskComment } from '../types';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';
import toast from 'react-hot-toast';

interface TaskStore {
  tasks: Task[];
  comments: { [taskId: string]: TaskComment[] };
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

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      comments: {},
      selectedTask: null,

      selectTask: (task) => set({ selectedTask: task }),

      // Improved fetchTasks function with retry limiting and error handling
      fetchTasks: (() => {
        // Closure variables to maintain state between function calls
        let retryCount = 0;
        let hasShownError = false;
        
        // Return the actual function
        return async () => {
          try {
            // If we've reached max retries, don't try again
            if (retryCount >= 3) {
              console.log('Max retry attempts reached for task fetching');
              return [];
            }
            
            // Validate session before making any requests
            const user = useUserStore.getState().user;
            
            // Check if user exists before validating session
            if (!user || !user.id) {
              console.log('No user found in store, skipping task fetch');
              return [];
            }
            
            const isValid = await useUserStore.getState().validateSession();
            if (!isValid) {
              console.log('User session invalid, skipping task fetch');
              return [];
            }

            // Get user ID once to avoid multiple calls
            const userId = useUserStore.getState().user.id;
            
            // Query to fetch tasks
            const { data: tasks, error } = await supabase
              .from('tasks')
              .select(`
                *,
                team_member_users!tasks_team_id_fkey (
                  team_id,
                  role
                )
              `)
              .or(`created_by.eq.${userId},assigned_to.eq.${userId},team_id.is.not.null`);
            
            if (error) {
              // Fallback to simple created_by query if OR filter fails
              console.warn('Primary task OR filter failed, falling back to simple fetch:', error);
              const { data: fallbackTasks, error: fallbackError } = await supabase
                .from('tasks')
                .select('*')
                .eq('created_by', userId);
              if (!fallbackError && fallbackTasks) {
                const formattedTasks = fallbackTasks.map((task: any) => ({ ...task, createdAt: new Date(task.created_at) }));
                set({ tasks: formattedTasks });
                return formattedTasks;
              }
              // If fallback also errors, throw original
              throw error;
            }

            // Safely parse dates with error handling
            const formattedTasks = tasks.map((task: any) => {
              // Safely parse dates with error handling
              let createdAt = null;
              let dueDate = null;
              let completedAt = undefined;

              try {
                // Only create Date objects if the values are valid strings
                if (task.created_at && typeof task.created_at === 'string') {
                  createdAt = new Date(task.created_at);
                  // Validate that the date is valid
                  if (isNaN(createdAt.getTime())) {
                    console.warn(`Invalid created_at date for task ${task.id}: ${task.created_at}`);
                    createdAt = new Date(); // Fallback to current date
                  }
                } else {
                  createdAt = new Date(); // Default to current date if missing
                }
                
                if (task.due_date && typeof task.due_date === 'string') {
                  dueDate = new Date(task.due_date);
                  if (isNaN(dueDate.getTime())) {
                    console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
                    dueDate = null;
                  }
                }
                
                if (task.completed_at && typeof task.completed_at === 'string') {
                  completedAt = new Date(task.completed_at);
                  if (isNaN(completedAt.getTime())) {
                    console.warn(`Invalid completed_at date for task ${task.id}: ${task.completed_at}`);
                    completedAt = undefined;
                  }
                }
              } catch (error) {
                console.error('Error parsing task dates:', error);
              }

              return {
                ...task,
                createdAt,
                dueDate,
                completedAt
              };
            });

            // Success! Reset error states
            retryCount = 0;
            hasShownError = false;
            
            set({ tasks: formattedTasks });
            return formattedTasks;
          } catch (error) {
            console.error('Error fetching tasks:', error);
            
            // Increment retry count
            retryCount++;
            
            // Only show toast once
            if (!hasShownError) {
              toast.error(`Failed to fetch tasks${retryCount > 1 ? ` (attempt ${retryCount}/3)` : ''}`);
              hasShownError = true;
            }
            
            return [];
          }
        };
      })(),

      fetchTeamTasks: async (teamId: string) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const { data: tasks, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('team_id', teamId);

          if (error) throw error;

          // Safely parse dates with error handling
          const formattedTasks = tasks.map((task: any) => {
            // Safely parse dates with error handling
            let createdAt = null;
            let dueDate = null;
            let completedAt = undefined;

            try {
              // Only create Date objects if the values are valid strings
              if (task.created_at && typeof task.created_at === 'string') {
                createdAt = new Date(task.created_at);
                if (isNaN(createdAt.getTime())) {
                  console.warn(`Invalid created_at date for task ${task.id}: ${task.created_at}`);
                  createdAt = new Date();
                }
              } else {
                createdAt = new Date();
              }
              
              if (task.due_date && typeof task.due_date === 'string') {
                dueDate = new Date(task.due_date);
                if (isNaN(dueDate.getTime())) {
                  console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
                  dueDate = null;
                }
              }
              
              if (task.completed_at && typeof task.completed_at === 'string') {
                completedAt = new Date(task.completed_at);
                if (isNaN(completedAt.getTime())) {
                  console.warn(`Invalid completed_at date for task ${task.id}: ${task.completed_at}`);
                  completedAt = undefined;
                }
              }
            } catch (error) {
              console.error('Error parsing task dates:', error);
            }

            return {
              ...task,
              createdAt,
              dueDate,
              completedAt
            };
          });

          set(state => ({
            tasks: [...state.tasks.filter(t => t.teamId !== teamId), ...formattedTasks]
          }));
        } catch (error) {
          console.error('Error fetching team tasks:', error);
          toast.error('Failed to fetch team tasks');
          throw error;
        }
      },

      addTask: async (task) => {
        try {
          // Validate session before creating tasks
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const user = useUserStore.getState().user;
          const newTask = {
            title: task.title,
            description: task.description || '',
            due_date: task.dueDate?.toISOString(),
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            category: task.category || 'personal',
            team_id: task.teamId,
            completed: false,
            created_at: new Date().toISOString(),
            created_by: user.id,
            assigned_to: task.assignedTo,
          };

          const { data, error } = await supabase
            .from('tasks')
            .insert([newTask])
            .select()
            .single();

          if (error) throw error;

          const formattedTask: Task = {
            ...data,
            createdAt: new Date(data.created_at),
            dueDate: data.due_date ? new Date(data.due_date) : null,
          };

          set(state => ({
            tasks: [formattedTask, ...state.tasks]
          }));
          
          toast.success('Task created successfully');
        } catch (error) {
          console.error('Error adding task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to create task');
          throw error;
        }
      },

      deleteTask: async (id) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.filter(t => t.id !== id)
          }));
          
          toast.success('Task deleted successfully');
        } catch (error) {
          console.error('Error deleting task:', error);
          toast.error('Failed to delete task');
          throw error;
        }
      },

      toggleTask: async (id) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const task = get().tasks.find(t => t.id === id);
          if (!task) return;

          const updates = {
            completed: !task.completed,
            completed_at: !task.completed ? new Date().toISOString() : null
          };

          const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.map(t =>
              t.id === id
                ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
                : t
            )
          }));
        } catch (error) {
          console.error('Error toggling task:', error);
          toast.error('Failed to update task');
          throw error;
        }
      },

      updateTask: async (id, updates) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const dbUpdates = {
            ...updates,
            due_date: updates.dueDate?.toISOString(),
            updated_at: new Date().toISOString()
          };

          delete dbUpdates.dueDate;
          delete dbUpdates.createdAt;
          delete dbUpdates.completedAt;

          const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.map(t =>
              t.id === id ? { ...t, ...updates } : t
            )
          }));
          
          toast.success('Task updated successfully');
        } catch (error) {
          console.error('Error updating task:', error);
          toast.error('Failed to update task');
          throw error;
        }
      },

      fetchComments: async (taskId) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const { data: comments, error } = await supabase
            .from('task_comments')
            .select(`
              *,
              users (
                id,
                name,
                email,
                avatar_url
              )
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          const formattedComments = comments.map((comment: any) => ({
            id: comment.id,
            taskId: comment.task_id,
            content: comment.content,
            createdAt: new Date(comment.created_at),
            user: {
              id: comment.users.id,
              name: comment.users.name,
              email: comment.users.email,
              avatarUrl: comment.users.avatar_url
            },
            mentions: comment.mentions || []
          }));

          set(state => ({
            comments: {
              ...state.comments,
              [taskId]: formattedComments
            }
          }));
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast.error('Failed to fetch comments');
          throw error;
        }
      },

      addComment: async (taskId, content, mentions = []) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const user = useUserStore.getState().user;

          const { data, error } = await supabase
            .from('task_comments')
            .insert({
              task_id: taskId,
              user_id: user.id,
              content,
              mentions,
              created_at: new Date().toISOString()
            })
            .select(`
              *,
              users (
                id,
                name,
                email,
                avatar_url
              )
            `)
            .single();

          if (error) throw error;

          const newComment = {
            id: data.id,
            taskId: data.task_id,
            content: data.content,
            createdAt: new Date(data.created_at),
            user: {
              id: data.users.id,
              name: data.users.name,
              email: data.users.email,
              avatarUrl: data.users.avatar_url
            },
            mentions: data.mentions || []
          };

          set(state => ({
            comments: {
              ...state.comments,
              [taskId]: [...(state.comments[taskId] || []), newComment]
            }
          }));

          toast.success('Comment added');
        } catch (error) {
          console.error('Error adding comment:', error);
          toast.error('Failed to add comment');
          throw error;
        }
      },

      assignTask: async (taskId, userId) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const { error } = await supabase
            .from('tasks')
            .update({ assigned_to: userId })
            .eq('id', taskId);

          if (error) throw error;

          set(state => ({
            tasks: state.tasks.map(t =>
              t.id === taskId ? { ...t, assignedTo: userId } : t
            )
          }));

          toast.success('Task assigned successfully');
        } catch (error) {
          console.error('Error assigning task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to assign task');
          throw error;
        }
      },

      shareTask: async (taskId, email, role) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          // First check if user exists and get their ID
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, name, email')
            .eq('email', email)
            .single();

          if
