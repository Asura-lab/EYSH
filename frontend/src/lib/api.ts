import axios, { AxiosInstance, AxiosResponse } from "axios";

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
  me: (): Promise<AxiosResponse<User>> => api.get("/api/auth/me"),
};

// Test API
export const testAPI = {
  getQuestions: (subject: string, count: number): Promise<AxiosResponse<Question[]>> =>
    api.get(`/api/tests/questions?subject=${subject}&count=${count}`),
  submitTest: (data: SubmitTestData): Promise<AxiosResponse<{ score: number; level: string }>> =>
    api.post("/api/tests/submit", data),
  getHistory: (): Promise<AxiosResponse<TestHistory[]>> => api.get("/api/tests/history"),
};

// Roadmap API
export const roadmapAPI = {
  generate: (): Promise<AxiosResponse<Roadmap>> => api.post("/api/roadmap/generate"),
  get: (): Promise<AxiosResponse<Roadmap>> => api.get("/api/roadmap"),
  updateProgress: (weekId: string, progress: number): Promise<AxiosResponse<RoadmapWeek>> =>
    api.patch(`/api/roadmap/${weekId}/progress`, { progress }),
};

// Mentoring API
export const mentoringAPI = {
  getMentors: (subject?: string): Promise<AxiosResponse<Mentor[]>> =>
    api.get(`/api/mentoring/mentors${subject ? `?subject=${subject}` : ""}`),
  requestMentor: (mentorId: string): Promise<AxiosResponse<{ success: boolean }>> =>
    api.post(`/api/mentoring/request/${mentorId}`),
  getMyMentor: (): Promise<AxiosResponse<Mentor | null>> => api.get("/api/mentoring/my-mentor"),
};
