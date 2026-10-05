import axios from 'axios';

const API_BASE_URL = import.meta.env.DEV_BASE_URL || 'http://localhost:4000/api/v1';

export const createDocument = async (documentName?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/documents/create-document`, {
      documentName,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};
