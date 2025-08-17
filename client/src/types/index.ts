// User types
export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

// AI Agent types
export interface AIAgent {
  id: string;
  name: string;
  role: string;
  specialization: string;
  personality: string;
  expertise_level: string;
  is_active: boolean;
  created_at: string;
}

// Project types
export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  status: string;
  budget: number;
  deadline: string;
  created_at: string;
  updated_at: string;
}

// Team member types
export interface TeamMember {
  id: string;
  project_id: string;
  agent_id: string;
  role_in_project: string;
  assigned_at: string;
  name: string;
  role: string;
  specialization: string;
  personality: string;
  expertise_level: string;
}

// Chat types
export interface ChatRoom {
  id: string;
  name: string;
  project_id: string;
  room_type: string;
  created_at: string;
}

export interface Message {
  id: string;
  room_id: string;
  sender_type: 'user' | 'ai';
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  sender_name?: string;
  sender_info?: string;
}

// Sprint types
export interface Sprint {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

// Task types
export interface Task {
  id: string;
  sprint_id: string;
  title: string;
  description: string;
  assigned_to: string;
  priority: string;
  status: string;
  estimated_hours: number;
  actual_hours: number;
  created_at: string;
  updated_at: string;
}

// Bug types
export interface Bug {
  id: string;
  project_id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  assigned_to: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
  reporter_name?: string;
  assigned_to_name?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ProjectForm {
  name: string;
  description: string;
  budget: string;
  deadline: string;
}

export interface SprintForm {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface BugForm {
  title: string;
  description: string;
  severity: string;
}

// Socket types
export interface SocketMessage {
  roomId: string;
  senderType: 'user' | 'ai';
  senderId: string;
  content: string;
  messageType: string;
}

// Status enums
export enum ProjectStatus {
  PLANNING = 'planning',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum SprintStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  REVIEW = 'review',
  DONE = 'done'
}

export enum BugStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  TESTING = 'testing',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}
