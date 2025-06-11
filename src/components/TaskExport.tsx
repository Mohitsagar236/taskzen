import React from 'react';
import { useTaskStore } from '../store/taskStore';
import { useExportStore } from '../store/exportStore';
import { Button } from './ui/Button';
import { FileDown } from 'lucide-react';
import toast from 'react-hot-toast';

export function TaskExport() {
  const tasks = useTaskStore((state) => state.tasks);
  const { exportToPDF, exportToExcel } = useExportStore();

  const handleExportPDF = async () => {
    try {
      await exportToPDF(tasks);
      toast.success('Tasks exported to PDF successfully');
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast.error('Failed to export tasks to PDF');
    }
  };

  const handleExportExcel = async () => {
    try {
      await exportToExcel(tasks);
      toast.success('Tasks exported to Excel successfully');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      toast.error('Failed to export tasks to Excel');
    }
  };

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        onClick={handleExportPDF}
        className="flex items-center"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Export PDF
      </Button>
      <Button
        variant="outline"
        onClick={handleExportExcel}
        className="flex items-center"
      >
        <FileDown className="w-4 h-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
}