import axios, { AxiosInstance, AxiosResponse, AxiosRequestConfig } from "axios";
import { cachedAxiosGet } from "@/lib/requestCache";

interface RegisterData {
  email: string;
  password: string;
  name: string;
}

interface TestAnswer {
  questionId: string;
  answer: string;
  timeSpent: number;
}

interface SubmitTestData {
  answers: TestAnswer[];
}

interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface Question {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  question: string;
  options: { id: string; text: string }[];
}

interface TestHistory {
  id: string;
  date: string;
  score: number;
  subject: string;
}

interface Roadmap {
  id: string;
  weeks: RoadmapWeek[];
}

interface RoadmapWeek {
  id: string;
  title: string;
  progress: number;
  topics: string[];
}

interface Mentor {
  id: string;
  name: string;
  university: string;
  subjects: string[];
  rating: number;
}

const API_URL: string = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/api/auth/login", { email, password }),
  register: (data: RegisterData): Promise<AxiosResponse<AuthResponse>> =>
    api.post("/api/auth/register", data),
  me: (): Promise<AxiosResponse<User>> => cachedAxiosGet<User>(api, "/api/auth/me"),
};

// Test API
export const testAPI = {
  getQuestions: (subject: string, count: number): Promise<AxiosResponse<Question[]>> =>
    api.get(`/api/tests/questions?subject=${subject}&count=${count}`),
  submitTest: (data: SubmitTestData): Promise<AxiosResponse<{ score: number; level: string }>> =>
    api.post("/api/tests/submit", data),
  getHistory: (): Promise<AxiosResponse<TestHistory[]>> => cachedAxiosGet<TestHistory[]>(api, "/api/tests/history"),
};

// Roadmap API
export const roadmapAPI = {
  generate: (): Promise<AxiosResponse<Roadmap>> => api.post("/api/roadmap/generate"),
  get: (): Promise<AxiosResponse<Roadmap>> => cachedAxiosGet<Roadmap>(api, "/api/roadmap"),
  updateProgress: (weekId: string, progress: number): Promise<AxiosResponse<RoadmapWeek>> =>
    api.patch(`/api/roadmap/${weekId}/progress`, { progress }),
};

