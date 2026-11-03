import { axiosAPI } from "@/lib/axios";

export const createDocument = async (documentName?: string, userId?: string) => {
  try {
    const response = await axiosAPI.post("/documents/create-document", {
      documentName,
      userId,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

