import axios from 'axios';
import { getAuthToken } from './authService.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Save a new patent application
export const savePatentApplication = async (applicationData) => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await axios.post(`${API_BASE_URL}/patent-applications/save`, applicationData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error saving patent application:', error);
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