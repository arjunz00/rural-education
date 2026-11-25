let rawBase = (import.meta.env.VITE_API_URL || '').trim();
if (rawBase.endsWith('/')) {
  rawBase = rawBase.slice(0, -1);
}
if (rawBase && !rawBase.endsWith('/api')) {
  rawBase = `${rawBase}/api`;
}
const API_BASE = rawBase || '/api';

console.log('[GramShiksha Client] Active API Base URL:', API_BASE);

/**
 * Robust fetch wrapper with authorization header, low-bandwidth metrics,
 * and unified error extraction.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('rural_ed_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers
  }).catch((networkErr) => {
    throw new Error(`Cannot connect to backend API at ${url}. Please ensure backend is active.`);
  });

  // Extract payload size from header if present
  const payloadBytes = response.headers.get('X-Payload-Bytes');
  if (payloadBytes) {
    window.dispatchEvent(new CustomEvent('rural-bandwidth-metric', {
      detail: { bytes: parseInt(payloadBytes, 10), endpoint }
    }));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || `HTTP ${response.status}: Request failed`);
    error.status = response.status;
    error.code = data.code;
    error.details = data;
    throw error;
  }

  return data;
}

export const authAPI = {
  register: (userData) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  login: (username, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getDemoAccounts: () => apiRequest('/auth/demo-accounts'),
  seedDemo: () => apiRequest('/auth/seed-demo?force=true')
};

export const studentsAPI = {
  getStudents: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/students${q ? `?${q}` : ''}`);
  },
  getStudentById: (id) => apiRequest(`/students/${id}`),
  createStudent: (studentData) => apiRequest('/students', {
    method: 'POST',
    body: JSON.stringify(studentData)
  }),
  updateStudent: (id, updates) => apiRequest(`/students/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  getStudentAttendance: (id) => apiRequest(`/students/${id}/attendance`),
  getStudentAcademic: (id) => apiRequest(`/students/${id}/academic`),
  getStudentInterventions: (id) => apiRequest(`/students/${id}/interventions`)
};

export const attendanceAPI = {
  getRecords: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/attendance${q ? `?${q}` : ''}`);
  },
  getSummary: () => apiRequest('/attendance/summary'),
  getAnalytics: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/attendance/analytics${q ? `?${q}` : ''}`);
  },
  recordAttendance: (data) => apiRequest('/attendance', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  bulkAttendance: (data) => apiRequest('/attendance/bulk', {
    method: 'POST',
    body: JSON.stringify(data)
  })
};

export const riskAPI = {
  getAssessments: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/risk/assessments${q ? `?${q}` : ''}`);
  }
};

export const academicAPI = {
  getRecords: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/academic/records${q ? `?${q}` : ''}`);
  },
  getSummary: () => apiRequest('/academic/summary'),
  createRecord: (record) => apiRequest('/academic/records', {
    method: 'POST',
    body: JSON.stringify(record)
  }),
  updateRecord: (id, updates) => apiRequest(`/academic/records/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  }),
  deleteRecord: (id) => apiRequest(`/academic/records/${id}`, {
    method: 'DELETE'
  })
};

export const interventionsAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/interventions${q ? `?${q}` : ''}`);
  },
  create: (data) => apiRequest('/interventions', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  update: (id, updates) => apiRequest(`/interventions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  })
};

export const resourcesAPI = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/resources${q ? `?${q}` : ''}`);
  },
  create: (data) => apiRequest('/resources', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  delete: (id) => apiRequest(`/resources/${id}`, {
    method: 'DELETE'
  }),
  getAudioUrl: (id) => `${API_BASE}/resources/${id}/audio`,
  getDownloadUrl: (id) => `${API_BASE}/resources/${id}/download`
};

export const adminAPI = {
  getPendingTeachers: () => apiRequest('/admin/pending-teachers'),
  approveTeacher: (id) => apiRequest(`/admin/teachers/${id}/approve`, {
    method: 'PATCH'
  }),
  rejectTeacher: (id, reason) => apiRequest(`/admin/teachers/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  })
};

export const teacherAPI = {
  getPendingStudents: () => apiRequest('/teacher/pending-students'),
  approveStudent: (id) => apiRequest(`/teacher/students/${id}/approve`, {
    method: 'PATCH'
  }),
  rejectStudent: (id, reason) => apiRequest(`/teacher/students/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason })
  })
};

export const quizzesAPI = {
  getQuizzes: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/quizzes${q ? `?${q}` : ''}`);
  },
  getQuizById: (id) => apiRequest(`/quizzes/${id}`),
  createQuiz: (data) => apiRequest('/quizzes', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  submitQuiz: (id, payload) => apiRequest(`/quizzes/${id}/submit`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getSubmissions: (studentId) => apiRequest(`/quizzes/submissions/${studentId}`)
};

export const communicationsAPI = {
  getStudentCommunications: (studentId) => apiRequest(`/communications/student/${studentId}`),
  sendMessage: (data) => apiRequest('/communications', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  broadcastToClass: (data) => apiRequest('/communications/broadcast-class', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  markAsRead: (id) => apiRequest(`/communications/${id}/read`, {
    method: 'PATCH'
  }),
  getUnreadCount: (studentId) => apiRequest(`/communications/unread-count/${studentId}`)
};

export const whatsappAPI = {
  send: (payload) => apiRequest('/whatsapp/send', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  sendBulkAbsenceAlerts: (payload = {}) => apiRequest('/whatsapp/bulk-absence-alerts', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  getLogs: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/whatsapp/logs${q ? `?${q}` : ''}`);
  },
  getSummary: () => apiRequest('/whatsapp/logs/summary'),
  getLink: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/whatsapp/link${q ? `?${q}` : ''}`);
  }
};

export const healthAPI = {
  check: () => apiRequest('/health')
};
