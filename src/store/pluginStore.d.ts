export interface Plugin {
    id: string;
    name: string;
    description: string;
    icon: string;
    enabled: boolean;
    category: 'productivity' | 'wellness' | 'integration' | 'utility';
    features: string[];
    premium: boolean;
}
interface PluginStore {
    plugins: Plugin[];
    enabledPlugins: string[];
    togglePlugin: (id: string) => void;
    isPluginEnabled: (id: string) => boolean;
}
export declare const usePluginStore: import("zustand").UseBoundStore<Omit<import("zustand").StoreApi<PluginStore>, "persist"> & {
    persist: {
        setOptions: (options: Partial<import("zustand/middleware").PersistOptions<PluginStore, PluginStore>>) => void;
        clearStorage: () => void;
        rehydrate: () => Promise<void> | void;
        hasHydrated: () => boolean;
        onHydrate: (fn: (state: PluginStore) => void) => () => void;
        onFinishHydration: (fn: (state: PluginStore) => void) => () => void;
        getOptions: () => Partial<import("zustand/middleware").PersistOptions<PluginStore, PluginStore>>;
    };
}>;
export {};
