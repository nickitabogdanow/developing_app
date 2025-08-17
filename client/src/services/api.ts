import axios from 'axios';
import { 
  User, 
  Project, 
  AIAgent, 
  TeamMember, 
  ChatRoom, 
  Message, 
  Sprint, 
  Bug,
  LoginForm,
  RegisterForm,
  ProjectForm,
  SprintForm,
  BugForm
} from '../types';

// Настройка axios
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Интерцептор для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: LoginForm) => api.post('/auth/login', data),
  register: (data: RegisterForm) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
};

// Projects API
export const projectsAPI = {
  getUserProjects: (userId: string) => api.get(`/projects/user/${userId}`),
  getProject: (id: string) => api.get(`/projects/${id}`),
  createProject: (data: ProjectForm & { clientId: string }) => api.post('/projects', data),
  updateProject: (id: string, data: Partial<ProjectForm>) => api.put(`/projects/${id}`, data),
  deleteProject: (id: string) => api.delete(`/projects/${id}`),
  getProjectStats: (id: string) => api.get(`/projects/${id}/stats`),
};

// AI Agents API
export const aiAPI = {
  getAgents: () => api.get('/ai/agents'),
  getAgent: (id: string) => api.get(`/ai/agents/${id}`),
  createTeam: (projectId: string, agentIds: string[]) => 
    api.post('/ai/teams', { projectId, agentIds }),
  getProjectTeam: (projectId: string) => api.get(`/ai/teams/${projectId}`),
  planSprint: (projectId: string, sprintData: SprintForm) => 
    api.post('/ai/sprint-plan', { projectId, sprintData }),
  initializeAgents: () => api.post('/ai/initialize'),
};

// Chat API
export const chatAPI = {
  getRoomMessages: (roomId: string, limit = 50, offset = 0) => 
    api.get(`/chat/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`),
  getProjectRooms: (projectId: string) => api.get(`/chat/projects/${projectId}/rooms`),
  createRoom: (data: { projectId: string; name: string; roomType?: string }) => 
    api.post('/chat/rooms', data),
  addParticipant: (roomId: string, data: { userId?: string; agentId?: string }) => 
    api.post(`/chat/rooms/${roomId}/participants`, data),
  initializeProjectRooms: (projectId: string) => 
    api.post(`/chat/projects/${projectId}/initialize-rooms`),
};

// Sprints API
export const sprintsAPI = {
  createSprint: (data: SprintForm & { projectId: string }) => api.post('/sprints', data),
  getProjectSprints: (projectId: string) => api.get(`/sprints/project/${projectId}`),
  getSprint: (id: string) => api.get(`/sprints/${id}`),
  updateSprint: (id: string, data: Partial<SprintForm>) => api.put(`/sprints/${id}`, data),
  deleteSprint: (id: string) => api.delete(`/sprints/${id}`),
};

// Bugs API
export const bugsAPI = {
  createBug: (data: BugForm & { projectId: string; reportedBy: string }) => 
    api.post('/bugs', data),
  getProjectBugs: (projectId: string) => api.get(`/bugs/project/${projectId}`),
  getBug: (id: string) => api.get(`/bugs/${id}`),
  updateBug: (id: string, data: Partial<BugForm>) => api.put(`/bugs/${id}`, data),
  deleteBug: (id: string) => api.delete(`/bugs/${id}`),
  getBugStats: (projectId: string) => api.get(`/bugs/project/${projectId}/stats`),
};

export default api;
