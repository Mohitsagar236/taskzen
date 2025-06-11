import React, { useState, useEffect, useRef } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { useUserStore } from '../../store/userStore';
import { Avatar } from '../ui/Avatar';
import { Send, Paperclip, Smile, X as CloseIcon } from 'lucide-react';
import { format } from 'date-fns';

interface Message {
  id: string;
  teamId: string;
  userId: string;
  content: string;
  attachments?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  }[];
  reactions?: {
    emoji: string;
    users: string[];
  }[];
  createdAt: string;
  threadId?: string;
  edited?: boolean;
}

export function TeamChat() {
  const { currentTeam, members } = useTeamStore();
  const { user } = useUserStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedThread] = useState<string | undefined>(undefined);

  // Simulated messages for demo
  useEffect(() => {
    if (currentTeam) {
      const demoMessages: Message[] = [
        {
          id: '1',
          teamId: currentTeam.id,
          userId: members[0]?.id || '',
          content: "Hey team! Let's discuss the upcoming tasks for this week.",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          teamId: currentTeam.id,
          userId: members[1]?.id || '',
          content: "I've completed the design mockups. Would love to get your feedback!",
          attachments: [
            {
              type: 'image',
              url: 'https://placekitten.com/300/200',
              name: 'mockup-v1.png',
            },
          ],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
      setMessages(demoMessages);
    }
  }, [currentTeam, members]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() && !attachments.length) return;
    if (!currentTeam || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      teamId: currentTeam.id,
      userId: user.id,
      content: messageInput.trim(),
      createdAt: new Date().toISOString(),
      threadId: selectedThread,
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    setAttachments([]);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    setAttachments([...attachments, ...files]);
  };

  const renderMessage = (message: Message) => {
    const sender = members.find((m) => m.id === message.userId);
    const isCurrentUser = message.userId === user?.id;

    return (
      <div
        key={message.id}
        className={`flex items-start space-x-3 mb-4 ${
          isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''
        }`}
      >
        <Avatar
          src={sender?.avatarUrl}
          fallback={sender?.name.charAt(0) || '?'}
          className="w-8 h-8 flex-shrink-0"
        />
        <div
          className={`max-w-[70%] ${
            isCurrentUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 dark:text-white'
          } rounded-lg p-3`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">
              {sender?.name || 'Unknown User'}
            </span>
            <span className="text-xs opacity-70">
              {format(new Date(message.createdAt), 'HH:mm')}
            </span>
          </div>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          {message.attachments?.map((attachment) => (
            <div
              key={attachment.url}
              className="mt-2 rounded-lg overflow-hidden border dark:border-gray-600"
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="max-w-full h-auto"
                />
              ) : (
                <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800">
                  <Paperclip className="w-4 h-4" />
                  <span className="text-sm truncate">{attachment.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!currentTeam) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Select a team to start chatting
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map(renderMessage)}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <div className="flex items-end space-x-2">
          <div className="flex-1 min-h-[2.5rem] max-h-32 overflow-y-auto bg-gray-50 dark:bg-gray-700 rounded-lg">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              aria-label="Message input"
              className="w-full h-full min-h-[2.5rem] p-2 bg-transparent border-0 focus:ring-0 resize-none"
            />
            {attachments.length > 0 && (
              <div className="p-2 space-y-1">
                {attachments.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white dark:bg-gray-600 p-1 rounded"
                  >
                    <span className="text-sm truncate">{file.name}</span>
                    <button
                      onClick={() =>
                        setAttachments(attachments.filter((_, i) => i !== index))
                      }
                      className="text-red-500 hover:text-red-600"
                    >
                      <CloseIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="file"
              id="file-upload"
              multiple
              className="hidden"
              onChange={handleFileUpload}
            />
            <button
              className="btn-outline sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              title="Attach files"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              className="btn-outline sm"
              onClick={() => {/* TODO: Implement emoji picker */}}
              title="Add emoji"
            >
              <Smile className="w-4 h-4" />
            </button>
            <button
              className="btn-primary sm"
              onClick={handleSendMessage}
              title="Send message"
            >
              <Send className="w-4 h-4 mr-1" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
