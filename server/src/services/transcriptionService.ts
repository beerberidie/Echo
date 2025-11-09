import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { IRecording } from '../models/Recording';

// Configuration
const SPEECH_TO_TEXT_API_URL = process.env.SPEECH_TO_TEXT_API_URL || 'http://localhost:5002/transcribe';
const SPEECH_TO_TEXT_MODEL = process.env.SPEECH_TO_TEXT_MODEL || 'base';
const SPEECH_TO_TEXT_LANGUAGE = process.env.SPEECH_TO_TEXT_LANGUAGE || 'english';

/**
 * Transcribe an audio file using the SpeechToText API
 * @param recording The recording document to transcribe
 * @param userId The user ID
 * @returns Promise that resolves with the transcription result
 */
export const transcribeAudio = async (recording: IRecording, userId: string): Promise<string> => {
  try {
    // Check if recording has an audio file
    if (!recording.audioFileName) {
      throw new Error('No audio file available for transcription');
    }

    // Get the file path
    const userDir = path.join(__dirname, '../../../storage/recordings', userId);
    const filePath = path.join(userDir, recording.audioFileName);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found at path: ${filePath}`);
    }

    // Create form data
    const formData = new FormData();
    formData.append('audio', fs.createReadStream(filePath));
    
    // Set request parameters
    const params = {
      model: SPEECH_TO_TEXT_MODEL,
      language: SPEECH_TO_TEXT_LANGUAGE,
      task: 'transcribe'
    };

    console.log(`Sending transcription request for recording ${recording._id} to ${SPEECH_TO_TEXT_API_URL}`);
    
    // Send request to SpeechToText API
    const response = await axios.post(SPEECH_TO_TEXT_API_URL, formData, {
      params,
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    // Check if transcription was successful
    if (response.data && response.data.transcription) {
      console.log(`Transcription successful for recording ${recording._id}`);
      return response.data.transcription;
    } else {
      throw new Error('Transcription API did not return a valid response');
    }
  } catch (error) {
    console.error('Transcription error:', error);
    throw error;
  }
};

/**
 * Process a recording for transcription
 * @param recording The recording document to process
 * @param userId The user ID
 * @returns Promise that resolves when processing is complete
 */
export const processRecordingTranscription = async (recording: IRecording, userId: string): Promise<void> => {
  try {
    // Update recording status to processing
    recording.transcriptionStatus = 'processing';
    await recording.save();

    // Attempt transcription
    const transcription = await transcribeAudio(recording, userId);

    // Update recording with transcription
    recording.transcription = transcription;
    recording.transcriptionStatus = 'completed';
    await recording.save();

    console.log(`Transcription completed for recording ${recording._id}`);
  } catch (error) {
    console.error(`Transcription processing error for recording ${recording._id}:`, error);
    
    // Update recording with error
    recording.transcriptionStatus = 'failed';
    recording.transcriptionError = error instanceof Error ? error.message : 'Unknown transcription error';
    await recording.save();
  }
};

export default {
  transcribeAudio,
  processRecordingTranscription
};
