import axios from 'axios';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

client.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('edutuition_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const api = {
  // Auth & Profile
  login: (email, password) => client.post('/auth/login', { email, password }),
  getMe: () => client.get('/auth/me'),
  updateProfile: (data) => client.put('/auth/profile', data),
  changePassword: (data) => client.put('/auth/change-password', data),

  // Settings
  getSettings: () => client.get('/settings'),
  updateSettings: (data) => client.put('/settings', data),

  // Dashboard
  getDashboardStats: () => client.get('/analytics/dashboard-stats'),

  // Students
  getStudents: (params) => client.get('/students', { params }),
  getStudentById: (id) => client.get(`/students/${id}`),
  createStudent: (data) => client.post('/students', data),
  updateStudent: (id, data) => client.put(`/students/${id}`, data),
  deleteStudent: (id) => client.delete(`/students/${id}`),
  getStudentQrData: (id) => client.get(`/students/${id}/qr-data`),

  // Classes
  getClasses: (params) => client.get('/classes', { params }),
  getClassById: (id) => client.get(`/classes/${id}`),
  createClass: (data) => client.post('/classes', data),
  updateClass: (id, data) => client.put(`/classes/${id}`, data),
  deleteClass: (id) => client.delete(`/classes/${id}`),
  getTimetable: () => client.get('/classes/timetable'),

  // Attendance
  getAttendance: (params) => client.get('/attendance', { params }),
  markAttendanceSingle: (data) => client.post('/attendance/mark', data),
  markAttendanceAll: (data) => client.post('/attendance/mark-all', data),
  scanQrAttendance: (data) => client.post('/attendance/scan-qr', data),
  getStudentAttendanceHistory: (studentId) => client.get(`/attendance/student/${studentId}`),

  // Fees
  getFees: (params) => client.get('/fees', { params }),
  recordPayment: (data) => client.post('/fees/record', data),
  getReceipt: (receiptNumber) => client.get(`/fees/receipt/${receiptNumber}`),
  getFinancialOverview: () => client.get('/fees/overview'),

  // Homework
  getHomework: (params) => client.get('/homework', { params }),
  getStudentHomework: (studentId) => client.get(`/homework/student/${studentId}`),
  createHomework: (data) => client.post('/homework', data),
  submitHomework: (data) => client.post('/homework/submit', data),
  reviewHomeworkSubmission: (id, data) => client.put(`/homework/submissions/${id}/review`, data),
  getHomeworkSubmissions: (homeworkId) => client.get(`/homework/${homeworkId}/submissions`),

  // Exams
  getExams: (params) => client.get('/exams', { params }),
  createExam: (data) => client.post('/exams', data),
  enterExamMarks: (examId, marks) => client.post(`/exams/${examId}/marks`, { marks }),
  getExamMarks: (examId) => client.get(`/exams/${examId}/marks`),

  // Analytics & Performance
  getStudentPerformance: (studentId) => client.get(`/analytics/performance/${studentId}`),

  // Materials
  getMaterials: (params) => client.get('/materials', { params }),
  createMaterial: (data) => client.post('/materials', data),
  deleteMaterial: (id) => client.delete(`/materials/${id}`),

  // Announcements
  getAnnouncements: (params) => client.get('/announcements', { params }),
  createAnnouncement: (data) => client.post('/announcements', data),
  deleteAnnouncement: (id) => client.delete(`/announcements/${id}`),

  // Notifications
  getNotifications: () => client.get('/notifications'),
  markNotificationRead: (id) => client.put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => client.post('/notifications/read-all'),

  // Calendar
  getCalendarEvents: (params) => client.get('/calendar', { params }),
  createCalendarEvent: (data) => client.post('/calendar', data),

  // AI Suite
  getAiInsights: (studentId) => client.post('/ai/performance-insights', { studentId }),
  generateAiHomework: (data) => client.post('/ai/generate-homework', data),
  generateAiQuiz: (data) => client.post('/ai/generate-quiz', data),
  generateAiQuestionPaper: (data) => client.post('/ai/generate-question-paper', data),
  detectAiRisk: () => client.get('/ai/student-risk-detection'),

  // Reports
  getStudentReport: (studentId, format = 'json') => client.get(`/reports/student/${studentId}`, { params: { format } }),
  getClassReport: (classId, format = 'json') => client.get(`/reports/class/${classId}`, { params: { format } }),
  getFinancialReport: (year, format = 'json') => client.get('/reports/financial', { params: { year, format } })
};

export default client;
