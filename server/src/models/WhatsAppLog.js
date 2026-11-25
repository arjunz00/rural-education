import mongoose from 'mongoose';

const whatsAppLogSchema = new mongoose.Schema(
  {
    studentId: {
      type: Number,
      required: true,
      index: true
    },
    studentName: {
      type: String,
      required: true,
      trim: true
    },
    classLevel: {
      type: Number,
      required: true,
      index: true
    },
    parentName: {
      type: String,
      required: true,
      trim: true
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true
    },
    templateType: {
      type: String,
      enum: ['daily_absence', 'consecutive_absence_alert', 'marksheet_summary', 'teacher_notice', 'attendance_appreciation', 'custom'],
      required: true,
      index: true
    },
    messageBody: {
      type: String,
      required: true
    },
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'queued'],
      default: 'sent',
      index: true
    },
    triggeredBy: {
      type: String,
      default: 'System Automated Rule'
    },
    providerMessageId: {
      type: String,
      default: null
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: true
  }
);

whatsAppLogSchema.index({ studentId: 1, sentAt: -1 });

export const WhatsAppLog = mongoose.model('WhatsAppLog', whatsAppLogSchema);
