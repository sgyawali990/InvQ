import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:4000' || import.meta.env.VITE_API_URL,
});

export const setToken = (token) => {
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export default api;