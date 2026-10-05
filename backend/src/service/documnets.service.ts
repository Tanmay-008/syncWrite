import { Document } from "../model/document.model";
import { ApiError } from "../utils/ApiError";

export const documentService = async (documentName?: string) => {
    try {
        const document = await Document.create(documentName ? { documentName } : {});
        return document;
    } catch (error: any) {
        throw new ApiError(500, "Document creation failed", error?.message);
    }
}