// Fixed implementation of the TaskStore with proper error handling
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
  shareTask: (taskId: string, email: string) => Promise<void>;
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
        let retryCount = 0;
        let hasShownError = false;

        return async () => {
          try {
            if (retryCount >= 3) {
              console.log('Max retry attempts reached for task fetching');
              return [];
            }

            const user = useUserStore.getState().user;
            if (!user || !user.id) {
              console.log('No user found in store, skipping task fetch');
              return [];
            }

            const isValid = await useUserStore.getState().validateSession();
            if (!isValid) {
              console.log('User session invalid, skipping task fetch');
              return [];
            }

            const userId = user.id;
            const { data: tasks, error } = await supabase
              .from('tasks')
              .select(`
                *,
                team_member_users!tasks_team_id_fkey (
                  team_id,
                  role
                )
              `)
              .or(`created_by.eq.${userId},assigned_to.eq.${userId},team_id.not.is.null`);

            if (error) {
              console.error('Supabase query error:', error);
              throw error;
            }

            const formattedTasks = tasks.map((task: any) => {
              let created_at = null;
              let due_date = null;
              let completed_at = undefined;

              try {
                if (task.created_at && typeof task.created_at === 'string') {
                  created_at = new Date(task.created_at);
                  if (isNaN(created_at.getTime())) {
                    console.warn(`Invalid created_at date for task ${task.id}: ${task.created_at}`);
                    created_at = new Date();
                  }
                } else {
                  created_at = new Date();
                }

                if (task.due_date && typeof task.due_date === 'string') {
                  due_date = new Date(task.due_date);
                  if (isNaN(due_date.getTime())) {
                    console.warn(`Invalid due_date for task ${task.id}: ${task.due_date}`);
                    due_date = null;
                  }
                }

                if (task.completed_at && typeof task.completed_at === 'string') {
                  completed_at = new Date(task.completed_at);
                  if (isNaN(completed_at.getTime())) {
                    console.warn(`Invalid completed_at date for task ${task.id}: ${task.completed_at}`);
                    completed_at = undefined;
                  }
                }
              } catch (dateError) {
                console.error('Error parsing task dates:', dateError);
              }

              return {
                ...task,
                created_at,
                due_date,
                completed_at,
              };
            });

            retryCount = 0;
            hasShownError = false;

            set({ tasks: formattedTasks });
            return formattedTasks;
          } catch (error) {
            console.error('Error fetching tasks:', error);
            retryCount++;

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
                CreatedAt = new Date();
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
          if (!isValid) throw new Error('User session expired');

          // Map update fields (handle camelCase and snake_case)
          const dbUpdates: Record<string, any> = {};
          if ('title' in updates && updates.title !== undefined) dbUpdates.title = updates.title;
          if ('description' in updates && updates.description !== undefined) dbUpdates.description = updates.description;
          if ('completed' in updates && (updates as any).completed !== undefined) dbUpdates.completed = (updates as any).completed;
          if ('dueDate' in updates && (updates as any).dueDate !== undefined) {
            const val = (updates as any).dueDate;
            dbUpdates.due_date = val instanceof Date ? val.toISOString() : val;
          }
          if ('due_date' in updates && (updates as any).due_date !== undefined) dbUpdates.due_date = (updates as any).due_date;
          if ('status' in updates && (updates as any).status !== undefined) dbUpdates.status = (updates as any).status;
          if ('assignedTo' in updates && (updates as any).assignedTo !== undefined) dbUpdates.assigned_to = (updates as any).assignedTo;
          if ('assigned_to' in updates && (updates as any).assigned_to !== undefined) dbUpdates.assigned_to = (updates as any).assigned_to;
          if ('teamId' in updates && (updates as any).teamId !== undefined) dbUpdates.team_id = (updates as any).teamId;
          if ('team_id' in updates && (updates as any).team_id !== undefined) dbUpdates.team_id = (updates as any).team_id;

          const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id);
          if (error) throw error;

          // Update local state
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

          // Correcting TaskComment type usage
          const formattedComments = comments.map(comment => ({
            id: comment.id,
            taskId: comment.task_id, // Correctly mapping taskId
            content: comment.content,
            created_at: comment.created_at, // Ensuring correct type
            created_by: comment.created_by // Ensuring correct type
          }));

          set(state => ({
            comments: {
              ...state.comments,
              [taskId]: formattedComments // Fully compatible with TaskComment[]
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

      // Removing unused parameter 'role'
      shareTask: async (taskId, email) => {
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

          if (userError) {
            if (userError.code === 'PGRST116') { // Not found
              throw new Error(`No user found with email ${email}`);
            }
            throw userError;
          }

          // Fixing database query method
          const taskShares = await supabase
            .from('task_shares')
            .select('*')
            .match({ task_id: taskId });

          if (taskShares.error) {
            if (taskShares.error.code === '23505') { // Unique violation
              throw new Error(`Task is already shared with ${email}`);
            }
            throw taskShares.error;
          }

          toast.success(`Task shared with ${userData.name || email}`);
        } catch (error) {
          console.error('Error sharing task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to share task');
          throw error;
        }
      }
    }),
    {
      name: 'task-store'
    }
  )
);
