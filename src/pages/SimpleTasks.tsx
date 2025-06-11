import React, { useState } from 'react';

export default function SimpleTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete project proposal', status: 'In Progress', priority: 'High' },
    { id: 2, title: 'Review client feedback', status: 'To Do', priority: 'Medium' },
    { id: 3, title: 'Prepare presentation', status: 'To Do', priority: 'High' },
    { id: 4, title: 'Update documentation', status: 'Completed', priority: 'Low' },
    { id: 5, title: 'Team meeting', status: 'In Progress', priority: 'Medium' }
  ]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Tasks</h2>
      <p className="mb-4">Manage your tasks here.</p>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map(task => (
              <tr key={task.id}>
                <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${task.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                      task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${task.priority === 'High' ? 'bg-red-100 text-red-800' : 
                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-blue-100 text-blue-800'}`}>
                    {task.priority}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}