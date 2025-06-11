interface RecordingStore {
    isRecording: boolean;
    mediaRecorder: MediaRecorder | null;
    recordingStartTime: number | null;
    startRecording: (taskId: string) => Promise<void>;
    stopRecording: () => Promise<void>;
    uploadRecording: (taskId: string, blob: Blob) => Promise<void>;
}
export declare const useRecordingStore: import("zustand").UseBoundStore<import("zustand").StoreApi<RecordingStore>>;
export {};
