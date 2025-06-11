interface Team {
    id: string;
    name: string;
    description?: string;
    avatarUrl?: string;
    createdBy: string;
    createdAt: Date;
    members: TeamMember[];
    settings: any;
}
interface TeamMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'editor' | 'viewer';
    avatarUrl?: string;
    joinedAt: Date;
}
interface Activity {
    id: string;
    user: {
        id: string;
        name: string;
        avatarUrl?: string;
    };
    action: string;
    entityType: string;
    entityId: string;
    metadata: any;
    createdAt: Date;
}
interface TeamStore {
    teams: Team[];
    currentTeam: Team | null;
    members: TeamMember[];
    activities: Activity[];
    loading: boolean;
    error: string | null;
    setCurrentTeam: (team: Team) => void;
    fetchTeams: () => Promise<void>;
    createTeam: (team: {
        name: string;
        description?: string;
    }) => Promise<void>;
    inviteMember: (teamId: string, email: string, role: TeamMember['role']) => Promise<void>;
    updateMemberRole: (memberId: string, role: TeamMember['role']) => Promise<void>;
    removeMember: (memberId: string) => Promise<void>;
    fetchActivities: (teamId: string) => Promise<void>;
}
export declare const useTeamStore: import("zustand").UseBoundStore<import("zustand").StoreApi<TeamStore>>;
export {};
