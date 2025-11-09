import { Request, Response, NextFunction } from 'express';
import Recording from '../models/Recording';
import emailService from '../services/emailService';

// @desc    Send a recording via email
// @route   POST /api/email/recording/:id
// @access  Private
export const sendRecordingEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Validate email
    if (!email || !validateEmail(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address',
      });
    }

    // Find the recording
    const recording = await Recording.findOne({
      _id: id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    // Get share preferences
    const includeAudio = recording.sharePreferences?.includeAudio ?? true;
    const includeSummary = recording.sharePreferences?.includeSummary ?? false;
    const includeMeetingNotes = recording.sharePreferences?.includeMeetingNotes ?? false;

    // Send the email
    const result = await emailService.sendRecordingEmail(
      email,
      recording,
      req.user._id.toString(),
      req.user.name,
      {
        includeAudio,
        includeSummary,
        includeMeetingNotes,
      }
    );

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Email sent successfully',
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Validate SMTP configuration
// @route   GET /api/email/validate-config
// @access  Private
export const validateSmtpConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return res.status(200).json({
        success: false,
        configured: false,
        message: 'SMTP is not configured. Please set SMTP_USER and SMTP_PASS environment variables.',
      });
    }

    res.status(200).json({
      success: true,
      configured: true,
      message: 'SMTP is configured',
      config: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: maskEmail(smtpUser),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate email format
 * @param email Email to validate
 * @returns Boolean indicating if email is valid
 */
const validateEmail = (email: string): boolean => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

/**
 * Mask email for security
 * @param email Email to mask
 * @returns Masked email
 */
const maskEmail = (email: string): string => {
  const [username, domain] = email.split('@');
  const maskedUsername = username.charAt(0) + '*'.repeat(username.length - 2) + username.charAt(username.length - 1);
  return `${maskedUsername}@${domain}`;
};

export default {
  sendRecordingEmail,
  validateSmtpConfig,
};
