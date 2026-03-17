import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Backend base URL
  withCredentials: true, // Send cookies with every request
});

export default api;
