import express from 'express';
import {
  getSettings,
  updateSettings,
  addEmailPreset,
  removeEmailPreset,
} from '../controllers/settingsController';
import auth from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(auth);

// Routes
router.route('/')
  .get(getSettings)
  .put(updateSettings);

router.route('/email-presets')
  .post(addEmailPreset);

router.route('/email-presets/:id')
  .delete(removeEmailPreset);

export default router;
