import { Router } from 'express';
import {
  handleTwilioWebhook,
  handleTwilioStatusCallback,
  handleSimulateInbound,
  handleSendSMS,
  getTwilioConfig
} from '../controllers/twilioController.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireStaff } from '../middleware/rbac.js';

const router = Router();

// Twilio Public Webhooks (Called directly by Twilio Gateway servers)
router.post('/webhook', handleTwilioWebhook);
router.get('/webhook', handleTwilioWebhook); // Twilio allows GET fallback
router.post('/status-callback', handleTwilioStatusCallback);

// Authenticated Twilio & Real-Time API routes
router.use(authenticateToken);

router.get('/config', getTwilioConfig);
router.post('/simulate-inbound', requireStaff, handleSimulateInbound);
router.post('/send-sms', requireStaff, handleSendSMS);

export default router;
