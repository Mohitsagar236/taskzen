export type Team = {
    id: string;
    name: string;
    members?: Array<{
        id: string;
        name: string;
    }>;
};
