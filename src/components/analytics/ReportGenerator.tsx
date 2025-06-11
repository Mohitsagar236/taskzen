import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { useTaskStore } from '../../store/taskStore';
import { useTeamStore } from '../../store/teamStore';
import { useProgressStore } from '../../store/progressStore';
import { Download, FileText, Settings, Table } from 'lucide-react';
import toast from 'react-hot-toast';

type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  sections: {
    id: string;
    title: string;
    type: 'table' | 'chart' | 'summary';
    fields: string[];
  }[];
};

const defaultTemplates: ReportTemplate[] = [
  {
    id: 'team-performance',
    name: 'Team Performance Report',
    description: 'Comprehensive overview of team productivity and task completion',
    sections: [
      {
        id: 'overview',
        title: 'Team Overview',
        type: 'summary',
        fields: ['teamSize', 'activeProjects', 'completionRate'],
      },
      {
        id: 'tasks',
        title: 'Task Statistics',
        type: 'table',
        fields: ['completed', 'inProgress', 'overdue', 'upcoming'],
      },
      {
        id: 'productivity',
        title: 'Productivity Metrics',
        type: 'chart',
        fields: ['dailyCompletion', 'timeTracking', 'efficiency'],
      },
    ],
  },
  {
    id: 'project-status',
    name: 'Project Status Report',
    description: 'Detailed project progress and milestone tracking',
    sections: [
      {
        id: 'status',
        title: 'Project Status',
        type: 'summary',
        fields: ['progress', 'timeSpent', 'remaining'],
      },
      {
        id: 'milestones',
        title: 'Milestones',
        type: 'table',
        fields: ['name', 'dueDate', 'status', 'assignee'],
      },
      {
        id: 'risks',
        title: 'Risk Analysis',
        type: 'table',
        fields: ['description', 'impact', 'likelihood', 'mitigation'],
      },
    ],
  },
];

export function ReportGenerator() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('team-performance');
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'excel' | 'json'>('pdf');

  const tasks = useTaskStore((state) => state.tasks);
  const teams = useTeamStore((state) => state.teams);
  const progress = useProgressStore((state) => state.progress);

  const generateReport = async () => {
    try {
      const template = defaultTemplates.find((t) => t.id === selectedTemplate);
      if (!template) throw new Error('Template not found');

      // Collect report data based on template sections
      const reportData: any = {
        generatedAt: new Date().toISOString(),
        template: template.name,
        dateRange,
        sections: {},
      };

      // Process each section based on its type
      template.sections.forEach((section) => {
        switch (section.type) {
          case 'summary':
            reportData.sections[section.id] = generateSummaryData(section.fields);
            break;
          case 'table':
            reportData.sections[section.id] = generateTableData(section.fields);
            break;
          case 'chart':
            if (includeCharts) {
              reportData.sections[section.id] = generateChartData(section.fields);
            }
            break;
        }
      });

      // Include custom fields if any
      if (customFields.length > 0) {
        reportData.customFields = generateCustomFieldsData(customFields);
      }

      // Export in selected format
      await exportReport(reportData, format);
      toast.success('Report generated successfully!');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    }
  };

  const generateSummaryData = (fields: string[]) => {
    const data: any = {};
    fields.forEach((field) => {
      switch (field) {
        case 'teamSize':
          data[field] = teams.reduce((acc, team) => acc + team.members.length, 0);
          break;
        case 'activeProjects':
          data[field] = new Set(tasks.map((t) => t.projectId)).size;
          break;
        case 'completionRate':
          const completed = tasks.filter((t) => t.completed).length;
          data[field] = tasks.length > 0 ? (completed / tasks.length) * 100 : 0;
          break;
        // Add more field calculations as needed
      }
    });
    return data;
  };

  const generateTableData = (fields: string[]) => {
    return fields.map((field) => {
      switch (field) {
        case 'completed':
          return {
            field,
            value: tasks.filter((t) => t.completed).length,
          };
        case 'inProgress':
          return {
            field,
            value: tasks.filter((t) => !t.completed && t.status === 'in_progress').length,
          };
        // Add more field calculations as needed
        default:
          return { field, value: 0 };
      }
    });
  };

  const generateChartData = (fields: string[]) => {
    const data: any = {};
    fields.forEach((field) => {
      switch (field) {
        case 'dailyCompletion':
          // Implementation for daily completion chart data
          break;
        case 'timeTracking':
          // Implementation for time tracking chart data
          break;
        // Add more chart data generation as needed
      }
    });
    return data;
  };

  const generateCustomFieldsData = (fields: string[]) => {
    // Implementation for custom fields data
    return fields.reduce((acc: any, field) => {
      acc[field] = null; // Replace with actual data generation
      return acc;
    }, {});
  };

  const exportReport = async (data: any, format: 'pdf' | 'excel' | 'json') => {
    switch (format) {
      case 'pdf':
        // Implementation for PDF export
        break;
      case 'excel':
        // Implementation for Excel export
        break;
      case 'json':
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        break;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Configuration */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Report Configuration</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Report Template
            </label>
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
            >
              {defaultTemplates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date Range
            </label>
            <div className="flex items-center space-x-4">
              <Button
                variant={dateRange === 'week' ? 'primary' : 'outline'}
                onClick={() => setDateRange('week')}
              >
                Week
              </Button>
              <Button
                variant={dateRange === 'month' ? 'primary' : 'outline'}
                onClick={() => setDateRange('month')}
              >
                Month
              </Button>
              <Button
                variant={dateRange === 'quarter' ? 'primary' : 'outline'}
                onClick={() => setDateRange('quarter')}
              >
                Quarter
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Export Format
            </label>
            <div className="flex items-center space-x-4">
              <Button
                variant={format === 'pdf' ? 'primary' : 'outline'}
                onClick={() => setFormat('pdf')}
              >
                <FileText className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button
                variant={format === 'excel' ? 'primary' : 'outline'}
                onClick={() => setFormat('excel')}
              >
                <Table className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button
                variant={format === 'json' ? 'primary' : 'outline'}
                onClick={() => setFormat('json')}
              >
                <Settings className="w-4 h-4 mr-2" />
                JSON
              </Button>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="includeCharts"
              checked={includeCharts}
              onChange={(e) => setIncludeCharts(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="includeCharts"
              className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Include charts and visualizations
            </label>
          </div>
        </div>
      </div>

      {/* Template Preview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
        <h3 className="text-lg font-semibold mb-4 dark:text-white">Template Preview</h3>
        <div className="prose dark:prose-invert max-w-none">
          {defaultTemplates.find((t) => t.id === selectedTemplate)?.sections.map((section) => (
            <div key={section.id} className="mb-4">
              <h4 className="text-lg font-medium">{section.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Type: {section.type}
                <br />
                Fields: {section.fields.join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end">
        <Button variant="outline" className="mr-2">
          Save Template
        </Button>
        <Button onClick={generateReport}>
          <Download className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );
}
