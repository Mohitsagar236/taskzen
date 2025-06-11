import React, { useState } from 'react';
import { useTeamStore } from '../../store/teamStore';
import { Button } from '../ui/Button';
import { Calendar as CalendarIcon, Clock, FileText, Globe, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Meeting {
  id: string;
  title: string;
  description: string;
  startTime: string;
  duration: number;
  attendees: string[];
  meetingLink?: string;
  documents?: {
    name: string;
    url: string;
  }[];
}

export function TeamMeetings() {
  const { currentTeam, members } = useTeamStore();
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: '1',
      title: 'Weekly Team Sync',
      description: 'Review progress and discuss upcoming tasks',
      startTime: '2025-05-20T10:00:00',
      duration: 60,
      attendees: members.map(m => m.id),
      meetingLink: 'https://meet.example.com/team-sync',
      documents: [
        { name: 'Agenda.pdf', url: '#' },
        { name: 'Project Update.pptx', url: '#' }
      ]
    },
    {
      id: '2',
      title: 'Design Review',
      description: 'Review new feature designs and collect feedback',
      startTime: '2025-05-21T14:30:00',
      duration: 45,
      attendees: members.filter(m => m.role === 'admin' || m.role === 'editor').map(m => m.id),
      meetingLink: 'https://meet.example.com/design-review'
    }
  ]);

  const handleCreateMeeting = () => {
    // TODO: Implement create meeting modal
  };

  const handleJoinMeeting = (meetingLink: string) => {
    window.open(meetingLink, '_blank');
  };

  if (!currentTeam) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">
          Select a team to view meetings
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Meetings</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Schedule and manage team meetings
          </p>
        </div>
        <Button onClick={handleCreateMeeting}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Meetings List */}
      <div className="grid gap-4">
        {meetings.map((meeting) => {
          const startDate = new Date(meeting.startTime);
          const attendeesList = members.filter(m => meeting.attendees.includes(m.id));

          return (
            <div
              key={meeting.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{meeting.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    {meeting.description}
                  </p>
                </div>
                {meeting.meetingLink && (
                  <Button
                    onClick={() => handleJoinMeeting(meeting.meetingLink!)}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    <Globe className="w-4 h-4 mr-2" />
                    Join Meeting
                  </Button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {format(startDate, 'MMM d, yyyy')}
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4 mr-2" />
                  {format(startDate, 'HH:mm')} ({meeting.duration} min)
                </div>
                <div className="flex items-center text-gray-500 dark:text-gray-400">
                  <Users className="w-4 h-4 mr-2" />
                  {attendeesList.length} attendees
                </div>
                {meeting.documents && (
                  <div className="flex items-center text-gray-500 dark:text-gray-400">
                    <FileText className="w-4 h-4 mr-2" />
                    {meeting.documents.length} documents
                  </div>
                )}
              </div>

              {/* Attendees */}
              <div className="mt-4">
                <div className="flex -space-x-2">
                  {attendeesList.slice(0, 5).map((member) => (
                    <div
                      key={member.id}
                      className="relative"
                      title={member.name}
                    >
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-gray-800"
                      />
                    </div>
                  ))}
                  {attendeesList.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        +{attendeesList.length - 5}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Documents */}
              {meeting.documents && meeting.documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  {meeting.documents.map((doc) => (
                    <a
                      key={doc.name}
                      href={doc.url}
                      className="flex items-center p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                    >
                      <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {doc.name}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
