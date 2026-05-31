import axios from 'axios';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const emergencyAPI = {
  // Create emergency
  createEmergency: (data: any) =>
    apiClient.post('/emergency', data),
  
  // Get emergency details
  getEmergency: (id: string) =>
    apiClient.get(`/emergency/${id}`),
  
  // Get nearby services
  getNearbyServices: (lat: number, lng: number, type: string) =>
    apiClient.get('/services/nearby', { 
      params: { latitude: lat, longitude: lng, service_type: type } 
    }),
  
  // Get evacuation guide
  getEvacuationGuide: (emergencyType: string) =>
    apiClient.get(`/emergency/evacuation/${emergencyType}`),
  
  // Update emergency status
  updateEmergency: (id: string, data: any) =>
    apiClient.put(`/emergency/${id}`, data),
  
  // Join as bystander
  joinAsBystander: (incidentId: string, data: any) =>
    apiClient.post(`/emergency/${incidentId}/bystander`, data),
};

export const userAPI = {
  // Get user profile
  getProfile: () =>
    apiClient.get('/users/me'),
  
  // Update user profile
  updateProfile: (data: any) =>
    apiClient.put('/users/me', data),
  
  // Generate QR code
  generateQRCode: () =>
    apiClient.post('/users/qr-code'),
};

export default apiClient;
