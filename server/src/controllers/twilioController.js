import {
  processInboundWebhook,
  processStatusCallback,
  simulateInboundParentReply,
  dispatchTwilioSMS
} from '../services/twilioService.js';
import { Student } from '../models/Student.js';

/**
 * POST /api/twilio/webhook
 * Handles incoming Twilio WhatsApp/SMS webhooks from parents' mobile phones
 */
export const handleTwilioWebhook = async (req, res, next) => {
  try {
    const from = req.body.From || req.query.From || '';
    const to = req.body.To || req.query.To || '';
    const body = req.body.Body || req.query.Body || '';
    const messageSid = req.body.MessageSid || req.body.SmsSid || req.query.MessageSid || '';

    if (!from || !body) {
      return res.status(400).send('Missing From or Body parameter.');
    }

    const result = await processInboundWebhook({
      from,
      to,
      body,
      messageSid
    });

    res.set('Content-Type', 'text/xml');
    return res.status(200).send(result.twiml);
  } catch (err) {
    console.error('[Twilio Inbound Webhook Error]:', err);
    res.set('Content-Type', 'text/xml');
    return res.status(200).send('<Response></Response>');
  }
};

/**
 * POST /api/twilio/status-callback
 * Receives delivery updates from Twilio (queued -> sent -> delivered -> read)
 */
export const handleTwilioStatusCallback = async (req, res, next) => {
  try {
    const messageSid = req.body.MessageSid || req.body.SmsSid || req.query.MessageSid;
    const messageStatus = req.body.MessageStatus || req.body.SmsStatus || req.query.MessageStatus;
    const to = req.body.To || req.query.To;

    const updated = await processStatusCallback({
      messageSid,
      messageStatus,
      to
    });

    return res.status(200).json({
      success: true,
      messageSid,
      status: messageStatus,
      updated: Boolean(updated)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/twilio/simulate-inbound
 * Allows teachers, headmasters, or test scripts to simulate an inbound parent reply
 */
export const handleSimulateInbound = async (req, res, next) => {
  try {
    const { studentId, messageText } = req.body;

    const result = await simulateInboundParentReply({
      studentId: studentId || 801,
      messageText
    });

    return res.status(200).json({
      success: true,
      message: 'Inbound message simulated successfully and broadcasted in real time via Socket.IO!',
      data: {
        student: {
          numericId: result.student.numericId,
          fullName: result.student.fullName,
          parentName: result.student.parentName,
          className: result.student.className
        },
        communication: result.communication,
        whatsAppLog: result.whatsAppLog
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/twilio/send-sms
 * Staff endpoint to dispatch direct SMS alert
 */
export const handleSendSMS = async (req, res, next) => {
  try {
    const { studentId, messageBody, toPhone } = req.body;

    let targetPhone = toPhone;
    if (!targetPhone && studentId) {
      const student = await Student.findOne({ numericId: Number(studentId) });
      if (!student) {
        return res.status(404).json({ success: false, error: 'Student not found.' });
      }
      targetPhone = student.parentContact;
    }

    if (!targetPhone || !messageBody) {
      return res.status(400).json({
        success: false,
        error: 'Please provide recipient phone number or studentId and messageBody.'
      });
    }

    const dispatchResult = await dispatchTwilioSMS({
      toPhone: targetPhone,
      messageBody,
      studentId
    });

    return res.status(200).json({
      success: true,
      message: 'SMS dispatched successfully via Twilio Gateway.',
      result: dispatchResult
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/twilio/config
 * Returns active Twilio configuration state (without exposing secrets)
 */
export const getTwilioConfig = (req, res) => {
  const isConfigured = Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
  return res.status(200).json({
    success: true,
    provider: process.env.TWILIO_PROVIDER || (isConfigured ? 'twilio' : 'sandbox'),
    isLiveTwilioConfigured: isConfigured,
    twilioPhoneNumber: process.env.TWILIO_PHONE_NUMBER ? `${process.env.TWILIO_PHONE_NUMBER.substring(0, 4)}***` : 'Sandbox +14155238886',
    whatsAppNumber: process.env.TWILIO_WHATSAPP_NUMBER ? `${process.env.TWILIO_WHATSAPP_NUMBER.substring(0, 13)}***` : 'whatsapp:+14155238886',
    realtimeSocketEnabled: true
  });
};
