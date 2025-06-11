import React from 'react';
interface ActionConfig {
    type: 'assign_task' | 'send_notification' | 'add_tag' | 'create_task';
    params: Record<string, any>;
}
interface ActionBuilderProps {
    actions: ActionConfig[];
    onChange: (actions: ActionConfig[]) => void;
}
export declare const ActionBuilder: React.FC<ActionBuilderProps>;
export {};
