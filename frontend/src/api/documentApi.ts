import { axiosAPI } from "@/lib/axios";

export interface UserDocument {
  id: string;
  documentName: string;
  authorId: string;
  isOwner: boolean;
  collaboratorsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PendingUser {
  userId: string;
  userName: string;
  email: string;
}

export interface DocumentAccessInfo {
  docId: string;
  documentName: string;
  isAuthor: boolean;
  isCollaborator: boolean;
  isPending: boolean;
  isRejected: boolean;
  hasAccess: boolean;
  author: {
    userName: string;
    email: string;
  } | null;
  pendingUsers: PendingUser[];
}

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

export const getDocumentAccessInfo = async (docId: string) => {
  try {
    const response = await axiosAPI.get(`/documents/${docId}/access-info`);
    return response.data?.data as DocumentAccessInfo;
  } catch (error) {
    console.error("Error fetching access info:", error);
    throw error;
  }
};

export const requestDocumentAccess = async (docId: string) => {
  try {
    const response = await axiosAPI.post(`/documents/${docId}/request-access`);
    return response.data;
  } catch (error) {
    console.error("Error requesting document access:", error);
    throw error;
  }
};

export const approveDocumentAccess = async (docId: string, targetUserId: string) => {
  try {
    const response = await axiosAPI.post(`/documents/${docId}/approve-access`, {
      targetUserId,
    });
    return response.data;
  } catch (error) {
    console.error("Error approving document access:", error);
    throw error;
  }
};

export const rejectDocumentAccess = async (docId: string, targetUserId: string) => {
  try {
    const response = await axiosAPI.post(`/documents/${docId}/reject-access`, {
      targetUserId,
    });
    return response.data;
  } catch (error) {
    console.error("Error rejecting document access:", error);
    throw error;
  }
};

export const getUserDocuments = async (): Promise<UserDocument[]> => {
  try {
    const response = await axiosAPI.get("/documents/user-documents");
    return response.data?.data || [];
  } catch (error) {
    console.error("Error fetching user documents:", error);
    throw error;
  }
};

export const deleteDocument = async (docId: string) => {
  try {
    const response = await axiosAPI.delete(`/documents/${docId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};

