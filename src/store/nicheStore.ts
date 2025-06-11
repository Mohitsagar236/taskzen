import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Octokit } from 'octokit';
import { supabase } from '../lib/supabase';
import { useUserStore } from './userStore';

interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade?: string;
}

interface Assignment {
  id: string;
  courseId: string;
  title: string;
  dueDate: Date;
  weight: number;
  grade?: number;
}

interface GitHubIssue {
  id: string;
  title: string;
  body: string;
  state: string;
  number: number;
  repository: string;
}

interface Client {
  id: string;
  name: string;
  email: string;
  rate: number;
}

interface Project {
  id: string;
  clientId: string;
  name: string;
  budget: number;
  startDate: Date;
  endDate?: Date;
}

interface Invoice {
  id: string;
  projectId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  dueDate: Date;
}

interface Team {
  id: string;
  name: string;
  members: TeamMember[];
}

interface TeamMember {
  id: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: Date;
}

interface Sprint {
  id: string;
  teamId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goals: string[];
}

interface NicheStore {
  // Student features
  courses: Course[];
  assignments: Assignment[];
  gpa: number;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
  updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  calculateGPA: () => number;

  // Developer features
  githubToken?: string;
  githubIssues: GitHubIssue[];
  setGitHubToken: (token: string) => void;
  syncGitHubIssues: () => Promise<void>;
  createGitHubIssue: (repo: string, title: string, body: string) => Promise<void>;

  // Freelancer features
  clients: Client[];
  projects: Project[];
  invoices: Invoice[];
  addClient: (client: Omit<Client, 'id'>) => Promise<void>;
  addProject: (project: Omit<Project, 'id'>) => Promise<void>;
  createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
  calculateEarnings: () => number;

  // Team features
  teams: Team[];
  sprints: Sprint[];
  createTeam: (name: string) => Promise<void>;
  addTeamMember: (teamId: string, userId: string, role: TeamMember['role']) => Promise<void>;
  createSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
}

export const useNicheStore = create<NicheStore>()(
  persist(
    (set, get) => ({
      // Initial state
      courses: [],
      assignments: [],
      gpa: 0,
      githubIssues: [],
      clients: [],
      projects: [],
      invoices: [],
      teams: [],
      sprints: [],

      // Student methods
      addCourse: async (course) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('courses')
          .insert([{ ...course, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          courses: [...state.courses, data],
        }));
      },

      updateCourse: async (id, course) => {
        const { error } = await supabase
          .from('courses')
          .update(course)
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          courses: state.courses.map(c =>
            c.id === id ? { ...c, ...course } : c
          ),
        }));

        // Recalculate GPA when grades change
        if (course.grade) {
          const gpa = get().calculateGPA();
          set({ gpa });
        }
      },

      addAssignment: async (assignment) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('assignments')
          .insert([{ ...assignment, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          assignments: [...state.assignments, data],
        }));
      },

      updateAssignment: async (id, assignment) => {
        const { error } = await supabase
          .from('assignments')
          .update(assignment)
          .eq('id', id);

        if (error) throw error;

        set(state => ({
          assignments: state.assignments.map(a =>
            a.id === id ? { ...a, ...assignment } : a
          ),
        }));
      },

      calculateGPA: () => {
        const courses = get().courses;
        const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
        const totalPoints = courses.reduce((sum, course) => {
          if (!course.grade) return sum;
          const gradePoints = {
            'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0,
          }[course.grade] || 0;
          return sum + (gradePoints * course.credits);
        }, 0);

        return totalCredits > 0 ? totalPoints / totalCredits : 0;
      },

      // Developer methods
      setGitHubToken: (token) => {
        set({ githubToken: token });
      },

      syncGitHubIssues: async () => {
        const token = get().githubToken;
        if (!token) throw new Error('GitHub token not set');

        const octokit = new Octokit({ auth: token });
        const { data } = await octokit.rest.issues.list({
          filter: 'assigned',
          state: 'open',
        });

        const issues = data.map(issue => ({
          id: issue.id.toString(),
          title: issue.title,
          body: issue.body || '',
          state: issue.state,
          number: issue.number,
          repository: issue.repository_url.split('/').slice(-1)[0],
        }));

        set({ githubIssues: issues });
      },

      createGitHubIssue: async (repo, title, body) => {
        const token = get().githubToken;
        if (!token) throw new Error('GitHub token not set');

        const octokit = new Octokit({ auth: token });
        const [owner, repoName] = repo.split('/');

        await octokit.rest.issues.create({
          owner,
          repo: repoName,
          title,
          body,
        });

        await get().syncGitHubIssues();
      },

      // Freelancer methods
      addClient: async (client) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('clients')
          .insert([{ ...client, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          clients: [...state.clients, data],
        }));
      },

      addProject: async (project) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('projects')
          .insert([{ ...project, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          projects: [...state.projects, data],
        }));
      },

      createInvoice: async (invoice) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('invoices')
          .insert([{ ...invoice, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          invoices: [...state.invoices, data],
        }));
      },

      calculateEarnings: () => {
        return get().invoices
          .filter(invoice => invoice.status === 'paid')
          .reduce((sum, invoice) => sum + invoice.amount, 0);
      },

      // Team methods
      createTeam: async (name) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('teams')
          .insert([{
            name,
            user_id: user.id,
            members: [{
              id: user.id,
              role: 'owner' as const,
              joinedAt: new Date(),
            }],
          }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          teams: [...state.teams, data],
        }));
      },

      addTeamMember: async (teamId, userId, role) => {
        const { error } = await supabase
          .from('teams')
          .update({
            members: supabase.sql`array_append(members, ${JSON.stringify({
              id: userId,
              role,
              joinedAt: new Date(),
            })})`,
          })
          .eq('id', teamId);

        if (error) throw error;

        set(state => ({
          teams: state.teams.map(team =>
            team.id === teamId
              ? {
                  ...team,
                  members: [
                    ...team.members,
                    { id: userId, role, joinedAt: new Date() },
                  ],
                }
              : team
          ),
        }));
      },

      createSprint: async (sprint) => {
        const user = useUserStore.getState().user;
        if (!user) return;

        const { data, error } = await supabase
          .from('sprints')
          .insert([{ ...sprint, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        set(state => ({
          sprints: [...state.sprints, data],
        }));
      },
    }),
    {
      name: 'niche-store',
    }
  )
);