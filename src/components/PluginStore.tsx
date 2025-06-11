import React from 'react';
import { usePluginStore, Plugin } from '../store/pluginStore';
import { useUserStore } from '../store/userStore';
import { Button } from './ui/Button';
import { Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export function PluginStore() {
  const { plugins, togglePlugin } = usePluginStore();
  const { user } = useUserStore();

  const handleTogglePlugin = (plugin: Plugin) => {
    if (plugin.premium && !user?.isPremium) {
      toast.error('This plugin requires a premium subscription');
      return;
    }
    togglePlugin(plugin.id);
    toast.success(`${plugin.name} ${plugin.enabled ? 'disabled' : 'enabled'}`);
  };

  const categories = Array.from(new Set(plugins.map(p => p.category)));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 dark:text-white">Plugin Store</h2>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold mb-4 capitalize dark:text-white">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {plugins
              .filter(plugin => plugin.category === category)
              .map(plugin => (
                <div
                  key={plugin.id}
                  className="border dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-2xl mr-2">{plugin.icon}</span>
                      <h4 className="font-medium dark:text-white">
                        {plugin.name}
                        {plugin.premium && (
                          <Lock className="w-4 h-4 inline ml-2 text-yellow-500" />
                        )}
                      </h4>
                    </div>
                    <Button
                      variant={plugin.enabled ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleTogglePlugin(plugin)}
                    >
                      {plugin.enabled ? 'Disable' : 'Enable'}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {plugin.description}
                  </p>
                  <div className="space-y-1">
                    {plugin.features.map((feature, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-400 flex items-center"
                      >
                        <span className="mr-2">•</span>
                        {feature}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}