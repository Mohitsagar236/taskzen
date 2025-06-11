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
    courses: Course[];
    assignments: Assignment[];
    gpa: number;
    addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
    updateCourse: (id: string, course: Partial<Course>) => Promise<void>;
    addAssignment: (assignment: Omit<Assignment, 'id'>) => Promise<void>;
    updateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
    calculateGPA: () => number;
    githubToken?: string;
    githubIssues: GitHubIssue[];
    setGitHubToken: (token: string) => void;
    syncGitHubIssues: () => Promise<void>;
    createGitHubIssue: (repo: string, title: string, body: string) => Promise<void>;
    clients: Client[];
    projects: Project[];
    invoices: Invoice[];
    addClient: (client: Omit<Client, 'id'>) => Promise<void>;
    addProject: (project: Omit<Project, 'id'>) => Promise<void>;
    createInvoice: (invoice: Omit<Invoice, 'id'>) => Promise<void>;
    calculateEarnings: () => number;
    teams: Team[];
    sprints: Sprint[];
    createTeam: (name: string) => Promise<void>;
    addTeamMember: (teamId: string, userId: string, role: TeamMember['role']) => Promise<void>;
    createSprint: (sprint: Omit<Sprint, 'id'>) => Promise<void>;
}
export declare const useNicheStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<NicheStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<NicheStore, NicheStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: NicheStore) => void) => () => void;
        onFinishHydration: (fn: (state: NicheStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<NicheStore, NicheStore>>;
    };
}>;
export {};
