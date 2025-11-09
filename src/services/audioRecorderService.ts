/**
 * Audio Recorder Service
 * Handles browser audio recording functionality
 */

class AudioRecorderService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  /**
   * Start recording audio
   * @returns Promise that resolves when recording starts
   */
  async startRecording(): Promise<void> {
    try {
      // Request microphone access
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create media recorder
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];
      
      // Set up data handler
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };
      
      // Start recording
      this.mediaRecorder.start();
      
      console.log('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to start recording. Please check microphone permissions.');
    }
  }

  /**
   * Stop recording audio
   * @returns Promise that resolves with the recorded audio blob
   */
  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        // Create a single blob from all the chunks
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks in the stream
        if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
          this.stream = null;
        }
        
        console.log('Recording stopped, blob size:', audioBlob.size);
        resolve(audioBlob);
      };

      // Stop the recorder
      this.mediaRecorder.stop();
    });
  }

  /**
   * Pause recording
   */
  pauseRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      console.log('Recording paused');
    }
  }

  /**
   * Resume recording
   */
  resumeRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      console.log('Recording resumed');
    }
  }

  /**
   * Convert audio blob to base64 string
   * @param blob Audio blob
   * @returns Promise that resolves with base64 string
   */
  blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Get recording state
   * @returns Current state of the media recorder
   */
  getRecordingState(): string {
    return this.mediaRecorder ? this.mediaRecorder.state : 'inactive';
  }

  /**
   * Check if browser supports audio recording
   * @returns Boolean indicating if recording is supported
   */
  isRecordingSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}

export default new AudioRecorderService();
