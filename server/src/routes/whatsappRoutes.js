import { Router } from 'express';
import {
  sendWhatsAppNotification,
  sendBulkAbsenceAlerts,
  getWhatsAppLogs,
  getWhatsAppSummary,
  getClickToChatLink
} from '../controllers/whatsappController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

import {
  handleTwilioWebhook,
  handleTwilioStatusCallback
} from '../controllers/twilioController.js';

const router = Router();

// Public Twilio Webhooks
router.post('/webhook', handleTwilioWebhook);
router.post('/status-callback', handleTwilioStatusCallback);

router.use(authenticateToken);

router.post('/send', requireStaff, sendWhatsAppNotification);
router.post('/bulk-absence-alerts', requireStaff, sendBulkAbsenceAlerts);
router.get('/logs', getWhatsAppLogs);
router.get('/summary', requireStaff, getWhatsAppSummary);
router.get('/logs/summary', requireStaff, getWhatsAppSummary);
router.get('/link', getClickToChatLink);

export default router;
