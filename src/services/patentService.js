import axios from 'axios';

// Use the deployed backend URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'https://backendv2-ruddy.vercel.app/api';

// Get auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('thinktact_token');
  console.log('🔍 PatentService: Retrieved token:', token ? token.substring(0, 20) + '...' : 'null');
  return token;
};

// Get application count and limit for the current user
export const getApplicationCount = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}/patent-applications/count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error getting application count:', error);
    throw error;
  }
};

// Save a new patent application
export const savePatentApplication = async (applicationData) => {
  try {
    const token = getAuthToken();
    console.log('🔍 PatentService: Attempting to save application');
    console.log('🔍 PatentService: Token exists:', !!token);
    console.log('🔍 PatentService: API URL:', `${API_BASE_URL}/patent-applications/save`);
    console.log('🔍 PatentService: Application data:', {
      title: applicationData.title,
      status: applicationData.status,
      completedSections: applicationData.completedSections
    });
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${API_BASE_URL}/patent-applications/save`, applicationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('🔍 PatentService: Save successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('🔍 PatentService: Save error details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

// Update an existing patent application
export const updatePatentApplication = async (applicationId, applicationData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.put(`${API_BASE_URL}/patent-applications/${applicationId}`, applicationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error updating patent application:', error);
    throw error;
  }
};

// Get all patent applications for the current user
export const getPatentApplications = async () => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}/patent-applications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.applications;
  } catch (error) {
    console.error('Error getting patent applications:', error);
    throw error;
  }
};

// Get a specific patent application
export const getPatentApplication = async (applicationId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.get(`${API_BASE_URL}/patent-applications/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data.application;
  } catch (error) {
    console.error('Error getting patent application:', error);
    throw error;
  }
};

// Delete a patent application
export const deletePatentApplication = async (applicationId) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.delete(`${API_BASE_URL}/patent-applications/${applicationId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting patent application:', error);
    throw error;
  }
}; 