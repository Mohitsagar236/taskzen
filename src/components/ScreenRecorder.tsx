import React from 'react';
import { useRecordingStore } from '../store/recordingStore';
import { Button } from './ui/Button';
import { Video, VideoOff } from 'lucide-react';
import toast from 'react-hot-toast';

interface ScreenRecorderProps {
  taskId: string;
}

export function ScreenRecorder({ taskId }: ScreenRecorderProps) {
  const { isRecording, startRecording, stopRecording } = useRecordingStore();

  const handleStartRecording = async () => {
    try {
      await startRecording(taskId);
      toast.success('Screen recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start screen recording');
    }
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();
      toast.success('Screen recording saved');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop screen recording');
    }
  };

  return (
    <Button
      variant={isRecording ? 'primary' : 'outline'}
      onClick={isRecording ? handleStopRecording : handleStartRecording}
      className="flex items-center"
    >
      {isRecording ? (
        <>
          <VideoOff className="w-4 h-4 mr-2" />
          Stop Recording
        </>
      ) : (
        <>
          <Video className="w-4 h-4 mr-2" />
          Record Screen
        </>
      )}
    </Button>
  );
}