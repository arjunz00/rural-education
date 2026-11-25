import { Student } from '../models/Student.js';
import { Communication } from '../models/Communication.js';
import { WhatsAppLog } from '../models/WhatsAppLog.js';
import { broadcastToStudent, broadcastToClass, broadcastToAll } from '../socket.js';
import { sanitizeIndianPhoneNumber } from './whatsappService.js';

/**
 * Dispatch Twilio SMS with status callback
 */
export const dispatchTwilioSMS = async ({ toPhone, messageBody, studentId }) => {
  const sanitizedTo = sanitizeIndianPhoneNumber(toPhone);
  if (!sanitizedTo) {
    throw new Error(`Invalid mobile phone number: '${toPhone}'`);
  }

  const provider = process.env.TWILIO_PROVIDER || process.env.WHATSAPP_PROVIDER || 'sandbox';

  if (provider === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      const fromNumber = process.env.TWILIO_PHONE_NUMBER || '+14155238886';
      const authHeader = 'Basic ' + Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');

      const bodyParams = new URLSearchParams();
      bodyParams.append('From', fromNumber);
      bodyParams.append('To', `+${sanitizedTo}`);
      bodyParams.append('Body', messageBody);
      if (process.env.TWILIO_STATUS_CALLBACK) {
        bodyParams.append('StatusCallback', process.env.TWILIO_STATUS_CALLBACK);
      }

      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: bodyParams.toString()
        }
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Twilio SMS rejected dispatch');
      }

      return {
        success: true,
        provider: 'twilio',
        deliveryStatus: 'sent',
        messageSid: data.sid || `TW-SMS-${Date.now()}`,
        recipient: sanitizedTo
      };
    } catch (err) {
      console.warn('[Twilio SMS Gateway Notice]:', err.message, '- Using sandbox delivery log.');
    }
  }

  // Resilient Sandbox Mode (Zero Cost, Instant Delivery Emulation)
  const mockSid = `TW-SMS-MOCK-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  console.log(`[Twilio SMS Sandbox Gateway] Dispatched to +${sanitizedTo}:`);
  console.log(`  > Message SID: ${mockSid}`);
  console.log(`  > Body: "${messageBody.substring(0, 80)}..."`);

  return {
    success: true,
    provider: 'sandbox',
    deliveryStatus: 'sent',
    messageSid: mockSid,
    recipient: sanitizedTo
  };
};

/**
 * Inbound Twilio Webhook Processor
 * Handles incoming WhatsApp/SMS messages sent by parents from their real mobile phones
 */
export const processInboundWebhook = async ({ from, to, body, messageSid }) => {
  const cleanPhone = sanitizeIndianPhoneNumber(from);
  const phoneSuffix = cleanPhone ? cleanPhone.slice(-10) : '';

  // Match parent/student by phone number (last 10 digits match)
  let student = null;
  if (phoneSuffix) {
    student = await Student.findOne({
      parentContact: new RegExp(phoneSuffix)
    });
  }

  // Fallback if not matched: check by standard test student
  if (!student) {
    student = await Student.findOne({ numericId: 801 });
  }

  const parentName = student ? student.parentName : 'Parent/Guardian';
  const studentName = student ? student.fullName : 'Learner';
  const classLevel = student ? Number(student.className) : 8;
  const studentNumericId = student ? student.numericId : 801;

  // 1. Record in Communication ledger
  const comm = await Communication.create({
    studentId: studentNumericId,
    senderTeacherId: null,
    senderTeacherName: `${parentName} (Parent)`,
    senderRole: 'parent',
    classLevel: classLevel,
    title: `💬 Inbound Mobile Message from ${parentName}`,
    messageText: body,
    category: 'parent_reply',
    isUrgent: /urgent|emergency|sick|fever|hospital|accident/i.test(body),
    readStatus: false
  });

  // 2. Record in WhatsAppLog
  const waLog = await WhatsAppLog.create({
    studentId: studentNumericId,
    studentName: studentName,
    classLevel: classLevel,
    parentName: parentName,
    parentPhone: cleanPhone || '919822144801',
    templateType: 'teacher_notice',
    messageBody: `[INBOUND MOBILE REPLY]: ${body}`,
    deliveryStatus: 'delivered',
    triggeredBy: parentName,
    providerMessageId: messageSid || `INBOUND-${Date.now()}`,
    sentAt: new Date()
  });

  // 3. Real-Time Broadcast via Socket.IO
  const realtimePayload = {
    messageSid: messageSid || `INBOUND-${Date.now()}`,
    studentId: studentNumericId,
    studentName: studentName,
    parentName: parentName,
    classLevel: classLevel,
    body: body,
    isUrgent: comm.isUrgent,
    communicationId: comm._id,
    timestamp: new Date().toISOString()
  };

  broadcastToStudent(studentNumericId, 'inbound_parent_message', realtimePayload);
  broadcastToClass(classLevel, 'inbound_parent_message', realtimePayload);
  broadcastToAll('inbound_parent_message', realtimePayload);

  // Return standard TwiML response
  return {
    student,
    communication: comm,
    whatsAppLog: waLog,
    twiml: `<?xml version="1.0" encoding="UTF-8"?><Response><Message>🙏 Namaste ${parentName}. Zilla Parishad High School, Dahiwadi has received your message regarding ${studentName}. Class Teacher will review shortly.</Message></Response>`
  };
};

/**
 * Process Twilio Delivery Status Callbacks (queued -> sent -> delivered -> read)
 */
export const processStatusCallback = async ({ messageSid, messageStatus, to }) => {
  if (!messageSid) return null;

  // Map Twilio statuses to our standardized deliveryStatus enum
  let mappedStatus = 'sent';
  if (['delivered', 'read'].includes(messageStatus)) {
    mappedStatus = 'delivered';
  } else if (['failed', 'undelivered'].includes(messageStatus)) {
    mappedStatus = 'failed';
  }

  const updatedLog = await WhatsAppLog.findOneAndUpdate(
    { providerMessageId: messageSid },
    { $set: { deliveryStatus: mappedStatus } },
    { new: true }
  );

  // Broadcast real-time delivery update via Socket.IO
  broadcastToAll('whatsapp_status_update', {
    messageSid,
    deliveryStatus: mappedStatus,
    rawStatus: messageStatus,
    timestamp: new Date().toISOString()
  });

  return updatedLog;
};

/**
 * Simulate an inbound parent reply (For zero-cost testing and UI verification)
 */
export const simulateInboundParentReply = async ({ studentId = 801, messageText }) => {
  const student = await Student.findOne({ numericId: Number(studentId) });
  if (!student) {
    throw new Error(`Student with ID #${studentId} not found.`);
  }

  const mockSid = `SM-SIMULATED-${Date.now()}`;
  const incomingPhone = student.parentContact || '+91 98221 44801';

  return await processInboundWebhook({
    from: incomingPhone,
    to: process.env.TWILIO_PHONE_NUMBER || '+14155238886',
    body: messageText || `Namaste Sir, this is ${student.parentName}. ${student.fullName} was unwell today, will send to school tomorrow.`,
    messageSid: mockSid
  });
};
