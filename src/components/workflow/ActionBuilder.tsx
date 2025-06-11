import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface ActionConfig {
  type: 'assign_task' | 'send_notification' | 'add_tag' | 'create_task';
  params: Record<string, any>;
}

interface ActionBuilderProps {
  actions: ActionConfig[];
  onChange: (actions: ActionConfig[]) => void;
}

export const ActionBuilder: React.FC<ActionBuilderProps> = ({ actions, onChange }) => {
  const addAction = () => {
    onChange([...actions, { type: 'assign_task', params: {} }]);
  };

  const removeAction = (index: number) => {
    onChange(actions.filter((_, i) => i !== index));
  };

  const updateAction = (index: number, updates: Partial<ActionConfig>) => {
    onChange(
      actions.map((action, i) =>
        i === index ? { ...action, ...updates } : action
      )
    );
  };

  const renderActionParams = (action: ActionConfig, index: number) => {
    switch (action.type) {
      case 'assign_task':
        return (
          <Select
            value={action.params.assignee || ''}
            onChange={(value) =>
              updateAction(index, {
                params: { ...action.params, assignee: value }
              })
            }
            options={[
              { label: 'Team Lead', value: 'team_lead' },
              { label: 'Project Manager', value: 'project_manager' },
              { label: 'Next Available', value: 'next_available' }
            ]}
          />
        );

      case 'send_notification':
        return (
          <Input
            value={action.params.message || ''}
            onChange={(e) =>
              updateAction(index, {
                params: { ...action.params, message: e.target.value }
              })
            }
            placeholder="Notification message"
          />
        );

      case 'add_tag':
        return (
          <Input
            value={action.params.tag || ''}
            onChange={(e) =>
              updateAction(index, {
                params: { ...action.params, tag: e.target.value }
              })
            }
            placeholder="Tag name"
          />
        );

      case 'create_task':
        return (
          <div className="space-y-2">
            <Input
              value={action.params.title || ''}
              onChange={(e) =>
                updateAction(index, {
                  params: { ...action.params, title: e.target.value }
                })
              }
              placeholder="Task title"
            />
            <Select
              value={action.params.priority || 'medium'}
              onChange={(value) =>
                updateAction(index, {
                  params: { ...action.params, priority: value }
                })
              }
              options={[
                { label: 'High', value: 'high' },
                { label: 'Medium', value: 'medium' },
                { label: 'Low', value: 'low' }
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Actions</h3>
        <Button onClick={addAction} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Action
        </Button>
      </div>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="flex-1 space-y-2">
              <Select
                value={action.type}
                onChange={(value) =>
                  updateAction(index, { type: value as ActionConfig['type'], params: {} })
                }
                options={[
                  { label: 'Assign Task', value: 'assign_task' },
                  { label: 'Send Notification', value: 'send_notification' },
                  { label: 'Add Tag', value: 'add_tag' },
                  { label: 'Create Task', value: 'create_task' }
                ]}
              />

              {renderActionParams(action, index)}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeAction(index)}
              className="text-red-500 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
