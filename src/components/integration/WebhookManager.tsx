import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, X, Send, Code } from 'lucide-react';

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers: Record<string, string>;
  events: string[];
  isActive: boolean;
}

export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newWebhook, setNewWebhook] = useState<Partial<WebhookConfig>>({
    method: 'POST',
    headers: {},
    events: [],
    isActive: true
  });
  const [newHeader, setNewHeader] = useState({ key: '', value: '' });

  const availableEvents = [
    'task.created',
    'task.updated',
    'task.completed',
    'task.deleted',
    'project.created',
    'project.updated',
    'project.deleted',
    'comment.created',
    'comment.updated',
    'comment.deleted'
  ];

  const addWebhook = () => {
    if (!newWebhook.name || !newWebhook.url) return;

    const webhook: WebhookConfig = {
      id: crypto.randomUUID(),
      name: newWebhook.name!,
      url: newWebhook.url!,
      method: newWebhook.method as WebhookConfig['method'],
      headers: newWebhook.headers || {},
      events: newWebhook.events || [],
      isActive: newWebhook.isActive || true
    };

    setWebhooks([...webhooks, webhook]);
    setShowForm(false);
    setNewWebhook({
      method: 'POST',
      headers: {},
      events: [],
      isActive: true
    });
  };

  const removeWebhook = (id: string) => {
    setWebhooks(webhooks.filter(w => w.id !== id));
  };

  const toggleWebhook = (id: string) => {
    setWebhooks(webhooks.map(w =>
      w.id === id ? { ...w, isActive: !w.isActive } : w
    ));
  };

  const addHeader = () => {
    if (!newHeader.key || !newHeader.value) return;
    setNewWebhook({
      ...newWebhook,
      headers: {
        ...newWebhook.headers,
        [newHeader.key]: newHeader.value
      }
    });
    setNewHeader({ key: '', value: '' });
  };

  const removeHeader = (key: string) => {
    const headers = { ...newWebhook.headers };
    delete headers[key];
    setNewWebhook({ ...newWebhook, headers });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Webhooks</h2>
          <p className="text-gray-500">Manage webhook endpoints for event notifications</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {showForm && (
        <div className="border rounded-lg p-6 space-y-6">
          <h3 className="text-lg font-semibold">New Webhook</h3>
          
          <div className="space-y-4">
            <Input
              placeholder="Webhook Name"
              value={newWebhook.name || ''}
              onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
            />

            <Input
              placeholder="Webhook URL"
              value={newWebhook.url || ''}
              onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
            />

            <Select
              value={newWebhook.method || 'POST'}
              onChange={(value) => setNewWebhook({ ...newWebhook, method: value as WebhookConfig['method'] })}
              options={[
                { label: 'POST', value: 'POST' },
                { label: 'GET', value: 'GET' },
                { label: 'PUT', value: 'PUT' },
                { label: 'PATCH', value: 'PATCH' },
                { label: 'DELETE', value: 'DELETE' }
              ]}
            />

            <div className="space-y-2">
              <label className="block text-sm font-medium">Headers</label>
              <div className="flex gap-2">
                <Input
                  placeholder="Header Key"
                  value={newHeader.key}
                  onChange={(e) => setNewHeader({ ...newHeader, key: e.target.value })}
                />
                <Input
                  placeholder="Header Value"
                  value={newHeader.value}
                  onChange={(e) => setNewHeader({ ...newHeader, value: e.target.value })}
                />
                <Button onClick={addHeader}>Add</Button>
              </div>
              <div className="space-y-2">
                {Object.entries(newWebhook.headers || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{key}: </span>
                      <span className="font-mono text-sm text-gray-600 dark:text-gray-300">{value}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeHeader(key)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium">Events</label>
              <div className="grid grid-cols-2 gap-2">
                {availableEvents.map(event => (
                  <label key={event} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newWebhook.events?.includes(event)}
                      onChange={(e) => {
                        const events = e.target.checked
                          ? [...(newWebhook.events || []), event]
                          : (newWebhook.events || []).filter(e => e !== event);
                        setNewWebhook({ ...newWebhook, events });
                      }}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm">{event}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={addWebhook}>
                <Send className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {webhooks.map((webhook) => (
          <div
            key={webhook.id}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{webhook.name}</h3>
                <p className="text-sm text-gray-500">{webhook.url}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={webhook.isActive ? 'default' : 'outline'}
                  onClick={() => toggleWebhook(webhook.id)}
                >
                  {webhook.isActive ? 'Active' : 'Inactive'}
                </Button>
                <Button
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => removeWebhook(webhook.id)}
                >
                  Remove
                </Button>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center space-x-2 text-sm">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {webhook.method}
                </span>
                <Code className="w-4 h-4" />
                <span className="font-mono">{webhook.url}</span>
              </div>
            </div>

            <div className="text-sm">
              <div className="font-medium mb-1">Events:</div>
              <div className="flex flex-wrap gap-2">
                {webhook.events.map(event => (
                  <span
                    key={event}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
