import mongoose, { Document, Schema } from 'mongoose';

export interface IEmailPreset {
  email: string;
}

export interface ISettings extends Document {
  emailPresets: IEmailPreset[];
  theme: 'light' | 'dark' | 'system';
  user: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EmailPresetSchema = new Schema({
  email: {
    type: String,
    required: true,
    match: [
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please provide a valid email',
    ],
  },
});

const SettingsSchema: Schema = new Schema(
  {
    emailPresets: [EmailPresetSchema],
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>('Settings', SettingsSchema);
