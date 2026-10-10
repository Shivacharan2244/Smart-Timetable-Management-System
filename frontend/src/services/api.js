import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized / Token Expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthUrl = error.config && error.config.url && error.config.url.includes('/auth/login');
      if (!isAuthUrl) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login?expired=true';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Centralized API Services
export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const dashboardService = {
  getSummary: async () => {
    const response = await api.get('/dashboard/summary');
    return response.data;
  },
};

export const timetableService = {
  getAllEntries: async () => {
    const response = await api.get('/timetable-entries');
    return response.data;
  },
  getEntryById: async (id) => {
    const response = await api.get(`/timetable-entries/${id}`);
    return response.data;
  },
  createEntry: async (dto) => {
    const response = await api.post('/timetable-entries', dto);
    return response.data;
  },
  updateEntry: async (id, dto) => {
    const response = await api.put(`/timetable-entries/${id}`, dto);
    return response.data;
  },
  deleteEntry: async (id) => {
    const response = await api.delete(`/timetable-entries/${id}`);
    return response.data;
  },
  getEntriesByFaculty: async (facultyId, dayOfWeek) => {
    const params = dayOfWeek ? { dayOfWeek } : {};
    const response = await api.get(`/timetable-entries/faculty/${facultyId}`, { params });
    return response.data;
  },
  getEntriesByRoom: async (roomId, dayOfWeek) => {
    const params = dayOfWeek ? { dayOfWeek } : {};
    const response = await api.get(`/timetable-entries/room/${roomId}`, { params });
    return response.data;
  },
  getEntriesBySection: async (sectionId, dayOfWeek) => {
    const params = dayOfWeek ? { dayOfWeek } : {};
    const response = await api.get(`/timetable-entries/section/${sectionId}`, { params });
    return response.data;
  },
  getEntriesByDay: async (dayOfWeek) => {
    const response = await api.get(`/timetable-entries/day/${dayOfWeek}`);
    return response.data;
  },
};

export const uploadService = {
  uploadPdf: async (formData) => {
    const response = await api.post('/upload-history/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getAll: async () => {
    const response = await api.get('/upload-history');
    return response.data;
  },
  getRecent: async () => {
    const response = await api.get('/upload-history/recent');
    return response.data;
  },
  getById: async (id) => {
    const response = await api.get(`/upload-history/${id}`);
    return response.data;
  },
  getEntries: async (id) => {
    const response = await api.get(`/upload-history/${id}/entries`);
    return response.data;
  },
  delete: async (id) => {
    const response = await api.delete(`/upload-history/${id}`);
    return response.data;
  },
};

export const facultyService = {
  getAll: async () => {
    const response = await api.get('/faculties');
    return response.data;
  },
  getFree: async (params) => {
    const response = await api.get('/faculty/free', { params });
    return response.data;
  },
  getMatrix: async (params) => {
    const response = await api.get('/faculty/matrix', { params });
    return response.data;
  },
};

export const liveClassService = {
  getAll: async () => {
    const response = await api.get('/live-classes');
    return response.data;
  },
  getToday: async () => {
    const response = await api.get('/live-classes/today');
    return response.data;
  },
  getRunning: async () => {
    const response = await api.get('/live-classes/running');
    return response.data;
  },
  getUpcoming: async () => {
    const response = await api.get('/live-classes/upcoming');
    return response.data;
  },
  start: async (id) => {
    const response = await api.patch(`/live-classes/${id}/start`);
    return response.data;
  },
  startClass: async (id) => {
    const response = await api.patch(`/live-classes/${id}/start`);
    return response.data;
  },
  end: async (id) => {
    const response = await api.patch(`/live-classes/${id}/end`);
    return response.data;
  },
  endClass: async (id) => {
    const response = await api.patch(`/live-classes/${id}/end`);
    return response.data;
  },
  cancel: async (id, reason) => {
    const response = await api.patch(`/live-classes/${id}/cancel`, { reason });
    return response.data;
  },
  cancelClass: async (id, reason) => {
    const response = await api.patch(`/live-classes/${id}/cancel`, { reason });
    return response.data;
  },
  changeRoom: async (id, newRoomId, reason) => {
    const response = await api.patch(`/live-classes/${id}/change-room`, { newRoomId, reason });
    return response.data;
  },
  syncToday: async () => {
    const response = await api.post('/live-classes/sync-today');
    return response.data;
  },
};

export const meetingService = {
  getAll: async () => {
    const response = await api.get('/meetings');
    return response.data;
  },
  getUpcoming: async () => {
    const response = await api.get('/meetings/upcoming');
    return response.data;
  },
  getByFaculty: async (facultyId) => {
    const response = await api.get(`/meetings/faculty/${facultyId}`);
    return response.data;
  },
  create: async (dto) => {
    const response = await api.post('/meetings', dto);
    return response.data;
  },
  update: async (id, dto) => {
    const response = await api.put(`/meetings/${id}`, dto);
    return response.data;
  },
  cancel: async (id) => {
    const response = await api.delete(`/meetings/${id}`);
    return response.data;
  },
  getSuggestedSlots: async (params) => {
    const response = await api.get('/meetings/suggested-slots', { params });
    return response.data;
  },
};

export const reportsService = {
  getOverview: async () => {
    const response = await api.get('/reports/overview');
    return response.data;
  },
  getFacultyWorkload: async () => {
    const response = await api.get('/reports/faculty-workload');
    return response.data;
  },
  getRoomUtilization: async () => {
    const response = await api.get('/reports/room-utilization');
    return response.data;
  },
};

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },
  getByUser: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}`);
    return response.data;
  },
  getUnreadByUser: async (userId) => {
    const response = await api.get(`/notifications/user/${userId}/unread`);
    return response.data;
  },
  markAsRead: async (id) => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },
  markAllAsRead: async (userId) => {
    const response = await api.patch(`/notifications/user/${userId}/read-all`);
    return response.data;
  },
};

export const metadataService = {
  getDepartments: async () => (await api.get('/departments')).data,
  getAcademicYears: async () => (await api.get('/academic-years')).data,
  getSemesters: async () => (await api.get('/semesters')).data,
  getSections: async () => (await api.get('/sections')).data,
  getSubjects: async () => (await api.get('/subjects')).data,
  getRooms: async () => (await api.get('/rooms')).data,
  getTimeSlots: async () => (await api.get('/time-slots')).data,
  getTimetables: async () => (await api.get('/timetables')).data,
};

export const roomService = {
  getAll: async () => (await api.get('/rooms')).data,
  getById: async (id) => (await api.get(`/rooms/${id}`)).data,
};

export const subjectService = {
  getAll: async () => (await api.get('/subjects')).data,
  getById: async (id) => (await api.get(`/subjects/${id}`)).data,
};

export const departmentService = {
  getAll: async () => (await api.get('/departments')).data,
  getById: async (id) => (await api.get(`/departments/${id}`)).data,
};

export const sectionService = {
  getAll: async () => (await api.get('/sections')).data,
  getById: async (id) => (await api.get(`/sections/${id}`)).data,
};

export const checkHealth = async () => {
  const startTime = Date.now();
  const response = await api.get('/health');
  const latency = Date.now() - startTime;
  return { ...response.data, latency };
};

export default api;
