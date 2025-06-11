// Import missing dependencies
import { useUserStore } from './userStore';
import { supabase } from '../lib/supabase'; // Fixed import path
import toast from 'react-hot-toast';
import { Task, TaskComment } from '../types';
import create from 'zustand';
import { persist } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set: any, get: any) => ({
      tasks: [] as Task[],
      comments: {} as Record<string, TaskComment[]>,
      selectedTask: null as Task | null,

      selectTask: (task: Task) => set({ selectedTask: task }),

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
              .select('*')
              .or(`created_by.eq.${userId},assigned_to.eq.${userId},team_id.not.is.null`);

            if (error) throw error;

            const formattedTasks = tasks.map((task: any) => ({
              ...task,
              createdAt: task.created_at ? new Date(task.created_at) : new Date(),
              dueDate: task.due_date ? new Date(task.due_date) : null,
              completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
            }));

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

          const { data: tasks, error }: { data: Task[] | null; error: any } = await supabase
            .from('tasks')
            .select('*')
            .eq('team_id', teamId);

          if (error) throw error;

          const formattedTasks = tasks?.map((task) => ({
            ...task,
            created_at: task.created_at ? new Date(task.created_at) : new Date(),
            due_date: task.due_date ? new Date(task.due_date) : null,
            completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
          })) || [];

          set((state: any) => ({
            tasks: [...state.tasks.filter((t: Task) => t.teamId !== teamId), ...formattedTasks],
          }));
        } catch (error) {
          console.error('Error fetching team tasks:', error);
          toast.error('Failed to fetch team tasks');
          throw error;
        }
      },      // Fixed addTask function with proper error handling
      addTask: async (task: Task) => {
        try {
          console.log('Adding task:', task);

          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const user = useUserStore.getState().user;
          console.log('Current user:', user);

          if (!user || !user.id) {
            throw new Error('User not authenticated');
          }

          // Format the task data correctly for Supabase
          const taskData = {
            title: task.title,
            description: task.description || '',
            created_by: user.id,
            created_at: new Date().toISOString(),
            due_date: task.dueDate ? new Date(task.dueDate).toISOString() : null,
            status: task.status || 'todo',
            priority: task.priority || 'medium',
            category: task.category || null
          };

          console.log('Sending task data:', taskData);

          const { data, error } = await supabase
            .from('tasks')
            .insert([taskData])
            .select();

          console.log('Supabase response:', { data, error });

          if (error) {
            throw error;
          }

          if (!data || data.length === 0) {
            throw new Error('No task data returned');
          }

          set((state: any) => ({
            tasks: [...state.tasks, data[0]],
          }));

          toast.success('Task created successfully');
        } catch (error) {
          console.error('Error adding task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to create task');
        }
      },

      deleteTask: async (id: string) => {
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

          set((state: any) => ({
            tasks: state.tasks.filter((t: Task) => t.id !== id),
          }));

          toast.success('Task deleted successfully');
        } catch (error) {
          console.error('Error deleting task:', error);
          toast.error('Failed to delete task');
          throw error;
        }
      },

      toggleTask: async (id: string) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const task = get().tasks.find((t: Task) => t.id === id);
          if (!task) return;

          const updates = {
            completed: !task.completed,
            completed_at: !task.completed ? new Date().toISOString() : null,
          };

          const { error } = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id);

          if (error) throw error;

          set((state: any) => ({
            tasks: state.tasks.map((t: Task) =>
              t.id === id
                ? { ...t, completed: !t.completed, completedAt: !t.completed ? new Date() : undefined }
                : t
            ),
          }));
        } catch (error) {
          console.error('Error toggling task:', error);
          toast.error('Failed to update task');
          throw error;
        }
      },

      updateTask: async (id: string, updates: Partial<Task>) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const dbUpdates = {
            ...updates,
            due_date: updates.due_date ? new Date(updates.due_date).toISOString() : null,
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabase
            .from('tasks')
            .update(dbUpdates)
            .eq('id', id);

          if (error) throw error;

          set((state: any) => ({
            tasks: state.tasks.map((t: Task) =>
              t.id === id ? { ...t, ...updates } : t
            ),
          }));

          toast.success('Task updated successfully');
        } catch (error) {
          console.error('Error updating task:', error);
          toast.error('Failed to update task');
          throw error;
        }
      },

      fetchComments: async (taskId: string) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const { data: comments, error } = await supabase
            .from('task_comments')
            .select(`
              *,
              users:user_id (
                id,
                email,
                name,
                avatar_url
              )
            `)
            .eq('task_id', taskId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          const formattedComments = comments.map((comment: any) => ({
            id: comment.id,
            task_id: comment.task_id,
            content: comment.content,
            created_at: new Date(comment.created_at),
            user: {
              id: comment.users.id,
              email: comment.users.email,
              name: comment.users.name,
              avatar_url: comment.users.avatar_url,
            },
            mentions: comment.mentions || [],
          }));

          set((state: any) => ({
            comments: {
              ...state.comments,
              [taskId]: formattedComments,
            },
          }));
        } catch (error) {
          console.error('Error fetching comments:', error);
          toast.error('Failed to fetch comments');
          throw error;
        }
      },

      addComment: async (taskId: string, content: string, mentions: string[]) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const user = useUserStore.getState().user;
          const { data, error } = await supabase
            .from('task_comments')
            .insert([{
              task_id: taskId,
              content,
              mentions,
              user_id: user.id,
              created_at: new Date().toISOString(),
            }])
            .select(`
              *,
              users:user_id (
                id,
                email,
                name,
                avatar_url
              )
            `)
            .single();

          if (error) throw error;

          const formattedComment: TaskComment = {
            id: data.id,
            taskId: data.task_id,
            content: data.content,
            createdAt: new Date(data.created_at),
            user: {
              id: data.users.id,
              email: data.users.email,
              name: data.users.name,
              avatarUrl: data.users.avatar_url,
            },
            mentions: data.mentions || [],
          };

          set((state: any) => ({
            comments: {
              ...state.comments,
              [taskId]: [...(state.comments[taskId] || []), formattedComment],
            },
          }));
        } catch (error) {
          console.error('Error adding comment:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to add comment');
          throw error;
        }
      },

      assignTask: async (taskId: string, userId: string) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const task = get().tasks.find((t: Task) => t.id === taskId);
          if (!task) {
            throw new Error('Task not found');
          }

          const { error: updateError } = await supabase
            .from('tasks')
            .update({
              assigned_to: userId,
              updated_at: new Date().toISOString(),
            })
            .eq('id', taskId);

          if (updateError) throw updateError;

          set((state: any) => ({
            tasks: state.tasks.map((t: Task) =>
              t.id === taskId
                ? {
                  ...t,
                  assignedTo: userId,
                  lastUpdated: new Date(),
                }
                : t
            ),
          }));

          toast.success('Task assigned successfully');
        } catch (error) {
          console.error('Error assigning task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to assign task');
          throw error;
        }
      },

      shareTask: async (taskId: string, email: string, role: string) => {
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('id, email, name')
            .eq('email', email)
            .single();

          if (userError) {
            if (userError.code === 'PGRST116') {
              throw new Error(`No user found with email ${email}`);
            }
            throw userError;
          }

          const { data: existingShare } = await supabase
            .from('task_shares')
            .select('*')
            .eq('task_id', taskId)
            .eq('user_id', userData.id)
            .single();

          if (existingShare) {
            throw new Error(`Task is already shared with ${email}`);
          }

          const { error } = await supabase
            .from('task_shares')
            .insert([{
              task_id: taskId,
              user_id: userData.id,
              role,
            }]);

          if (error) {
            if (error.code === '23505') {
              throw new Error(`Task is already shared with ${email}`);
            }
            throw error;
          }

          toast.success(`Task shared with ${userData.name || email}`);
        } catch (error) {
          console.error('Error sharing task:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to share task');
          throw error;
        }
      },
    }),
    {
      name: 'task-store', // unique name for localStorage
    }
  )
);

export { useTaskStore };
