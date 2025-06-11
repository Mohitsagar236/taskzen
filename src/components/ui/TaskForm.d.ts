import * as z from 'zod';
declare const taskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodOptional<z.ZodString>;
    priority: z.ZodDefault<z.ZodEnum<["low", "medium", "high"]>>;
    category: z.ZodOptional<z.ZodString>;
    status: z.ZodDefault<z.ZodEnum<["todo", "in_progress", "review", "done"]>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    status: "todo" | "in_progress" | "review" | "done";
    priority: "low" | "medium" | "high";
    dueDate?: string | undefined;
    description?: string | undefined;
    category?: string | undefined;
}, {
    title: string;
    dueDate?: string | undefined;
    description?: string | undefined;
    status?: "todo" | "in_progress" | "review" | "done" | undefined;
    priority?: "low" | "medium" | "high" | undefined;
    category?: string | undefined;
}>;
type TaskFormData = z.infer<typeof taskSchema>;
interface TaskFormProps {
    onSubmit: (data: TaskFormData) => void;
    initialData?: Partial<TaskFormData>;
}
export declare function TaskForm({ onSubmit, initialData }: TaskFormProps): import("react/jsx-runtime").JSX.Element;
export {};
