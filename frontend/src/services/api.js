import axios from 'axios';

// In dev, Vite proxies /api -> http://localhost:8000 (see vite.config.js).
// In production, set VITE_API_BASE_URL to your deployed backend URL,
// e.g. "https://your-backend.onrender.com" (no trailing slash).
const baseURL = `${import.meta.env.VITE_API_BASE_URL || ''}/api`;

const api = axios.create({
  baseURL,
  timeout: 120000,
});

export const generateProject = (idea, title) =>
  api.post('/generate', { idea, title }).then((r) => r.data);

export const listProjects = () => api.get('/projects').then((r) => r.data);
export const getProject = (id) => api.get(`/projects/${id}`).then((r) => r.data);
export const deleteProject = (id) => api.delete(`/projects/${id}`).then((r) => r.data);
export const getWorkflowSteps = () =>
  api.get('/workflow-steps').then((r) => r.data.steps);

export const askAI = (question, context) =>
  api.post('/ask', { question, context }).then((r) => r.data);

export const customizeProject = (id, preferences) =>
  api.post(`/projects/${id}/customize`, { preferences }).then((r) => r.data);

export const updateTaskProgress = (id, sprintIndex, taskIndex, completed) =>
  api
    .post(`/projects/${id}/progress`, {
      sprint_index: sprintIndex,
      task_index: taskIndex,
      completed,
    })
    .then((r) => r.data);

export const updateSprint = (id, sprintIndex, patch) =>
  api
    .patch(`/projects/${id}/sprints/${sprintIndex}`, patch)
    .then((r) => r.data);

export const getHealth = () => api.get('/health').then((r) => r.data);

export default api;
