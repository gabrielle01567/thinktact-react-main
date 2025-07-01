import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('thinktact_token');
};

// Save a new analysis
export const saveAnalysis = async (originalArgument, processedAnalysis) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${API_BASE_URL}/analysis/save`, {
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

    const response = await axios.get(`${API_BASE_URL}/analysis/history`, {
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

    const response = await axios.delete(`${API_BASE_URL}/analysis/delete`, {
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