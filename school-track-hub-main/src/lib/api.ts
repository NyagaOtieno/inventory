import axios from 'axios';
import { getConfig } from './config';

// Mock data imports
import studentsData from '../mock/students.json';
import busesData from '../mock/buses.json';
import manifestsData from '../mock/manifests.json';
import liveLocationsData from '../mock/live-locations.json';
import assistantsData from '../mock/assistants.json';
import parentsData from '../mock/parents.json';

const api = axios.create({
  baseURL: getConfig().apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Generic fetch function that switches between mock and live data
export const fetchData = async <T>(endpoint: string, mockData: T): Promise<T> => {
  const { useMockData } = getConfig();
  
  if (useMockData) {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockData), 500); // Simulate network delay
    });
  }
  
  const response = await api.get(endpoint);
  return response.data;
};

// API functions
export const getStudents = () => fetchData('/students', studentsData);
export const getBuses = () => fetchData('/buses', busesData);
export const getManifests = () => fetchData('/manifests', manifestsData);
export const getLiveLocations = () => fetchData('/tracking/bus-locations', liveLocationsData);
export const getAssistants = () => fetchData('/users?role=ASSISTANT', assistantsData);
export const getParents = () => fetchData('/users?role=PARENT', parentsData);

// Additional API methods for CRUD operations
export const createStudent = (data: any) => api.post('/students', data);
export const updateStudent = (id: number, data: any) => api.put(`/students/${id}`, data);
export const deleteStudent = (id: number) => api.delete(`/students/${id}`);

export const createBus = (data: any) => api.post('/buses', data);
export const updateBus = (id: number, data: any) => api.put(`/buses/${id}`, data);
export const deleteBus = (id: number) => api.delete(`/buses/${id}`);

export const createManifest = (data: any) => api.post('/manifests', data);
export const updateManifest = (id: number, data: any) => api.put(`/manifests/${id}`, data);
export const deleteManifest = (id: number) => api.delete(`/manifests/${id}`);

export default api;
