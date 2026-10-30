import { axiosAPI } from "@/lib/axios";

export const createDocument = async (documentName?: string) => {
  try {
    const response = await axiosAPI.post("/documents/create-document", {
      documentName,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    throw error;
  }
};

