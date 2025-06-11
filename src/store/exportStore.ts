import { create } from 'zustand';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Task } from '../types';
import { useTaskStore } from './taskStore';

interface ExportStore {
  exportToPDF: (tasks: Task[]) => Promise<void>;
  exportToExcel: (tasks: Task[]) => Promise<void>;
}

export const useExportStore = create<ExportStore>(() => ({
  exportToPDF: async (tasks: Task[]) => {
    try {
      const doc = new jsPDF();
      let yPos = 20;

      // Add title and metadata
      doc.setFontSize(20);
      doc.text('Task Report', 20, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, yPos);
      yPos += 10;
      doc.text(`Total Tasks: ${tasks.length}`, 20, yPos);
      yPos += 20;

      // Add tasks
      doc.setFontSize(12);
      tasks.forEach((task) => {
        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }

        // Task title with priority color
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(task.priority === 'high' ? '#DC2626' : 
                        task.priority === 'medium' ? '#D97706' : '#2563EB');
        doc.text(task.title, 20, yPos);
        yPos += 7;

        // Reset text color for other content
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        if (task.description) {
          // Word wrap description
          const lines = doc.splitTextToSize(task.description, 170);
          doc.text(lines, 20, yPos);
          yPos += 7 * lines.length;
        }

        // Task metadata
        const metadata = [
          `Status: ${task.completed ? 'Completed' : 'Pending'}`,
          `Priority: ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}`,
          `Category: ${task.category || 'Uncategorized'}`,
          task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString()}` : null
        ].filter(Boolean);

        metadata.forEach(text => {
          if (text) {
            doc.text(text, 20, yPos);
            yPos += 7;
          }
        });

        yPos += 10; // Add space between tasks
      });      // Save the PDF
      const fileName = `tasks-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);

      // Update task export status
      await Promise.all(
        tasks.map(task => useTaskStore.getState().updateTask(task.id, {
          exportFormat: 'pdf',
          export_format: 'pdf',
          lastExportedAt: new Date(),
          last_exported_at: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      throw error;
    }
  },

  exportToExcel: async (tasks: Task[]) => {
    try {
      const workbook = XLSX.utils.book_new();
      
      const data = tasks.map((task) => ({
        Title: task.title,
        Description: task.description || '',
        Status: task.completed ? 'Completed' : 'Pending',
        Priority: task.priority.charAt(0).toUpperCase() + task.priority.slice(1),
        Category: task.category || 'Uncategorized',
        'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '',
        'Created At': new Date(task.createdAt).toLocaleDateString(),
        'Completed At': task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '',
        'Assigned To': task.assignedTo || '',
        'Team': task.teamId ? 'Yes' : 'No'
      }));

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      const max_width = data.reduce((w, r) => Math.max(w, r.Title.length), 10);
      const col_width = Math.min(max_width, 50);
      worksheet['!cols'] = [
        { wch: col_width }, // Title
        { wch: 50 },        // Description
        { wch: 10 },        // Status
        { wch: 10 },        // Priority
        { wch: 15 },        // Category
        { wch: 12 },        // Due Date
        { wch: 12 },        // Created At
        { wch: 12 },        // Completed At
        { wch: 30 },        // Assigned To
        { wch: 6 }          // Team
      ];

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tasks');      // Save the Excel file
      const fileName = `tasks-${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      // Update task export status
      await Promise.all(
        tasks.map(task => useTaskStore.getState().updateTask(task.id, {
          exportFormat: 'excel',
          export_format: 'excel',
          lastExportedAt: new Date(),
          last_exported_at: new Date().toISOString()
        }))
      );
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }  }
}));