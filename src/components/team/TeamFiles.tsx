import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { Button } from '../ui/Button';
import { File, Folder, Search, Upload, Download, MoreVertical, Share2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface TeamFile {
  id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  shared: boolean;
  url: string;
}

export function TeamFiles() {
  const { currentTeam, members } = useTeamStore();
  const [currentFolder, setCurrentFolder] = useState<string>('/');
  const [searchQuery, setSearchQuery] = useState('');
  const [files, setFiles] = useState<TeamFile[]>([
    {
      id: '1',
      name: 'Project Proposal.pdf',
      type: 'pdf',
      size: 2500000,
      createdAt: '2025-05-15T10:30:00',
      updatedAt: '2025-05-15T10:30:00',
      createdBy: members[0]?.id || '',
      shared: true,
      url: '#'
    },
    {
      id: '2',
      name: 'Design Assets.zip',
      type: 'zip',
      size: 15000000,
      createdAt: '2025-05-16T14:20:00',
      updatedAt: '2025-05-16T14:20:00',
      createdBy: members[1]?.id || '',
      shared: false,
      url: '#'
    }
  ]);

  if (!currentTeam) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Select a team to view files
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return 'file-text';
      case 'image':
        return 'image';
      case 'zip':
        return 'archive';
      default:
        return 'file';
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
  };

  const handleCreateFolder = () => {
    // TODO: Implement folder creation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Team Files</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and share team documents
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={handleCreateFolder}>
            <Folder className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button onClick={handleUpload}>
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Created By
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Last Modified
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((file) => {
              const creator = members.find((m) => m.id === file.createdBy);
              return (
                <tr
                  key={file.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <File className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {file.name}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {file.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={creator?.avatarUrl}
                        alt={creator?.name}
                        className="w-6 h-6 rounded-full mr-2"
                      />
                      <span className="text-sm text-gray-900 dark:text-white">
                        {creator?.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(file.updatedAt), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end space-x-2">
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