// Mentoring API
export const mentoringAPI = {
  getMentors: (subject?: string): Promise<AxiosResponse<Mentor[]>> =>
    cachedAxiosGet<Mentor[]>(api, `/api/mentoring/mentors${subject ? `?subject=${subject}` : ""}`),
  requestMentor: (mentorId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.post(`/api/mentoring/request/${mentorId}`),
  getMyMentor: (): Promise<AxiosResponse<Mentor | null>> =>
    cachedAxiosGet<Mentor | null>(api, "/api/mentoring/my-mentor"),
};

// Topic Content API
export interface TopicContent {
  _id: string;
  topic: string;
  title: string;
  youtube_id: string;
  summary: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export const topicsAPI = {
  get: (topicName: string): Promise<AxiosResponse<TopicContent>> =>
    cachedAxiosGet<TopicContent>(api, `/api/topics/${encodeURIComponent(topicName)}`),
};

// Admin Analytics Types
export interface TopicViewStats {
  topic: string;
  view_count: number;
  unique_users: number;
  last_viewed: string | null;
}

export interface DailyViewStats {
  date: string;
  views: number;
  unique_users: number;
}

export interface UserActivityStats {
  users_by_role: Record<string, number>;
  new_users_week: number;
  new_users_month: number;
  total_tests: number;
  tests_this_week: number;
}

export interface SuggestedTopic {
  topic: string;
  demand_count: number;
  unique_users: number;
}

export interface WeeklyGrowth {
  week: string;
  week_start: string;
  new_users: number;
}

export interface TestPerformance {
  subject: string;
  avg_score: number;
  total_tests: number;
  max_score: number;
  min_score: number;
}

export interface AdminStats {
  total_users: number;
  total_topics: number;
  total_questions: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  profile: {
    grade?: number;
    target_university?: string;
    target_score?: number;
    subjects?: string[];
  };
}

export interface ProblemImage {
  id: string;
  filename?: string;
  content_type?: string;
  source_url?: string;
}

export interface Problem {
  id: string;
  subject: string;
  topic: string;
  difficulty: string;
  text: string;
  images: ProblemImage[];
  source?: string;
  source_url?: string;
  number?: number;
  created_at?: string;
}

export interface ProblemUpdate {
  subject?: string;
  topic?: string;
  difficulty?: string;
  text?: string;
  images?: ProblemImage[];
  source?: string;
  source_url?: string;
  number?: number;
}

// Admin API
export const adminAPI = {
  getStats: (config?: AxiosRequestConfig): Promise<AxiosResponse<AdminStats>> =>
    cachedAxiosGet<AdminStats>(api, "/api/admin/stats", config),
  getUsers: (config?: AxiosRequestConfig): Promise<AxiosResponse<AdminUser[]>> =>
    cachedAxiosGet<AdminUser[]>(api, "/api/admin/users", config),
  updateUser: (userId: string, data: Partial<AdminUser>, config?: AxiosRequestConfig): Promise<AxiosResponse<AdminUser>> =>
    api.patch(`/api/admin/users/${userId}`, data, config),
  getTopicViews: (config?: AxiosRequestConfig): Promise<AxiosResponse<TopicViewStats[]>> =>
    cachedAxiosGet<TopicViewStats[]>(api, "/api/admin/analytics/topic-views", config),
  getDailyViews: (days?: number, config?: AxiosRequestConfig): Promise<AxiosResponse<DailyViewStats[]>> =>
    cachedAxiosGet<DailyViewStats[]>(
      api,
      `/api/admin/analytics/daily-views${days ? `?days=${days}` : ""}`,
      config
    ),
  getUserActivity: (config?: AxiosRequestConfig): Promise<AxiosResponse<UserActivityStats>> =>
    cachedAxiosGet<UserActivityStats>(api, "/api/admin/analytics/user-activity", config),
  getSuggestedTopics: (config?: AxiosRequestConfig): Promise<AxiosResponse<SuggestedTopic[]>> =>
    cachedAxiosGet<SuggestedTopic[]>(api, "/api/admin/analytics/suggested-topics", config),
  getWeeklyGrowth: (weeks?: number, config?: AxiosRequestConfig): Promise<AxiosResponse<WeeklyGrowth[]>> =>
    cachedAxiosGet<WeeklyGrowth[]>(
      api,
      `/api/admin/analytics/weekly-growth${weeks ? `?weeks=${weeks}` : ""}`,
      config
    ),
  getTestPerformance: (config?: AxiosRequestConfig): Promise<AxiosResponse<TestPerformance[]>> =>
    cachedAxiosGet<TestPerformance[]>(api, "/api/admin/analytics/test-performance", config),
};

export const problemsAPI = {
  list: (
    params?: { subject?: string; topic?: string; difficulty?: string; source?: string; limit?: number; skip?: number },
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<Problem[]>> =>
    cachedAxiosGet<Problem[]>(api, "/api/problems", { ...config, params }),
  create: (data: Omit<Problem, "id" | "created_at">, config?: AxiosRequestConfig): Promise<AxiosResponse<Problem>> =>
    api.post("/api/problems", data, config),
  update: (id: string, data: ProblemUpdate, config?: AxiosRequestConfig): Promise<AxiosResponse<Problem>> =>
    api.patch(`/api/problems/${id}`, data, config),
  delete: (id: string, config?: AxiosRequestConfig): Promise<AxiosResponse<{ status: string; id: string }>> =>
    api.delete(`/api/problems/${id}`, config),
  uploadImage: (file: File, config?: AxiosRequestConfig): Promise<AxiosResponse<ProblemImage>> => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/api/problems/images", formData, {
      ...config,
      headers: {
        ...(config?.headers || {}),
        "Content-Type": "multipart/form-data",
      },
    });
  },
};
