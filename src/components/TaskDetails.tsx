import React, { useState } from 'react';
import { format } from 'date-fns';
import { User, MessageSquare, Share2, UserPlus, Lock, Unlock, FileDown, Video } from 'lucide-react';
import { useTaskStore } from '../store/taskStore';
import { Button } from './ui/Button';
import { Task, TaskComment } from '../types';
import { decryptData } from '../lib/encryption';
import { TaskExport } from './TaskExport';
import { ScreenRecorder } from './ScreenRecorder';
import toast from 'react-hot-toast';

interface TaskDetailsProps {
  task: Task;
  onClose: () => void;
}

export function TaskDetails({ task, onClose }: TaskDetailsProps) {
  const { comments, fetchComments, addComment, shareTask, assignTask } = useTaskStore();
  const [newComment, setNewComment] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [assignEmail, setAssignEmail] = useState('');
  const [password, setPassword] = useState('');
  const [decryptedTask, setDecryptedTask] = useState<Task | null>(null);

  const handleDecrypt = () => {
    if (!task.isEncrypted || !task.encryptionKey) return;

    try {
      const decrypted = decryptData(task.encryptionKey, password);
      setDecryptedTask(decrypted);
      toast.success('Task decrypted successfully');
    } catch (error) {
      toast.error('Invalid password');
    }
  };

  const displayTask = decryptedTask || task;

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      await addComment(task.id, newComment, []);
      setNewComment('');
      toast.success('Comment added successfully');
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleShareTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;

    try {
      await shareTask(task.id, shareEmail, 'view');
      setShareEmail('');
      toast.success('Task shared successfully');
    } catch (error) {
      toast.error('Failed to share task');
    }
  };

  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignEmail.trim()) return;

    try {
      await assignTask(task.id, assignEmail);
      setAssignEmail('');
      toast.success('Task assigned successfully');
    } catch (error) {
      toast.error('Failed to assign task');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold dark:text-white">{displayTask.title}</h2>
            <Button variant="outline" onClick={onClose}>×</Button>
          </div>

          {task.isEncrypted && !decryptedTask && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 dark:text-white">
                <Lock className="inline-block w-5 h-5 mr-2" />
                Encrypted Task
              </h3>
              <div className="space-y-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password to decrypt"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <Button onClick={handleDecrypt}>Decrypt</Button>
              </div>
            </div>
          )}

          {(!task.isEncrypted || decryptedTask) && (
            <div className="space-y-6">
              {/* Task Details */}
              <div>
                <p className="text-gray-600 dark:text-gray-300">{displayTask.description}</p>
                <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Priority: {displayTask.priority}</span>
                  <span>Category: {displayTask.category}</span>
                  {displayTask.dueDate && (
                    <span>Due: {format(new Date(displayTask.dueDate), 'MMM d, yyyy')}</span>
                  )}
                </div>
              </div>

              {/* Export and Recording */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                  <TaskExport />
                  <ScreenRecorder taskId={task.id} />
                </div>
                {task.recording_url && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium dark:text-white mb-2">
                      Latest Recording
                    </h4>
                    <video
                      src={task.recording_url}
                      controls
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>

              {/* Share Task */}
              <div className="border-t pt-4">
                <h3 className="flex items-center text-lg font-semibold mb-2 dark:text-white">
                  <Share2 className="w-5 h-5 mr-2" />
                  Share Task
                </h3>
                <form onSubmit={handleShareTask} className="flex gap-2">
                  <input
                    type="email"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    placeholder="Enter email to share with"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button type="submit">Share</Button>
                </form>
              </div>

              {/* Assign Task */}
              <div className="border-t pt-4">
                <h3 className="flex items-center text-lg font-semibold mb-2 dark:text-white">
                  <UserPlus className="w-5 h-5 mr-2" />
                  Assign Task
                </h3>
                <form onSubmit={handleAssignTask} className="flex gap-2">
                  <input
                    type="email"
                    value={assignEmail}
                    onChange={(e) => setAssignEmail(e.target.value)}
                    placeholder="Enter email to assign to"
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button type="submit">Assign</Button>
                </form>
              </div>

              {/* Comments */}
              <div className="border-t pt-4">
                <h3 className="flex items-center text-lg font-semibold mb-2 dark:text-white">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Comments
                </h3>
                <div className="space-y-4 mb-4">
                  {comments[task.id]?.map((comment: TaskComment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium dark:text-white">{comment.user?.name || 'Unknown User'}</span>
                          <span className="text-sm text-gray-500">
                            {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-300">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Button type="submit">Comment</Button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}