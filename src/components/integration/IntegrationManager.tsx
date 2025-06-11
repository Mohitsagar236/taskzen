import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Slack, Github, Calendar, Globe, CheckCircle2, XCircle } from 'lucide-react';

interface Integration {
  id: string;
  type: 'slack' | 'github' | 'calendar' | 'webhook';
  name: string;
  status: 'connected' | 'disconnected';
  config: Record<string, any>;
}

export const IntegrationManager: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState<Partial<Integration>>({
    type: 'slack',
    name: '',
    config: {}
  });

  const getIntegrationIcon = (type: string) => {
    switch (type) {
      case 'slack':
        return <Slack className="w-6 h-6" />;
      case 'github':
        return <Github className="w-6 h-6" />;
      case 'calendar':
        return <Calendar className="w-6 h-6" />;
      default:
        return <Globe className="w-6 h-6" />;
    }
  };

  const addIntegration = () => {
    if (!newIntegration.name) return;

    const integration: Integration = {
      id: crypto.randomUUID(),
      type: newIntegration.type as Integration['type'],
      name: newIntegration.name,
      status: 'disconnected',
      config: newIntegration.config || {}
    };

    setIntegrations([...integrations, integration]);
    setShowAddForm(false);
    setNewIntegration({ type: 'slack', name: '', config: {} });
  };

  const removeIntegration = (id: string) => {
    setIntegrations(integrations.filter(i => i.id !== id));
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(integrations.map(i => 
      i.id === id 
        ? { ...i, status: i.status === 'connected' ? 'disconnected' : 'connected' }
        : i
    ));
  };

  const renderConfigForm = () => {
    switch (newIntegration.type) {
      case 'slack':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Webhook URL"
              value={newIntegration.config?.webhookUrl || ''}
              onChange={(e) => 
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, webhookUrl: e.target.value }
                })
              }
            />
            <Input
              placeholder="Channel"
              value={newIntegration.config?.channel || ''}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, channel: e.target.value }
                })
              }
            />
          </div>
        );

      case 'github':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Repository URL"
              value={newIntegration.config?.repoUrl || ''}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, repoUrl: e.target.value }
                })
              }
            />
            <Input
              placeholder="Access Token"
              type="password"
              value={newIntegration.config?.accessToken || ''}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, accessToken: e.target.value }
                })
              }
            />
          </div>
        );

      case 'calendar':
        return (
          <div className="space-y-4">
            <Select
              value={newIntegration.config?.provider || 'google'}
              onChange={(value) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, provider: value }
                })
              }
              options={[
                { label: 'Google Calendar', value: 'google' },
                { label: 'Microsoft Outlook', value: 'outlook' }
              ]}
            />
          </div>
        );

      case 'webhook':
        return (
          <div className="space-y-4">
            <Input
              placeholder="Webhook URL"
              value={newIntegration.config?.url || ''}
              onChange={(e) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, url: e.target.value }
                })
              }
            />
            <Select
              value={newIntegration.config?.method || 'POST'}
              onChange={(value) =>
                setNewIntegration({
                  ...newIntegration,
                  config: { ...newIntegration.config, method: value }
                })
              }
              options={[
                { label: 'POST', value: 'POST' },
                { label: 'PUT', value: 'PUT' },
                { label: 'PATCH', value: 'PATCH' }
              ]}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Integrations</h2>
        <Button onClick={() => setShowAddForm(true)}>Add Integration</Button>
      </div>

      {showAddForm && (
        <div className="p-6 border rounded-lg space-y-4">
          <h3 className="text-lg font-semibold">New Integration</h3>
          <div className="space-y-4">
            <Select
              value={newIntegration.type}
              onChange={(value) => setNewIntegration({ ...newIntegration, type: value as Integration['type'] })}
              options={[
                { label: 'Slack', value: 'slack' },
                { label: 'GitHub', value: 'github' },
                { label: 'Calendar', value: 'calendar' },
                { label: 'Webhook', value: 'webhook' }
              ]}
            />
            <Input
              placeholder="Integration Name"
              value={newIntegration.name}
              onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
            />
            {renderConfigForm()}
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={addIntegration}>Add Integration</Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {integrations.map((integration) => (
          <div
            key={integration.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              {getIntegrationIcon(integration.type)}
              <div>
                <h3 className="font-medium">{integration.name}</h3>
                <p className="text-sm text-gray-500">{integration.type}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={integration.status === 'connected' ? 'default' : 'outline'}
                onClick={() => toggleIntegration(integration.id)}
              >
                {integration.status === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                {integration.status === 'connected' ? 'Connected' : 'Connect'}
              </Button>
              <Button
                variant="ghost"
                className="text-red-500 hover:text-red-600"
                onClick={() => removeIntegration(integration.id)}
              >
                Remove
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
