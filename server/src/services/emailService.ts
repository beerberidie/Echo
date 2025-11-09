import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { IRecording } from '../models/Recording';

// Email configuration
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || 'echo@example.com';

/**
 * Create a nodemailer transporter
 * @returns Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });
};

/**
 * Generate HTML email content for a recording
 * @param recording Recording to share
 * @param userName Name of the user sharing the recording
 * @param includeAudio Whether to include audio in the email
 * @param includeSummary Whether to include summary in the email
 * @param includeMeetingNotes Whether to include meeting notes in the email
 * @returns HTML email content
 */
const generateEmailContent = (
  recording: IRecording,
  userName: string,
  includeAudio: boolean,
  includeSummary: boolean,
  includeMeetingNotes: boolean
): string => {
  const formattedDate = new Date(recording.timestamp).toLocaleString();
  const duration = formatDuration(recording.duration);

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; }
        .recording-info { margin-bottom: 20px; }
        .section { margin-bottom: 25px; border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; }
        .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; color: #4f46e5; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Echo Recording Shared</h1>
      </div>
      <div class="content">
        <p>${userName} has shared a voice recording with you.</p>
        
        <div class="recording-info">
          <h2>${recording.title}</h2>
          <p>Duration: ${duration} • Recorded on: ${formattedDate}</p>
        </div>
  `;

  // Add transcription if available
  if (recording.transcription) {
    html += `
        <div class="section">
          <div class="section-title">Transcription</div>
          <p>${recording.transcription.replace(/\\n/g, '<br>')}</p>
        </div>
    `;
  }

  // Add summary if available and requested
  if (includeSummary && recording.hasSummary) {
    html += `
        <div class="section">
          <div class="section-title">Summary</div>
          <p>This recording has been summarized. Please check the attached summary or view it in the Echo app.</p>
        </div>
    `;
  }

  // Add meeting notes if available and requested
  if (includeMeetingNotes && recording.hasMeetingNotes) {
    html += `
        <div class="section">
          <div class="section-title">Meeting Notes</div>
          <p>Meeting notes have been generated for this recording. Please check the attached notes or view them in the Echo app.</p>
        </div>
    `;
  }

  // Close the HTML
  html += `
        <p>This recording was shared from the Echo Voice Recording App.</p>
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} Echo Voice Recording App</p>
      </div>
    </body>
    </html>
  `;

  return html;
};

/**
 * Format duration in seconds to a readable string
 * @param seconds Duration in seconds
 * @returns Formatted duration string
 */
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Send an email with a recording
 * @param to Email address to send to
 * @param recording Recording to share
 * @param userId User ID of the sender
 * @param userName Name of the sender
 * @param options Options for what to include in the email
 * @returns Promise that resolves when the email is sent
 */
export const sendRecordingEmail = async (
  to: string,
  recording: IRecording,
  userId: string,
  userName: string,
  options: {
    includeAudio: boolean;
    includeSummary: boolean;
    includeMeetingNotes: boolean;
  }
): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if SMTP is configured
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP is not configured. Please set SMTP_USER and SMTP_PASS environment variables.');
    }

    const transporter = createTransporter();
    
    // Generate email content
    const html = generateEmailContent(
      recording,
      userName,
      options.includeAudio,
      options.includeSummary,
      options.includeMeetingNotes
    );

    // Set up email data
    const mailOptions: any = {
      from: `"Echo App" <${SMTP_FROM}>`,
      to,
      subject: `Voice Recording: ${recording.title}`,
      html,
      attachments: [],
    };

    // Add audio attachment if requested
    if (options.includeAudio && recording.audioFileName) {
      const audioFilePath = path.join(__dirname, '../../../storage/recordings', userId, recording.audioFileName);
      
      if (fs.existsSync(audioFilePath)) {
        mailOptions.attachments.push({
          filename: `${recording.title}.${recording.audioFormat || 'webm'}`,
          content: fs.createReadStream(audioFilePath),
        });
      }
    }

    // Send the email
    await transporter.sendMail(mailOptions);

    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error sending email' 
    };
  }
};

export default {
  sendRecordingEmail,
};
