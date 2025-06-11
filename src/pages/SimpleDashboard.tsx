import React from 'react';

export default function SimpleDashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      <p className="mb-4">Welcome to your TaskZen dashboard.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Recent Tasks</h3>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="mr-2 w-4 h-4 bg-green-500 rounded-full"></span>
              <span>Complete project proposal</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2 w-4 h-4 bg-yellow-500 rounded-full"></span>
              <span>Review client feedback</span>
            </li>
            <li className="flex items-center">
              <span className="mr-2 w-4 h-4 bg-red-500 rounded-full"></span>
              <span>Prepare presentation</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-2">Statistics</h3>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Completed tasks:</span> 12
            </div>
            <div>
              <span className="font-medium">In progress:</span> 5
            </div>
            <div>
              <span className="font-medium">Upcoming:</span> 8
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}