import { Document } from "../model/document.model";

export const documentService = async () => {
    try {
        const d = await Document.create({});
        return d;
    } catch (error) {
        return
    }

}