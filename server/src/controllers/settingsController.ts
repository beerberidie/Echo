import { Request, Response, NextFunction } from 'express';
import Settings, { ISettings } from '../models/Settings';

// @desc    Get user settings
// @route   GET /api/settings
// @access  Private
export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    // If settings don't exist, create default settings
    if (!settings) {
      settings = await Settings.create({
        emailPresets: [],
        theme: 'light',
        user: req.user._id,
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await Settings.findOne({ user: req.user._id });

    // If settings don't exist, create them
    if (!settings) {
      settings = await Settings.create({
        ...req.body,
        user: req.user._id,
      });
    } else {
      // Update existing settings
      settings = await Settings.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add email preset
// @route   POST /api/settings/email-presets
// @access  Private
export const addEmailPreset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an email',
      });
    }

    let settings = await Settings.findOne({ user: req.user._id });

    // If settings don't exist, create them
    if (!settings) {
      settings = await Settings.create({
        emailPresets: [{ email }],
        theme: 'light',
        user: req.user._id,
      });
    } else {
      // Check if email already exists in presets
      const emailExists = settings.emailPresets.some(
        (preset) => preset.email === email
      );

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: 'Email preset already exists',
        });
      }

      // Add new email preset
      settings.emailPresets.push({ email });
      await settings.save();
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove email preset
// @route   DELETE /api/settings/email-presets/:id
// @access  Private
export const removeEmailPreset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await Settings.findOne({ user: req.user._id });

    if (!settings) {
      return res.status(404).json({
        success: false,
        error: 'Settings not found',
      });
    }

    // Remove email preset by ID
    settings.emailPresets = settings.emailPresets.filter(
      (preset) => preset._id.toString() !== req.params.id
    );

    await settings.save();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};
