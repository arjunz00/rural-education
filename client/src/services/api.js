const API_BASE = import.meta.env.VITE_API_URL || '/api';

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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
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
  login: (username, password) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  }),
  getMe: () => apiRequest('/auth/me'),
  logout: () => apiRequest('/auth/logout', { method: 'POST' }),
  getDemoAccounts: () => apiRequest('/auth/demo-accounts')
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
  })
};

export const healthAPI = {
  check: () => apiRequest('/health')
};
