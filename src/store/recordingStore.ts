import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useTaskStore } from './taskStore';

interface RecordingStore {
  isRecording: boolean;
  mediaRecorder: MediaRecorder | null;
  recordingStartTime: number | null;
  startRecording: (taskId: string) => Promise<void>;
  stopRecording: () => Promise<void>;
  uploadRecording: (taskId: string, blob: Blob) => Promise<void>;
}

const getDurationFromBlob = async (blob: Blob): Promise<number> => {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(Math.round(video.duration));
    };

    video.src = URL.createObjectURL(blob);
  });
};

export const useRecordingStore = create<RecordingStore>((set, get) => ({
  isRecording: false,
  mediaRecorder: null,
  recordingStartTime: null,

  startRecording: async (taskId: string) => {
    try {      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await get().uploadRecording(taskId, blob);
        stream.getTracks().forEach(track => track.stop());
      };      mediaRecorder.start();
      set({ 
        mediaRecorder, 
        isRecording: true,
        recordingStartTime: Date.now()
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  },
  stopRecording: async () => {
    const { mediaRecorder } = get();
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      try {
        mediaRecorder.stop();
        
        // Stop all tracks to ensure proper cleanup
        const stream = mediaRecorder.stream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      } finally {
        set({ 
          mediaRecorder: null, 
          isRecording: false,
          recordingStartTime: null
        });
      }
    }
  },
  uploadRecording: async (taskId: string, blob: Blob) => {
    try {      // Try to get accurate duration from the video file
      let duration: number;
      try {
        duration = await getDurationFromBlob(blob);
      } catch (error) {
        // Fallback to calculating duration from start time
        const { recordingStartTime } = get();
        if (!recordingStartTime) throw new Error('Recording start time not found');
        duration = Math.round((Date.now() - recordingStartTime) / 1000);
      }
      const filename = `recording-${taskId}-${Date.now()}.webm`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('recordings')
        .upload(filename, blob);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('recordings')
        .getPublicUrl(filename);

      // Save recording metadata
      const { error: dbError } = await supabase
        .from('screen_recordings')
        .insert({
          task_id: taskId,
          url: publicUrl,
          duration: duration,
        });

      if (dbError) throw dbError;

      // Update task with recording URL
      const updateTask = useTaskStore.getState().updateTask;      await updateTask(taskId, {
        recording_url: publicUrl,
        recording_duration: duration
      });
    } catch (error) {
      console.error('Error uploading recording:', error);
      throw error;
    }
  },
}));