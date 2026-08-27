import axios from 'axios';

// Create an Axios instance
const client = axios.create({
  // Replace with your actual backend API URL. 
  // I put your IP here as a placeholder assuming you might run a local backend.
  baseURL: 'http://192.168.12.230:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Optional: Add request interceptors (e.g., to attach auth tokens)
client.interceptors.request.use(
  async (config) => {
    // Example: attach token from storage
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client;
