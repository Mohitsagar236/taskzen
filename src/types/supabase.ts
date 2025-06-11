export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          due_date: string | null
          reminder_at: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in_progress' | 'review' | 'done'
          category: string
          parent_task_id: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          reminder_at?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          category?: string
          parent_task_id?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          due_date?: string | null
          reminder_at?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'review' | 'done'
          category?: string
          parent_task_id?: string | null
          created_at?: string
          user_id?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
      task_tags: {
        Row: {
          task_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          task_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          task_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      task_recurrence: {
        Row: {
          id: string
          task_id: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          interval: number
          days_of_week: number[] | null
          day_of_month: number | null
          month_of_year: number | null
          start_date: string
          end_date: string | null
          last_generated_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          frequency: 'daily' | 'weekly' | 'monthly' | 'yearly'
          interval?: number
          days_of_week?: number[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          start_date: string
          end_date?: string | null
          last_generated_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          interval?: number
          days_of_week?: number[] | null
          day_of_month?: number | null
          month_of_year?: number | null
          start_date?: string
          end_date?: string | null
          last_generated_at?: string | null
          created_at?: string
        }
      }
      task_shares: {
        Row: {
          id: string
          task_id: string
          user_id: string
          permission: 'view' | 'edit'
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          permission: 'view' | 'edit'
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          permission?: 'view' | 'edit'
          created_at?: string
        }
      }
      task_assignments: {
        Row: {
          id: string
          task_id: string
          assigned_to: string
          assigned_by: string
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          assigned_to: string
          assigned_by: string
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          assigned_to?: string
          assigned_by?: string
          created_at?: string
        }
      }
      task_comments: {
        Row: {
          id: string
          task_id: string
          user_id: string
          content: string
          mentions: string[]
          created_at: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
          content: string
          mentions?: string[]
          created_at?: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
          content?: string
          mentions?: string[]
          created_at?: string
        }
      }
    }
  }
}