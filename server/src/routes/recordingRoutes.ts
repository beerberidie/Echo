import express from 'express';
import {
  getRecordings,
  getRecording,
  createRecording,
  updateRecording,
  deleteRecording,
  deleteAllRecordings,
  getAudioFile,
  getTranscriptionStatus,
  retryTranscription,
} from '../controllers/recordingController';
import auth from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(auth);

// Routes
router.route('/')
  .get(getRecordings)
  .post(createRecording)
  .delete(deleteAllRecordings);

router.route('/:id')
  .get(getRecording)
  .put(updateRecording)
  .delete(deleteRecording);

// Transcription routes
router.route('/:id/transcription')
  .get(getTranscriptionStatus);

router.route('/:id/transcription/retry')
  .post(retryTranscription);

// Audio file route
router.route('/audio/:userId/:fileName')
  .get(getAudioFile);

export default router;
