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
export const getLiveLocations = () => fetchData('/tracking/live-locations', liveLocationsData);
export const getAssistants = () => fetchData('/assistants', assistantsData);
export const getParents = () => fetchData('/parents', parentsData);

export default api;
