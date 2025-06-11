import React from 'react';
interface TriggerConfig {
    type: 'task_created' | 'task_completed' | 'due_date_approaching' | 'tag_added';
    conditions: Record<string, any>;
}
interface TriggerBuilderProps {
    triggers: TriggerConfig[];
    onChange: (triggers: TriggerConfig[]) => void;
}
export declare const TriggerBuilder: React.FC<TriggerBuilderProps>;
export {};
