import { Request, Response, NextFunction } from 'express';
import Recording, { IRecording } from '../models/Recording';
import storageService from '../services/storageService';
import transcriptionService from '../services/transcriptionService';

// @desc    Get all recordings for a user
// @route   GET /api/recordings
// @access  Private
export const getRecordings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recordings = await Recording.find({ user: req.user._id }).sort({ timestamp: -1 });

    res.status(200).json({
      success: true,
      count: recordings.length,
      data: recordings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single recording
// @route   GET /api/recordings/:id
// @access  Private
export const getRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    res.status(200).json({
      success: true,
      data: recording,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new recording
// @route   POST /api/recordings
// @access  Private
export const createRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Add user to request body
    req.body.user = req.user._id;

    // Handle audio file if provided
    if (req.body.audioData) {
      try {
        // Extract file format from the base64 data or use default
        const fileFormat = req.body.audioFormat || 'webm';

        // Save the audio file
        const fileInfo = storageService.saveAudioFile(
          req.user._id.toString(),
          req.body.audioData,
          fileFormat
        );

        // Update request body with file information
        req.body.audioUrl = fileInfo.fileUrl;
        req.body.audioFileName = fileInfo.fileName;
        req.body.audioFileSize = Buffer.from(req.body.audioData.replace(/^data:audio\/\w+;base64,/, ''), 'base64').length;
        req.body.audioFormat = fileFormat;

        // Remove the base64 data from the request body to avoid storing it in the database
        delete req.body.audioData;
      } catch (fileError) {
        console.error('Error saving audio file:', fileError);
        return res.status(400).json({
          success: false,
          error: 'Failed to save audio file',
        });
      }
    }

    // Set initial transcription status if audio is provided
    if (req.body.audioUrl) {
      req.body.transcriptionStatus = 'pending';
    }

    const recording = await Recording.create(req.body);

    // If the recording has an audio file, trigger transcription
    if (recording.audioFileName) {
      // Start transcription process in the background
      // We don't await this to avoid blocking the response
      transcriptionService.processRecordingTranscription(recording, req.user._id.toString())
        .catch(err => console.error('Background transcription error:', err));
    }

    res.status(201).json({
      success: true,
      data: recording,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a recording
// @route   PUT /api/recordings/:id
// @access  Private
export const updateRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    recording = await Recording.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: recording,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a recording
// @route   DELETE /api/recordings/:id
// @access  Private
export const deleteRecording = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    // Delete the audio file if it exists
    if (recording.audioFileName) {
      try {
        const deleted = storageService.deleteAudioFile(
          req.user._id.toString(),
          recording.audioFileName
        );

        if (!deleted) {
          console.warn(`Audio file not found or could not be deleted: ${recording.audioFileName}`);
        }
      } catch (fileError) {
        console.error('Error deleting audio file:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    await recording.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transcription status for a recording
// @route   GET /api/recordings/:id/transcription
// @access  Private
export const getTranscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    // Return the transcription status
    res.status(200).json({
      success: true,
      data: {
        id: recording._id,
        transcriptionStatus: recording.transcriptionStatus || 'none',
        transcription: recording.transcription || null,
        transcriptionError: recording.transcriptionError || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retry transcription for a recording
// @route   POST /api/recordings/:id/transcription/retry
// @access  Private
export const retryTranscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recording = await Recording.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found',
      });
    }

    // Check if the recording has an audio file
    if (!recording.audioFileName) {
      return res.status(400).json({
        success: false,
        error: 'No audio file available for transcription',
      });
    }

    // Update status to pending
    recording.transcriptionStatus = 'pending';
    recording.transcriptionError = undefined;
    await recording.save();

    // Start transcription process in the background
    transcriptionService.processRecordingTranscription(recording, req.user._id.toString())
      .catch(err => console.error('Background transcription retry error:', err));

    // Return the updated status
    res.status(200).json({
      success: true,
      data: {
        id: recording._id,
        transcriptionStatus: 'pending',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get audio file for a recording
// @route   GET /api/recordings/audio/:userId/:fileName
// @access  Private
export const getAudioFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId, fileName } = req.params;

    // Security check: Users can only access their own files
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to audio file',
      });
    }

    try {
      const audioBuffer = storageService.getAudioFile(userId, fileName);

      // Set appropriate content type based on file extension
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      let contentType = 'audio/webm'; // Default

      if (fileExtension === 'mp3') {
        contentType = 'audio/mpeg';
      } else if (fileExtension === 'wav') {
        contentType = 'audio/wav';
      } else if (fileExtension === 'ogg') {
        contentType = 'audio/ogg';
      }

      res.set('Content-Type', contentType);
      return res.send(audioBuffer);
    } catch (fileError) {
      console.error('Error getting audio file:', fileError);
      return res.status(404).json({
        success: false,
        error: 'Audio file not found',
      });
    }
  } catch (error) {
    next(error);
  }
};

export const deleteAllRecordings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Delete all audio files for the user
    try {
      const deleted = storageService.deleteAllUserAudioFiles(req.user._id.toString());

      if (!deleted) {
        console.warn(`Failed to delete all audio files for user: ${req.user._id}`);
      }
    } catch (fileError) {
      console.error('Error deleting all audio files:', fileError);
      // Continue with deletion even if file deletion fails
    }

    await Recording.deleteMany({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
