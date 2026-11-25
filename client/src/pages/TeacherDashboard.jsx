import React, { useState, useEffect } from 'react';
import {
  studentsAPI,
  attendanceAPI,
  riskAPI,
  interventionsAPI,
  communicationsAPI,
  teacherAPI,
  whatsappAPI,
  twilioAPI
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';
import {
  initSocket,
  joinClassRoom,
  onInboundParentMessage,
  onWhatsAppStatusUpdate
} from '../services/socket';

export const TeacherDashboard = () => {
  const { currentUser } = useAuth();
  const defaultClass = currentUser?.assignedClass ? String(currentUser.assignedClass) : '8';

  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [students, setStudents] = useState([]);
  const [pendingStudents, setPendingStudents] = useState([]);
  const [enrollmentActionMsg, setEnrollmentActionMsg] = useState(null);
  const [attendanceDate, setAttendanceDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rollCall, setRollCall] = useState({}); // { [studentId]: { status: 'present', notes: '' } }
  const [riskMap, setRiskMap] = useState({}); // { [studentId]: riskObj }
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // WhatsApp Alert Modal State
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [targetStudentForWA, setTargetStudentForWA] = useState(null);
  const [waTemplateType, setWaTemplateType] = useState('daily_absence');
  const [waCustomNotes, setWaCustomNotes] = useState('');
  const [waSending, setWaSending] = useState(false);
  const [isSendingBulkWA, setIsSendingBulkWA] = useState(false);

  // Intervention modal
  const [showInterventionModal, setShowInterventionModal] = useState(false);
  const [targetStudentForIntervention, setTargetStudentForIntervention] = useState(null);
  const [interventionForm, setInterventionForm] = useState({
    concern: '',
    actionTaken: '',
    interventionType: 'parent_contact',
    followUpDate: ''
  });

  // Direct Communication Modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [targetStudentForMessage, setTargetStudentForMessage] = useState(null);
  const [messageForm, setMessageForm] = useState({
    title: '',
    messageText: '',
    category: 'attendance_alert',
    isUrgent: false
  });
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // Class Broadcast Modal
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    messageText: '',
    category: 'general_notice',
    isUrgent: false
  });
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

  // Real-Time Twilio & Socket Messaging State
  const [inboundReplies, setInboundReplies] = useState([]);
  const [liveAlertToast, setLiveAlertToast] = useState(null);
  const [isSimulatingInbound, setIsSimulatingInbound] = useState(false);

  // Initialize Real-time Socket Connection
  useEffect(() => {
    initSocket(localStorage.getItem('token'));
    joinClassRoom(selectedClass);

    const cleanupInbound = onInboundParentMessage((data) => {
      setInboundReplies(prev => [data, ...prev]);
      setLiveAlertToast({
        id: Date.now(),
        parentName: data.parentName,
        studentName: data.studentName,
        body: data.body,
        isUrgent: data.isUrgent,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
      });
      setTimeout(() => setLiveAlertToast(null), 8000);
    });

    const cleanupStatus = onWhatsAppStatusUpdate((update) => {
      if (update?.messageSid) {
        setSaveMessage({
          type: 'success',
          text: `✓ Twilio Delivery Update: Message ${update.messageSid.substring(0, 10)}... status is now "${update.deliveryStatus.toUpperCase()}".`
        });
        setTimeout(() => setSaveMessage(null), 4000);
      }
    });

    return () => {
      cleanupInbound();
      cleanupStatus();
    };
  }, [selectedClass]);

  const handleSimulateInboundParent = async () => {
    setIsSimulatingInbound(true);
    try {
      const sampleStudent = students[0] || { numericId: 801, fullName: 'Asha Jadhav', parentName: 'Savita Jadhav' };
      const sampleTexts = [
        `Namaste Master ji, ${sampleStudent.fullName} had fever this morning so missed the bus. She is resting and will attend class tomorrow.`,
        `Respected Teacher, this is ${sampleStudent.parentName}. We had harvest duties today in the hamlet. ${sampleStudent.fullName} has finished yesterday's math homework.`,
        `Sir, please send the audio capsule for Marathi revision. Our village power is back on now.`
      ];
      const randomText = sampleTexts[Math.floor(Math.random() * sampleTexts.length)];

      await twilioAPI.simulateInbound({
        studentId: sampleStudent.numericId,
        messageText: randomText
      });
    } catch (err) {
      alert(`Simulation notice: ${err.message}`);
    } finally {
      setIsSimulatingInbound(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [attendanceDate, selectedClass]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [stuRes, attRes, riskRes, pendingRes] = await Promise.all([
        studentsAPI.getStudents({ className: selectedClass }),
        attendanceAPI.getRecords({ date: attendanceDate }),
        riskAPI.getAssessments(),
        teacherAPI.getPendingStudents().catch(() => ({ data: [] }))
      ]);

      // Filter out unverified pending students from daily roll call
      const stuList = (stuRes.data || []).filter(s => s.enrollmentStatus !== 'pending' && s.enrollmentStatus !== 'rejected');
      setStudents(stuList);

      // Scoped pending students for this class
      const classPending = (pendingRes.data || []).filter(s => String(s.className) === String(selectedClass));
      setPendingStudents(classPending);

      // Build rollCall map from existing records or default to 'present'
      const existingAtt = attRes.data || [];
      const newRollCall = {};
      stuList.forEach(s => {
        const found = existingAtt.find(a => a.studentId === s.numericId);
        newRollCall[s.numericId] = {
          status: found ? found.status : 'present',
          notes: found ? found.notes : ''
        };
      });
      setRollCall(newRollCall);

      // Build risk map
      const rMap = {};
      (riskRes.assessments || []).forEach(a => {
        rMap[a.studentId] = a;
      });
      setRiskMap(rMap);
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      const res = await teacherAPI.approveStudent(studentId);
      setPendingStudents(prev => prev.filter(s => s._id !== studentId && s.numericId !== studentId));
      setEnrollmentActionMsg({ type: 'success', text: res.message || 'Student enrolled in class roll!' });
      setTimeout(() => setEnrollmentActionMsg(null), 5000);
      loadDashboardData();
    } catch (err) {
      setEnrollmentActionMsg({ type: 'error', text: err.message || 'Failed to enroll student.' });
    }
  };

  const handleRejectStudent = async (studentId) => {
    const reason = window.prompt('Please enter rejection reason (optional):', 'Address outside school catchment area');
    if (reason === null) return;
    try {
      const res = await teacherAPI.rejectStudent(studentId, reason);
      setPendingStudents(prev => prev.filter(s => s._id !== studentId && s.numericId !== studentId));
      setEnrollmentActionMsg({ type: 'success', text: res.message || 'Student registration rejected.' });
      setTimeout(() => setEnrollmentActionMsg(null), 5000);
    } catch (err) {
      setEnrollmentActionMsg({ type: 'error', text: err.message || 'Failed to reject student.' });
    }
  };

  const handleStatusChange = (studentId, status) => {
    setRollCall(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setRollCall(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleSaveBulkRollCall = async () => {
    setIsSaving(true);
    setSaveMessage(null);

    const records = Object.keys(rollCall).map(id => ({
      studentId: Number(id),
      status: rollCall[id].status,
      notes: rollCall[id].notes || ''
    }));

    try {
      await attendanceAPI.bulkAttendance({
        attendanceDate,
        records
      });
      setSaveMessage({ type: 'success', text: `✓ Roll call saved successfully for ${records.length} students on ${attendanceDate}!` });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save roll call.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Open Direct Message Modal
  const handleOpenMessageModal = (student) => {
    setTargetStudentForMessage(student);
    const risk = riskMap[student.numericId];
    const isConsecutiveAlert = risk?.hasCriticalAlert;

    setMessageForm({
      title: isConsecutiveAlert
        ? `⚠️ Attendance Alert: ${student.fullName} Missed Consecutive Classes`
        : `Academic Update: ${student.fullName}`,
      messageText: isConsecutiveAlert
        ? `Namaste ${student.parentName} ji, ${student.fullName} has missed multiple morning roll calls this week. Please call or visit the school so we can prevent learning loss.`
        : `Namaste ${student.parentName} ji, please check this update regarding ${student.fullName}'s daily coursework and classroom participation.`,
      category: isConsecutiveAlert ? 'attendance_alert' : 'academic_feedback',
      isUrgent: Boolean(isConsecutiveAlert)
    });
    setShowMessageModal(true);
  };

  // Dispatch Direct Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!targetStudentForMessage) return;

    setIsSendingMessage(true);
    try {
      await communicationsAPI.sendMessage({
        studentId: targetStudentForMessage.numericId,
        title: messageForm.title,
        messageText: messageForm.messageText,
        category: messageForm.category,
        isUrgent: messageForm.isUrgent
      });
      setShowMessageModal(false);
      setSaveMessage({
        type: 'success',
        text: `✓ Direct notice dispatched to ${targetStudentForMessage.parentName} (Parent of ${targetStudentForMessage.fullName})!`
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      alert(`Failed to send communication: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Dispatch Broadcast Message
  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    setIsSendingBroadcast(true);

    try {
      const res = await communicationsAPI.broadcastToClass({
        classLevel: selectedClass,
        title: broadcastForm.title,
        messageText: broadcastForm.messageText,
        category: broadcastForm.category,
        isUrgent: broadcastForm.isUrgent
      });
      setShowBroadcastModal(false);
      setSaveMessage({
        type: 'success',
        text: `✓ Class announcement delivered to all ${res.count || 'all'} parents of Class ${selectedClass}!`
      });
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err) {
      alert(`Failed to broadcast notice: ${err.message}`);
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  // WhatsApp Alert Handlers
  const handleOpenWhatsAppModal = (student, preferredTemplate = null) => {
    setTargetStudentForWA(student);
    const entry = rollCall[student.numericId] || { status: 'present' };
    const risk = riskMap[student.numericId];
    const isAtRisk = risk?.hasCriticalAlert || risk?.riskLevel === 'High' || (risk?.consecutiveAbsent >= 3);

    let template = preferredTemplate;
    if (!template) {
      if (entry.status === 'present') {
        template = 'attendance_appreciation';
      } else if (isAtRisk) {
        template = 'consecutive_absence_alert';
      } else {
        template = 'daily_absence';
      }
    }

    setWaTemplateType(template);
    setWaCustomNotes('');
    setShowWhatsAppModal(true);
  };

  const getWaPreviewText = () => {
    if (!targetStudentForWA) return '';
    const parent = targetStudentForWA.parentName || 'Guardian';
    const student = targetStudentForWA.fullName || 'Student';
    const dateStr = attendanceDate;
    const teacherName = currentUser?.name || 'Class Teacher';
    const schoolName = 'Zilla Parishad High School, Circle 4';

    switch (waTemplateType) {
      case 'attendance_appreciation':
        return `🌟 Namaste ${parent} ji,\n\nYour child *${student}* (Class ${targetStudentForWA.classLevel || selectedClass}) attended school on time today at ${schoolName}.\n\nConsistent daily attendance builds strong academic confidence and future success. Thank you for your continued support at home!\n\n_GramShiksha Digital Desk_`;
      case 'daily_absence':
        return `🙏 Namaste ${parent} ji,\n\nYour child *${student}* was marked *ABSENT* today (${dateStr}) at ${schoolName}.\n\nIf your child is unwell or facing travel difficulties, please inform Class Teacher *${teacherName}*.\n\n_GramShiksha Digital Attendance Desk_`;
      case 'consecutive_absence_alert':
        const risk = riskMap[targetStudentForWA.numericId];
        const consecDays = risk?.consecutiveAbsent || 3;
        return `⚠️ *URGENT ATTENDANCE WARNING*\n\nNamaste ${parent} ji,\n\nYour child *${student}* has missed *${consecDays} consecutive school days* at ${schoolName}.\n\nContinued absences risk academic disruption and enrollment cancellation. Please visit the school tomorrow morning to meet Principal Dr. K. Patil and Class Teacher *${teacherName}*.\n\n_GramShiksha Early Warning Desk_`;
      case 'marksheet_summary':
        return `📊 *CCE ACADEMIC EVALUATION REPORT*\n\nNamaste ${parent} ji,\n\nTerm evaluation for *${student}* (Class ${targetStudentForWA.classLevel}) has been published at ${schoolName}.\n\nPlease review progress and encourage daily revision at home.\n\n_GramShiksha Academic Monitoring_`;
      case 'teacher_notice':
      default:
        return `📢 *OFFICIAL SCHOOL NOTICE*\n\nNamaste ${parent} ji,\n\nUpdate regarding *${student}* (Class ${targetStudentForWA.classLevel}) from Class Teacher *${teacherName}*:\n\n${waCustomNotes || 'Please ensure daily revision packets are completed at home.'}\n\n_GramShiksha ZP School_`;
    }
  };

  const handleSendWhatsAppAPI = async () => {
    if (!targetStudentForWA) return;
    setWaSending(true);
    try {
      const res = await whatsappAPI.send({
        studentId: targetStudentForWA.numericId,
        templateType: waTemplateType,
        customNotes: waCustomNotes
      });
      setShowWhatsAppModal(false);
      setSaveMessage({
        type: 'success',
        text: `✓ WhatsApp alert delivered successfully to ${targetStudentForWA.parentName} (${targetStudentForWA.parentContact || 'Mobile'})!`
      });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      alert(`WhatsApp Delivery Error: ${err.message}`);
    } finally {
      setWaSending(false);
    }
  };

  const handleOpenWhatsAppWeb = async () => {
    if (!targetStudentForWA) return;
    try {
      const res = await whatsappAPI.getLink({
        studentId: targetStudentForWA.numericId,
        templateType: waTemplateType,
        customNotes: waCustomNotes
      });
      if (res?.clickToChatUrl) {
        window.open(res.clickToChatUrl, '_blank');
      } else {
        alert('Could not generate WhatsApp Web link');
      }
      setShowWhatsAppModal(false);
    } catch (err) {
      alert(`WhatsApp Link Error: ${err.message}`);
    }
  };

  const handleBulkWhatsAppAbsenceAlerts = async () => {
    if (!attendanceDate) return;
    if (!window.confirm(`Send automated WhatsApp absence alerts to all parents of absent students for ${attendanceDate}?`)) {
      return;
    }
    setIsSendingBulkWA(true);
    try {
      const res = await whatsappAPI.sendBulkAbsenceAlerts({
        date: attendanceDate,
        classLevel: selectedClass
      });
      setSaveMessage({
        type: 'success',
        text: `✓ Batch complete! Sent ${res.summary.sentCount} WhatsApp alerts to absent student parents for ${attendanceDate} (${res.summary.skippedCount} skipped).`
      });
      setTimeout(() => setSaveMessage(null), 5000);
    } catch (err) {
      alert(`Bulk WhatsApp Error: ${err.message}`);
    } finally {
      setIsSendingBulkWA(false);
    }
  };

  const handleOpenInterventionModal = (student) => {
    setTargetStudentForIntervention(student);
    const risk = riskMap[student.numericId];
    setInterventionForm({
      concern: risk ? risk.reasons.join(', ') : 'Irregular attendance noticed during morning roll call.',
      actionTaken: '',
      interventionType: 'parent_contact',
      followUpDate: ''
    });
    setShowInterventionModal(true);
  };

  const handleCreateIntervention = async (e) => {
    e.preventDefault();
    if (!targetStudentForIntervention) return;

    try {
      await interventionsAPI.create({
        studentId: targetStudentForIntervention.numericId,
        interventionType: interventionForm.interventionType,
        concern: interventionForm.concern,
        actionTaken: interventionForm.actionTaken,
        followUpDate: interventionForm.followUpDate || null
      });
      setShowInterventionModal(false);
      alert(`Intervention recorded for ${targetStudentForIntervention.fullName}!`);
      loadDashboardData();
    } catch (err) {
      alert(`Failed to save intervention: ${err.message}`);
    }
  };

  // Quick Stats Calculation
  const total = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;

  Object.values(rollCall).forEach(val => {
    if (val.status === 'present') presentCount++;
    else if (val.status === 'absent') absentCount++;
    else if (val.status === 'late') lateCount++;
  });

  const todayPct = total > 0 ? Math.round(((presentCount + lateCount * 0.5) / total) * 100) : 0;

  return (
    <div className="teacher-dashboard">
      {/* Page Header */}
      <div className="dashboard-top-header">
        <div>
          <h2>👨‍🏫 Class {selectedClass} Roll Call & Daily Monitoring</h2>
          <p className="text-sm text-muted">
            {currentUser?.schoolName || 'Zilla Parishad High School, Dahiwadi'} • Class Teacher: {currentUser?.fullName || 'S. Deshmukh'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Selector Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-muted">Class:</span>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              style={{ minWidth: '100px', fontWeight: 'bold' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={String(c)}>Class {c}</option>
              ))}
            </select>
          </div>

          <div className="date-picker-wrap">
            <label htmlFor="rollDate" className="text-xs font-semibold mr-1">Date:</label>
            <input
              id="rollDate"
              type="date"
              className="form-control date-input"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
            />
          </div>

          {/* Broadcast to Class Button */}
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => {
              setBroadcastForm({
                title: `Class ${selectedClass} Notice: `,
                messageText: '',
                category: 'general_notice',
                isUrgent: false
              });
              setShowBroadcastModal(true);
            }}
            title="Broadcast announcement to all parents of Class"
          >
            <Icon name="phone" size={14} /> Broadcast Notice
          </button>

          {/* Real-time Twilio Live Channel Pill & Testing Trigger */}
          <div className="flex items-center gap-1">
            <span
              className="badge"
              style={{
                backgroundColor: '#ecfdf5',
                color: '#059669',
                border: '1px solid #10b981',
                fontSize: '0.72rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '0.3rem 0.5rem'
              }}
              title="Socket.IO Real-Time Messaging Hub Connected"
            >
              <span>🟢</span> Live Twilio
            </span>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ borderColor: '#6366f1', color: '#4f46e5', fontSize: '0.74rem', padding: '0.25rem 0.5rem' }}
              onClick={handleSimulateInboundParent}
              disabled={isSimulatingInbound}
              title="Simulate parent replying to school via Twilio WhatsApp / SMS"
            >
              {isSimulatingInbound ? 'Emulating...' : '🧪 Test Parent Reply'}
            </button>
          </div>
        </div>
      </div>

      {/* Live Inbound Parent Reply Banner Toast */}
      {liveAlertToast && (
        <div
          className="alert-banner"
          style={{
            backgroundColor: liveAlertToast.isUrgent ? '#fef2f2' : '#f0fdf4',
            border: liveAlertToast.isUrgent ? '2px solid #ef4444' : '2px solid #10b981',
            color: liveAlertToast.isUrgent ? '#991b1b' : '#065f46',
            padding: '0.75rem 1rem',
            marginBottom: '1rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div className="flex items-center gap-2">
            <span style={{ fontSize: '1.25rem' }}>{liveAlertToast.isUrgent ? '🚨' : '💬'}</span>
            <div>
              <div className="font-bold text-sm">
                Real-Time Twilio Inbound Alert • {liveAlertToast.parentName} (Parent of {liveAlertToast.studentName})
                <span className="text-xs font-normal text-muted ml-2">{liveAlertToast.time}</span>
              </div>
              <div className="text-sm mt-0.5" style={{ fontStyle: 'italic' }}>
                "{liveAlertToast.body}"
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', fontSize: '0.75rem' }}
            onClick={() => {
              const stu = students.find(s => s.fullName === liveAlertToast.studentName) || students[0];
              if (stu) handleOpenWhatsAppModal(stu, 'teacher_notice');
            }}
          >
            Reply on WhatsApp
          </button>
        </div>
      )}

      {/* Real-Time Inbound Parent Replies Tray */}
      {inboundReplies.length > 0 && (
        <div className="portal-section-card mb-4" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="section-card-header">
            <div className="flex items-center gap-2">
              <Icon name="phone" size={18} color="#4f46e5" />
              <h3>Real-Time Parent Mobile Replies ({inboundReplies.length})</h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge badge-primary">⚡ Twilio Inbound Feed</span>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem' }}
                onClick={() => setInboundReplies([])}
              >
                Clear Feed
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {inboundReplies.slice(0, 5).map((reply, idx) => (
              <div
                key={reply.messageSid || idx}
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '0.65rem 0.9rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ flex: '1 1 300px' }}>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-primary">{reply.parentName}</span>
                    <span className="text-xs text-muted">Parent of {reply.studentName} (Class {reply.classLevel})</span>
                    {reply.isUrgent && (
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>🚨 Urgent</span>
                    )}
                  </div>
                  <p className="text-sm mt-1" style={{ margin: '0.25rem 0 0', color: '#1e293b' }}>
                    "{reply.body}"
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-sm"
                    style={{ backgroundColor: '#25D366', color: '#fff', border: 'none', fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => {
                      const stu = students.find(s => s.numericId === reply.studentId) || { numericId: reply.studentId, fullName: reply.studentName, parentName: reply.parentName, classLevel: reply.classLevel };
                      handleOpenWhatsAppModal(stu, 'teacher_notice');
                    }}
                  >
                    💬 Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary KPI Badges */}
      <div className="quick-kpi-grid">
        <div className="kpi-card">
          <span className="kpi-label">Class Attendance</span>
          <span className="kpi-value text-primary">{todayPct}%</span>
          <span className="kpi-sub">{presentCount} of {total} present today</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Present</span>
          <span className="kpi-value text-success">{presentCount}</span>
          <span className="kpi-sub">On-time attendees</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Absences</span>
          <span className="kpi-value text-danger">{absentCount}</span>
          <span className="kpi-sub">Requires follow-up</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Late Arrivals</span>
          <span className="kpi-value text-warning">{lateCount}</span>
          <span className="kpi-sub">Transport/commute delays</span>
        </div>
      </div>

      {saveMessage && (
        <div className={`alert-banner alert-${saveMessage.type}`}>
          <Icon name={saveMessage.type === 'success' ? 'check-circle' : 'alert-triangle'} size={16} />
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Enrollment Action Message */}
      {enrollmentActionMsg && (
        <div
          className="login-error-alert mb-3"
          style={{
            backgroundColor: enrollmentActionMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
            borderColor: enrollmentActionMsg.type === 'success' ? '#a7f3d0' : '#fecaca',
            color: enrollmentActionMsg.type === 'success' ? '#047857' : '#b91c1c'
          }}
        >
          <Icon name={enrollmentActionMsg.type === 'success' ? 'check-circle' : 'alert-triangle'} size={16} />
          <span>{enrollmentActionMsg.text}</span>
        </div>
      )}

      {/* Tier 2: Student Enrollment & Verification Desk */}
      <div className="portal-section-card mb-4">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="user-check" size={18} color="#0284c7" />
            <h3>Class {selectedClass} Student Enrollment & Admission Desk</h3>
          </div>
          <div className="flex items-center gap-2">
            {pendingStudents.length > 0 ? (
              <span className="badge badge-warning" style={{ fontWeight: 'bold' }}>
                🔔 {pendingStudents.length} Admission{pendingStudents.length > 1 ? 's' : ''} Awaiting Verification
              </span>
            ) : (
              <span className="badge badge-success">✓ Roster Up-to-Date</span>
            )}
            <span className="badge badge-outline">Class Teacher Authority</span>
          </div>
        </div>

        {pendingStudents.length === 0 ? (
          <div className="empty-interventions-state py-3 text-center">
            <Icon name="check-circle" size={20} color="#059669" />
            <p className="font-semibold text-sm mt-1">No Pending Student Admissions</p>
            <span className="text-xs text-muted">
              All students registered for Class {selectedClass} are formally admitted into the official roll call.
            </span>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table">
              <thead>
                <tr>
                  <th>Applicant Student</th>
                  <th>Parent / Guardian</th>
                  <th>Contact Number</th>
                  <th>Hamlet / Wadi</th>
                  <th>Status</th>
                  <th>Class Teacher Decision</th>
                </tr>
              </thead>
              <tbody>
                {pendingStudents.map((st) => (
                  <tr key={st._id || st.numericId} style={{ backgroundColor: '#f0f9ff' }}>
                    <td>
                      <div className="font-semibold text-primary">{st.fullName}</div>
                      <span className="text-xs text-muted font-mono">Temp ID: #{st.numericId}</span>
                    </td>
                    <td>{st.parentName}</td>
                    <td className="text-sm font-mono">{st.parentContact || 'No phone'}</td>
                    <td className="text-xs text-muted">{st.hamletOrWadi || 'Catchment Area'}</td>
                    <td>
                      <span className="badge badge-warning" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>
                        Pending Verification
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#0284c7', borderColor: '#0284c7' }}
                          onClick={() => handleApproveStudent(st._id || st.numericId)}
                        >
                          Verify & Enroll in Class Roll ✓
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          style={{ padding: '0.25rem 0.6rem', fontSize: '0.8rem', color: '#dc2626', borderColor: '#fca5a5' }}
                          onClick={() => handleRejectStudent(st._id || st.numericId)}
                        >
                          Reject ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Daily Roll Call Matrix */}
      <div className="portal-section-card">
        <div className="section-card-header">
          <div className="flex items-center gap-2">
            <Icon name="calendar" size={18} color="#059669" />
            <h3>Class {selectedClass} Roll Call Matrix ({attendanceDate})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-outline"
              style={{ borderColor: '#25D366', color: '#128C7E', fontWeight: 'bold' }}
              onClick={handleBulkWhatsAppAbsenceAlerts}
              disabled={isSendingBulkWA || absentCount === 0}
              title={absentCount === 0 ? "No absent students today" : `Send instant WhatsApp absence alerts to all ${absentCount} absent parents`}
            >
              <Icon name="phone" size={16} color="#25D366" />
              {isSendingBulkWA ? 'Alerting via WhatsApp...' : `💬 WhatsApp ${absentCount} Absent Parent${absentCount !== 1 ? 's' : ''}`}
            </button>
            <button
              className="btn btn-primary"
              onClick={handleSaveBulkRollCall}
              disabled={isSaving}
            >
              <Icon name="check-circle" size={16} />
              {isSaving ? 'Syncing...' : 'Save Roll Call (Bulk Sync)'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="portal-loading-state">
            <div className="spinner"></div>
            <p>Fetching Class {selectedClass} students...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="portal-table roll-call-table">
              <thead>
                <tr>
                  <th>Roll #</th>
                  <th>Student & Guardian</th>
                  <th>Attendance Status Toggle</th>
                  <th>Risk Status & Alerts</th>
                  <th>Daily Note / Reason</th>
                  <th>ERP Interaction</th>
                </tr>
              </thead>
              <tbody>
                {students.map((stu) => {
                  const entry = rollCall[stu.numericId] || { status: 'present', notes: '' };
                  const risk = riskMap[stu.numericId];
                  const hasCriticalAlert = risk?.hasCriticalAlert;

                  return (
                    <tr
                      key={stu.numericId}
                      className={hasCriticalAlert ? 'row-critical-alert' : entry.status === 'absent' ? 'row-absent' : ''}
                    >
                      <td className="font-mono font-bold">#{stu.numericId}</td>
                      <td>
                        <div className="student-cell-info">
                          <span className="font-semibold text-primary">{stu.fullName}</span>
                          <span className="text-xs text-muted">
                            Parent: {stu.parentName} ({stu.parentContact || 'No phone'})
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle Buttons */}
                      <td>
                        <div className="status-toggle-group">
                          <button
                            type="button"
                            className={`toggle-btn btn-present ${entry.status === 'present' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'present')}
                          >
                            <Icon name="check-circle" size={13} /> Present
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn btn-late ${entry.status === 'late' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'late')}
                          >
                            <Icon name="clock" size={13} /> Late
                          </button>
                          <button
                            type="button"
                            className={`toggle-btn btn-absent ${entry.status === 'absent' ? 'active' : ''}`}
                            onClick={() => handleStatusChange(stu.numericId, 'absent')}
                          >
                            <Icon name="x-circle" size={13} /> Absent
                          </button>
                        </div>
                      </td>

                      {/* Risk Alert Badge */}
                      <td>
                        {risk ? (
                          <div className="flex flex-col gap-1">
                            <span className={`risk-badge risk-${risk.riskLevel.toLowerCase()}`}>
                              {risk.riskLevel === 'High' && '⚠️ '}
                              {risk.riskLevel} Risk ({risk.attendancePct}%)
                            </span>
                            {hasCriticalAlert && (
                              <span className="critical-warning-pill">
                                🚨 {risk.consecutiveAbsent} Consec Absences!
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted">Awaiting sync</span>
                        )}
                      </td>

                      {/* Notes input */}
                      <td>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. Fever, harvest work, bus issue"
                          value={entry.notes || ''}
                          onChange={(e) => handleNotesChange(stu.numericId, e.target.value)}
                        />
                      </td>

                      {/* Proactive ERP Action Buttons */}
                      <td>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="btn btn-sm"
                            onClick={() => handleOpenWhatsAppModal(stu, entry.status === 'absent' ? (hasCriticalAlert ? 'consecutive_absence_alert' : 'daily_absence') : 'attendance_appreciation')}
                            title={
                              entry.status === 'absent'
                                ? (hasCriticalAlert ? "Send Urgent Dropout Warning Alert (High Risk)" : "Send Daily Absence Notice")
                                : "Send Attendance Appreciation Note (Present Student)"
                            }
                            style={{
                              padding: '0.3rem 0.55rem',
                              fontSize: '0.78rem',
                              backgroundColor: hasCriticalAlert ? '#ef4444' : entry.status === 'absent' ? '#25D366' : '#f0fdf4',
                              color: hasCriticalAlert || entry.status === 'absent' ? '#ffffff' : '#15803d',
                              borderColor: hasCriticalAlert ? '#dc2626' : '#25D366',
                              fontWeight: entry.status === 'absent' || hasCriticalAlert ? 'bold' : 'normal'
                            }}
                          >
                            {hasCriticalAlert ? '🚨 WA Alert' : entry.status === 'absent' ? '💬 WA Absence' : '💬 WA Note'}
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => handleOpenMessageModal(stu)}
                            title="Dispatch real-time notice to guardian"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                          >
                            <Icon name="phone" size={12} /> Message
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenInterventionModal(stu)}
                            title="Record formal intervention record"
                            style={{ padding: '0.3rem 0.55rem', fontSize: '0.78rem' }}
                          >
                            <Icon name="teacher" size={12} /> Log
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Direct Teacher-Parent Notice Modal */}
      {showMessageModal && targetStudentForMessage && (
        <div className="modal-backdrop" onClick={() => setShowMessageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={18} color="#4f46e5" />
                <h3 className="font-bold">
                  Dispatch Notice to {targetStudentForMessage.parentName} (Parent of {targetStudentForMessage.fullName})
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowMessageModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleSendMessage}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Message Category</label>
                  <select
                    className="form-control"
                    value={messageForm.category}
                    onChange={(e) => setMessageForm({ ...messageForm, category: e.target.value })}
                  >
                    <option value="attendance_alert">⚠️ Attendance Warning & Consecutive Absence</option>
                    <option value="academic_feedback">🌟 Academic Feedback & CCE Marks</option>
                    <option value="homework">📚 Homework & Exam Revision Packet</option>
                    <option value="urgent_call">🚨 Urgent Parent Call Requested</option>
                    <option value="general_notice">ℹ️ General Classroom Notice</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Notice Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    value={messageForm.title}
                    onChange={(e) => setMessageForm({ ...messageForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message to Parent</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    value={messageForm.messageText}
                    onChange={(e) => setMessageForm({ ...messageForm, messageText: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="urgentNoticeCheck"
                    checked={messageForm.isUrgent}
                    onChange={(e) => setMessageForm({ ...messageForm, isUrgent: e.target.checked })}
                  />
                  <label htmlFor="urgentNoticeCheck" className="text-sm font-semibold" style={{ margin: 0, cursor: 'pointer' }}>
                    🚨 Highlight as Urgent Notice (Shows alert pill on Parent Portal)
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowMessageModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSendingMessage}
                >
                  {isSendingMessage ? 'Dispatching...' : 'Dispatch Notice to Parent'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Class Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="modal-backdrop" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={18} color="#059669" />
                <h3 className="font-bold">
                  Broadcast Notice to All Class {selectedClass} Parents
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowBroadcastModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Notice Category</label>
                  <select
                    className="form-control"
                    value={broadcastForm.category}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                  >
                    <option value="general_notice">ℹ️ General Classroom / School Notice</option>
                    <option value="homework">📚 Class-Wide Homework & Revision Packet</option>
                    <option value="attendance_alert">⚠️ Monsoon Weather / Route Alert</option>
                    <option value="academic_feedback">📝 Unit Test & Exam Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Announcement Title</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Unit Test 2 Schedule & Revision Packet"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Announcement Body</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Type notice message here. It will be duplicated to every student's parent feed in Class..."
                    value={broadcastForm.messageText}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, messageText: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group flex items-center gap-2 mt-2">
                  <input
                    type="checkbox"
                    id="broadcastUrgentCheck"
                    checked={broadcastForm.isUrgent}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, isUrgent: e.target.checked })}
                  />
                  <label htmlFor="broadcastUrgentCheck" className="text-sm font-semibold" style={{ margin: 0, cursor: 'pointer' }}>
                    🚨 Mark as High-Priority Class Broadcast
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowBroadcastModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSendingBroadcast}
                >
                  {isSendingBroadcast ? 'Broadcasting...' : 'Broadcast to All Parents'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Intervention Recording Modal */}
      {showInterventionModal && targetStudentForIntervention && (
        <div className="modal-backdrop" onClick={() => setShowInterventionModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="teacher" size={18} color="#d97706" />
                <h3 className="font-bold">
                  Record Teacher Intervention: {targetStudentForIntervention.fullName}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowInterventionModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIntervention}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Intervention Protocol Type</label>
                  <select
                    className="form-control"
                    value={interventionForm.interventionType}
                    onChange={(e) => setInterventionForm({ ...interventionForm, interventionType: e.target.value })}
                  >
                    <option value="parent_contact">Parent Phone Call</option>
                    <option value="student_meeting">One-on-One Counseling Meeting</option>
                    <option value="learning_support">Remedial Learning Packet & Buddy</option>
                    <option value="referral">Village Gram Panchayat / ASHA Referral</option>
                    <option value="other">Special Home Visit</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Identified Risk Concern</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={interventionForm.concern}
                    onChange={(e) => setInterventionForm({ ...interventionForm, concern: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Action Taken / Parent Commitment</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Describe conversation with guardian and agreed schedule..."
                    value={interventionForm.actionTaken}
                    onChange={(e) => setInterventionForm({ ...interventionForm, actionTaken: e.target.value })}
                    required
                  ></textarea>
                </div>

                <div className="form-group">
                  <label>Scheduled Follow-Up Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={interventionForm.followUpDate}
                    onChange={(e) => setInterventionForm({ ...interventionForm, followUpDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowInterventionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Intervention Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WhatsApp Parent Notification Modal */}
      {showWhatsAppModal && targetStudentForWA && (
        <div className="modal-backdrop" onClick={() => setShowWhatsAppModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ borderBottom: '2px solid #25D366' }}>
              <div className="flex items-center gap-2">
                <span style={{ fontSize: '1.3rem' }}>💬</span>
                <h3 className="font-bold" style={{ color: '#075E54' }}>
                  WhatsApp Parent Alert: {targetStudentForWA.fullName}
                </h3>
              </div>
              <button className="btn-icon" onClick={() => setShowWhatsAppModal(false)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Recipient Details Card */}
              <div
                style={{
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '6px',
                  padding: '0.75rem 1rem',
                  marginBottom: '1rem'
                }}
              >
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Parent / Guardian: </span>
                    <span className="font-bold text-primary">{targetStudentForWA.parentName}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Phone: </span>
                    <span className="font-mono font-bold" style={{ color: '#075E54' }}>
                      {targetStudentForWA.parentContact || 'No phone registered'}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted mt-1">
                  Student: Roll #{targetStudentForWA.numericId} • Class {targetStudentForWA.classLevel} • {targetStudentForWA.hamletOrWadi || 'Catchment Area'}
                </div>
              </div>

              {/* Dynamic Attendance & Risk Context Banner */}
              {(() => {
                const entry = rollCall[targetStudentForWA.numericId] || { status: 'present' };
                const risk = riskMap[targetStudentForWA.numericId];
                const isHighRisk = risk?.hasCriticalAlert || risk?.riskLevel === 'High' || (risk?.consecutiveAbsent >= 3);

                if (isHighRisk) {
                  return (
                    <div
                      style={{
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        color: '#991b1b',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        marginBottom: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      🚨 <strong>High Risk / Chronic Dropout Alert:</strong> {risk?.consecutiveAbsent || 3} consecutive absences detected. Critical warning template is auto-selected to prompt immediate parent intervention.
                    </div>
                  );
                } else if (entry.status === 'absent') {
                  return (
                    <div
                      style={{
                        backgroundColor: '#fffbeb',
                        border: '1px solid #fde68a',
                        color: '#92400e',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        marginBottom: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      📅 <strong>Standard Daily Absence:</strong> Student is marked absent today. Standard polite notification is selected.
                    </div>
                  );
                } else {
                  return (
                    <div
                      style={{
                        backgroundColor: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        color: '#166534',
                        padding: '0.5rem 0.8rem',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        marginBottom: '0.75rem',
                        fontWeight: '500'
                      }}
                    >
                      ✓ <strong>Student is Present Today:</strong> Absence alerts are disabled. Positive attendance appreciation or general teacher notice will be sent.
                    </div>
                  );
                }
              })()}

              {/* Template Selector */}
              <div className="form-group mb-3">
                <label className="font-semibold text-sm">Select Notification Scenario</label>
                <select
                  className="form-control"
                  value={waTemplateType}
                  onChange={(e) => setWaTemplateType(e.target.value)}
                >
                  <option value="attendance_appreciation">🌟 Attendance Appreciation (Present Learners)</option>
                  <option value="daily_absence">📅 Daily Morning Absence Notice (Standard Absent)</option>
                  <option value="consecutive_absence_alert">🚨 3+ Days Dropout Alert (High Risk Only)</option>
                  <option value="marksheet_summary">📊 CCE Exam Marksheet & Academic Summary</option>
                  <option value="teacher_notice">📢 Direct Teacher Notice / Homework Broadcast</option>
                </select>
              </div>

              {/* Custom Notes if Teacher Notice */}
              {waTemplateType === 'teacher_notice' && (
                <div className="form-group mb-3">
                  <label className="font-semibold text-sm">Custom Teacher Notice / Homework</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter instructions, homework assignment, or reason for communication..."
                    value={waCustomNotes}
                    onChange={(e) => setWaCustomNotes(e.target.value)}
                  ></textarea>
                </div>
              )}

              {/* WhatsApp Message Preview Bubble */}
              <div className="form-group mb-3">
                <label className="font-semibold text-sm flex items-center justify-between">
                  <span>Message Preview (Dispatched via WhatsApp)</span>
                  <span className="text-xs text-muted font-normal">Official Institutional Template</span>
                </label>
                <div
                  style={{
                    backgroundColor: '#e7f7ed',
                    borderLeft: '4px solid #25D366',
                    padding: '0.85rem 1rem',
                    borderRadius: '4px 10px 10px 4px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    fontSize: '0.88rem',
                    lineHeight: '1.45',
                    whiteSpace: 'pre-line',
                    color: '#111827',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.06)'
                  }}
                >
                  {getWaPreviewText()}
                </div>
              </div>

              <div className="text-xs text-muted">
                🔒 All WhatsApp alerts are archived in the school compliance audit log with delivery status tracking.
              </div>
            </div>

            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowWhatsAppModal(false)}
                disabled={waSending}
              >
                Cancel
              </button>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderColor: '#3b82f6', color: '#1d4ed8' }}
                  onClick={async () => {
                    if (!targetStudentForWA) return;
                    setWaSending(true);
                    try {
                      const res = await twilioAPI.sendSMS({
                        studentId: targetStudentForWA.numericId,
                        messageBody: getWaPreviewText()
                      });
                      setShowWhatsAppModal(false);
                      setSaveMessage({
                        type: 'success',
                        text: `✓ Twilio SMS dispatched successfully to ${targetStudentForWA.parentName} (${res.result?.messageSid || 'Delivered'})!`
                      });
                      setTimeout(() => setSaveMessage(null), 5000);
                    } catch (err) {
                      alert(`Twilio SMS Error: ${err.message}`);
                    } finally {
                      setWaSending(false);
                    }
                  }}
                  disabled={waSending}
                  title="Dispatch as direct carrier SMS via Twilio (for parents without active WhatsApp data)"
                >
                  📱 Send Twilio SMS
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  style={{ borderColor: '#25D366', color: '#075E54' }}
                  onClick={handleOpenWhatsAppWeb}
                  disabled={waSending}
                  title="Open chat in WhatsApp Web or Mobile WhatsApp App"
                >
                  🌐 Open in WhatsApp Web
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#25D366', color: '#ffffff', fontWeight: 'bold' }}
                  onClick={handleSendWhatsAppAPI}
                  disabled={waSending}
                >
                  {waSending ? 'Dispatching...' : '🚀 Auto-Send via Cloud API'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
