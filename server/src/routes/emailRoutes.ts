import express from 'express';
import { sendRecordingEmail, validateSmtpConfig } from '../controllers/emailController';
import auth from '../middleware/auth';

const router = express.Router();

// Protect all routes
router.use(auth);

// Routes
router.route('/recording/:id')
  .post(sendRecordingEmail);

router.route('/validate-config')
  .get(validateSmtpConfig);

export default router;
