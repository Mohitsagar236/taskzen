import React from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

interface TriggerConfig {
  type: 'task_created' | 'task_completed' | 'due_date_approaching' | 'tag_added';
  conditions: Record<string, any>;
}

interface TriggerBuilderProps {
  triggers: TriggerConfig[];
  onChange: (triggers: TriggerConfig[]) => void;
}

export const TriggerBuilder: React.FC<TriggerBuilderProps> = ({ triggers, onChange }) => {
  const addTrigger = () => {
    onChange([...triggers, { type: 'task_created', conditions: {} }]);
  };

  const removeTrigger = (index: number) => {
    onChange(triggers.filter((_, i) => i !== index));
  };

  const updateTrigger = (index: number, updates: Partial<TriggerConfig>) => {
    onChange(
      triggers.map((trigger, i) =>
        i === index ? { ...trigger, ...updates } : trigger
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Triggers</h3>
        <Button onClick={addTrigger} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Trigger
        </Button>
      </div>

      <div className="space-y-4">
        {triggers.map((trigger, index) => (
          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
            <div className="flex-1">
              <Select
                value={trigger.type}
                onChange={(value) => updateTrigger(index, { type: value as TriggerConfig['type'] })}
                options={[
                  { label: 'Task Created', value: 'task_created' },
                  { label: 'Task Completed', value: 'task_completed' },
                  { label: 'Due Date Approaching', value: 'due_date_approaching' },
                  { label: 'Tag Added', value: 'tag_added' }
                ]}
              />

              {/* Render condition fields based on trigger type */}
              {trigger.type === 'due_date_approaching' && (
                <div className="mt-2">
                  <Select
                    value={trigger.conditions.days?.toString() || '1'}
                    onChange={(value) => 
                      updateTrigger(index, {
                        conditions: { ...trigger.conditions, days: parseInt(value) }
                      })
                    }
                    options={[
                      { label: '1 day before', value: '1' },
                      { label: '3 days before', value: '3' },
                      { label: '7 days before', value: '7' }
                    ]}
                  />
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeTrigger(index)}
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
