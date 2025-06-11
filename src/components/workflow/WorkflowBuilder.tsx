import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TriggerBuilder } from './TriggerBuilder';
import { ActionBuilder } from './ActionBuilder';

interface Workflow {
  id: string;
  name: string;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
  isActive: boolean;
}

interface WorkflowTrigger {
  type: 'task_created' | 'task_completed' | 'due_date_approaching' | 'tag_added';
  conditions: Record<string, any>;
}

interface WorkflowAction {
  type: 'assign_task' | 'send_notification' | 'add_tag' | 'create_task';
  params: Record<string, any>;
}

export const WorkflowBuilder: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);

  const addWorkflow = () => {
    const newWorkflow: Workflow = {
      id: crypto.randomUUID(),
      name: 'New Workflow',
      triggers: [],
      actions: [],
      isActive: false
    };
    setWorkflows([...workflows, newWorkflow]);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workflow Automation</h2>
        <Button onClick={addWorkflow}>Create Workflow</Button>
      </div>
      
      <div className="grid gap-4">
        {workflows.map(workflow => (
          <div key={workflow.id} className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <Input 
                value={workflow.name}
                onChange={(e) => {
                  const updated = workflows.map(w => 
                    w.id === workflow.id ? { ...w, name: e.target.value } : w
                  );
                  setWorkflows(updated);
                }}
              />
              <div className="flex items-center gap-2">
                <Select
                  value={workflow.isActive ? 'active' : 'inactive'}
                  onChange={(value) => {
                    const updated = workflows.map(w =>
                      w.id === workflow.id ? { ...w, isActive: value === 'active' } : w
                    );
                    setWorkflows(updated);
                  }}
                  options={[
                    { label: 'Active', value: 'active' },
                    { label: 'Inactive', value: 'inactive' }
                  ]}
                />
                <Button variant="outline" onClick={() => {
                  setWorkflows(workflows.filter(w => w.id !== workflow.id));
                }}>Delete</Button>
              </div>
            </div>
            
            <div className="space-y-6">
              <TriggerBuilder 
                triggers={workflow.triggers}
                onChange={(triggers) => {
                  const updated = workflows.map(w =>
                    w.id === workflow.id ? { ...w, triggers } : w
                  );
                  setWorkflows(updated);
                }}
              />
              
              <ActionBuilder
                actions={workflow.actions}
                onChange={(actions) => {
                  const updated = workflows.map(w =>
                    w.id === workflow.id ? { ...w, actions } : w
                  );
                  setWorkflows(updated);
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
