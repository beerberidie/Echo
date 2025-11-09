import mongoose, { Document, Schema } from 'mongoose';

export interface IRecording extends Document {
  title: string;
  duration: number;
  timestamp: Date;
  audioUrl?: string;
  audioFileName?: string;
  audioFileSize?: number;
  audioFormat?: string;
  transcription?: string;
  transcriptionStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  transcriptionError?: string;
  hasSummary: boolean;
  hasMeetingNotes: boolean;
  sharePreferences: {
    includeAudio: boolean;
    includeSummary: boolean;
    includeMeetingNotes: boolean;
  };
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RecordingSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Please provide a duration'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    audioUrl: {
      type: String,
    },
    audioFileName: {
      type: String,
    },
    audioFileSize: {
      type: Number,
    },
    audioFormat: {
      type: String,
    },
    transcription: {
      type: String,
    },
    transcriptionStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    transcriptionError: {
      type: String,
    },
    hasSummary: {
      type: Boolean,
      default: false,
    },
    hasMeetingNotes: {
      type: Boolean,
      default: false,
    },
    sharePreferences: {
      includeAudio: {
        type: Boolean,
        default: true,
      },
      includeSummary: {
        type: Boolean,
        default: false,
      },
      includeMeetingNotes: {
        type: Boolean,
        default: false,
      },
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IRecording>('Recording', RecordingSchema);
