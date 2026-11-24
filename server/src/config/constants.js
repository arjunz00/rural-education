export const ROLES = {
  TEACHER: 'teacher',
  HEADMASTER: 'headmaster',
  ADMIN: 'admin',
  PARENT: 'parent',
  STUDENT: 'student'
};

export const ALL_ROLES = Object.values(ROLES);

export const STAFF_ROLES = [ROLES.TEACHER, ROLES.HEADMASTER, ROLES.ADMIN];
export const FAMILY_ROLES = [ROLES.PARENT, ROLES.STUDENT];

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late'
};

export const INTERVENTION_TYPES = [
  'student_meeting',
  'parent_contact',
  'learning_support',
  'referral',
  'other'
];

export const INTERVENTION_STATUSES = [
  'open',
  'in_progress',
  'resolved'
];

export const ATTENDANCE_OUTCOMES = [
  'improved',
  'steady',
  'declined',
  'insufficient_data'
];

export const RESOURCE_TYPES = ['text', 'audio', 'video', 'textbook', 'notes', 'worksheet'];

export const COMMUNICATION_CATEGORIES = [
  'attendance_alert',
  'academic_feedback',
  'homework',
  'general_notice',
  'urgent_call'
];

export const RISK_THRESHOLDS = {
  MIN_OBSERVATION_DAYS: 10,
  HIGH_RISK_ATTENDANCE_PCT: 60,
  MEDIUM_RISK_ATTENDANCE_PCT: 75,
  CRITICAL_CONSECUTIVE_ABSENT_DAYS: 3
};
