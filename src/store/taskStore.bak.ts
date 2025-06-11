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

      selectTask: (task) => set({ selectedTask: task }),      // Keep track of fetch attempts and error state
      fetchTasks: (() => {
        // Closure variables to maintain state between function calls
        let retryCount = 0;
        let hasShownError = false;
        let errorState = null;
        
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
            
            // Fixed query to use correct foreign key relationship as suggested by the error
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

            if (error) throw error;

            const formattedTasks = tasks.map((task: any) => ({
              ...task,
              createdAt: new Date(task.created_at),
              dueDate: task.due_date ? new Date(task.due_date) : null,
              completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
            }));

            // Success! Reset error states
            errorState = null;
            retryCount = 0;
            hasShownError = false;
            
            set({ tasks: formattedTasks });
            return formattedTasks;
          } catch (error) {
            console.error('Error fetching tasks:', error);
            
            // Increment retry count
            retryCount++;
            errorState = error;
            
            // Only show toast once            if (!hasShownError) {
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

          const formattedTasks = tasks.map((task: any) => ({
            ...task,
            createdAt: new Date(task.created_at),
            dueDate: task.due_date ? new Date(task.due_date) : null,
            completedAt: task.completed_at ? new Date(task.completed_at) : undefined,
          }));

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
            taskId: comment.task_id,
            content: comment.content,
            createdAt: new Date(comment.created_at),
            user: {
              id: comment.users.id,
              email: comment.users.email,
              name: comment.users.name,
              avatarUrl: comment.users.avatar_url,
            },
            mentions: comment.mentions || [],
          }));

          set(state => ({
            comments: {
              ...state.comments,
              [taskId]: formattedComments
            }
          }));
        } catch (error) {
          console.error('Error fetching comments:', error);
        }
      },

      addComment: async (taskId, content, mentions) => {
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
              created_at: new Date().toISOString()
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

          if (error) throw error;          const formattedComment: TaskComment = {
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

          set(state => ({
            comments: {
              ...state.comments,
              [taskId]: [...(state.comments[taskId] || []), formattedComment]
            }
          }));        } catch (error) {
          console.error('Error adding comment:', error);
          toast.error(error instanceof Error ? error.message : 'Failed to add comment');
          throw error;
        }
      },

      assignTask: async (taskId, userId) => {
        try {
          const isValid = await useUserStore.getState().validateSession();
          if (!isValid) {
            throw new Error('User session expired');
          }

          const task = get().tasks.find(t => t.id === taskId);
          if (!task) {
            throw new Error('Task not found');
          }

          // Update task assignment
          const { error: updateError } = await supabase
            .from('tasks')
            .update({ 
              assigned_to: userId,
              updated_at: new Date().toISOString()
            })
            .eq('id', taskId);

          if (updateError) throw updateError;

          // Update local state
          set(state => ({
            tasks: state.tasks.map(t =>
              t.id === taskId ? { 
                ...t, 
                assignedTo: userId,
                lastUpdated: new Date()
              } : t
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
          // First check if user exists and get their ID
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

          // Check if share already exists
          const { data: existingShare } = await supabase
            .from('task_shares')
            .select('*')
            .eq('task_id', taskId)
            .eq('user_id', userData.id)
            .single();

          if (existingShare) {
            throw new Error(`Task is already shared with ${email}`);
          }

          // Insert share record
          const { error } = await supabase
            .from('task_shares')
            .insert([{
              task_id: taskId,
              user_id: userData.id,
              role
            }]);

          if (error) {
            if (error.code === '23505') { // Unique violation
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
      name: 'task-store',
    }
  )
);