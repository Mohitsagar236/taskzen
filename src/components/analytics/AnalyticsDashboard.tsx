import * as React from 'react';
import { useEffect, useState } from 'react';
import { ProductivityAnalytics } from './ProductivityAnalytics';
import { TeamAnalytics } from './TeamAnalytics';
import { ProjectAnalytics } from './ProjectAnalytics';
import { ReportGenerator } from './ReportGenerator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { loadAllApplicationData, diagnoseStoreData } from '../../lib/fixDataDisplayErrors';
import { useProgressStore } from '../../store/progressStore';

export function AnalyticsDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const progress = useProgressStore(state => state.progress);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const result = await loadAllApplicationData();
        
        if (!result.success) {
          console.error('Failed to load analytics data:', result.error);
          setLoadError(`Error loading data: ${result.error}`);
        } else {
          const diagnostics = diagnoseStoreData();
          console.log('Data diagnostics:', diagnostics);
          
          if (!diagnostics.progressLoaded) {
            console.warn('Progress data not loaded correctly');
          }
          
          setLoadError(null);
        }
      } catch (err) {
        console.error('Error in analytics data loading:', err);
        setLoadError('Unexpected error loading analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-xl">
        <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Analytics Error</h2>
        <p className="text-red-600 dark:text-red-300 mb-4">{loadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-xl rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
        <p className="text-white/80">Comprehensive insights into your team's performance</p>
      </div>

      <Tabs defaultValue="productivity" className="w-full">
        <TabsList className="grid grid-cols-4 gap-4 bg-transparent">
          <TabsTrigger
            value="productivity"
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white"
          >
            Productivity
          </TabsTrigger>
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-purple-500 data-[state=active]:text-white"
          >
            Team Performance
          </TabsTrigger>
          <TabsTrigger
            value="projects"
            className="data-[state=active]:bg-green-500 data-[state=active]:text-white"
          >
            Project Metrics
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-amber-500 data-[state=active]:text-white"
          >
            Custom Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="productivity" className="mt-6">
          <ProductivityAnalytics />
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <TeamAnalytics />
        </TabsContent>
        
        <TabsContent value="projects" className="mt-6">
          <ProjectAnalytics />
        </TabsContent>
        
        <TabsContent value="reports" className="mt-6">
          <ReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
