import axios from 'axios';

// Lazy initialization to avoid TDZ issues with import.meta.env
let API_BASE_URL = null;

const getApiBaseUrl = () => {
  if (!API_BASE_URL) {
    // Use the deployed backend URL
    const backendUrl = import.meta.env.VITE_BACKEND_URL || 'https://backendv2-ruddy.vercel.app';
    
    // Handle cases where VITE_BACKEND_URL already includes /api
    if (backendUrl.includes('/api')) {
      API_BASE_URL = backendUrl;
    } else {
      API_BASE_URL = backendUrl.endsWith('/') ? backendUrl + 'api' : backendUrl + '/api';
    }
  }
  return API_BASE_URL;
};

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('thinktact_token');
  console.log('🔍 AnalysisService: Retrieved token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

// Save a new analysis
export const saveAnalysis = async (originalArgument, processedAnalysis) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${getApiBaseUrl()}/analysis/save`, {
      originalArgument,
      processedAnalysis
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error saving analysis:', error);
    throw error;
  }
};

// Get user's analysis history
export const getAnalysisHistory = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${getApiBaseUrl()}/analysis/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.history;
  } catch (error) {
    console.error('Error getting analysis history:', error);
    throw error;
  }
};

// Delete a specific analysis
export const deleteAnalysis = async (analysisId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete(`${getApiBaseUrl()}/analysis/delete`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: {
        analysisId
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting analysis:', error);
    throw error;
  }
}; 
