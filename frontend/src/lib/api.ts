import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Auth API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post("/api/auth/login", { email, password }),
  register: (data: { email: string; password: string; name: string }) =>
    api.post("/api/auth/register", data),
  me: () => api.get("/api/auth/me"),
};

// Test API
export const testAPI = {
  getQuestions: (subject: string, count: number) =>
    api.get(`/api/tests/questions?subject=${subject}&count=${count}`),
  submitTest: (data: { answers: any[] }) =>
    api.post("/api/tests/submit", data),
  getHistory: () => api.get("/api/tests/history"),
};

// Roadmap API
export const roadmapAPI = {
  generate: () => api.post("/api/roadmap/generate"),
  get: () => api.get("/api/roadmap"),
  updateProgress: (weekId: string, progress: number) =>
    api.patch(`/api/roadmap/${weekId}/progress`, { progress }),
};

// Mentoring API
export const mentoringAPI = {
  getMentors: (subject?: string) =>
    api.get(`/api/mentoring/mentors${subject ? `?subject=${subject}` : ""}`),
  requestMentor: (mentorId: string) =>
    api.post(`/api/mentoring/request/${mentorId}`),
  getMyMentor: () => api.get("/api/mentoring/my-mentor"),
};
