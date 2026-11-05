import mongoose from "mongoose";
import { Document } from "../model/document.model";
import { UserModel } from "../model/user.model";
import { ApiError } from "../utils/ApiError";
import { getChildLogger } from "../utils/logger";

const logger = getChildLogger("DocumentService");

const validateObjectId = (id: string, label = "Document ID") => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
        logger.warn(`Invalid ${label} format received: ${id}`);
        throw new ApiError(400, `Invalid ${label}`);
    }
};

export const documentService = async (authorId: string, documentName?: string) => {
    try {
        const document = await Document.create({
            authorId: authorId.toString(),
            ...(documentName ? { documentName } : {}),
        });
        logger.info(`Created new document ${document._id} for author ${authorId}`);
        return document;
    } catch (error: any) {
        logger.error(`Document creation failed for author ${authorId}: ${error?.message}`);
        throw new ApiError(500, "Document creation failed", error?.message);
    }
};

export const requestDocumentAccess = async (docId: string, userId: string) => {
    validateObjectId(docId, "Document ID");

    let document;
    try {
        document = await Document.findById(docId).select("-crdtState").lean();
    } catch (error: any) {
        logger.error(`DB error fetching doc ${docId} in requestDocumentAccess: ${error?.message}`);
        throw new ApiError(500, "Failed to check document access");
    }

    if (!document) {
        logger.warn(`Access request failed: Document ${docId} not found`);
        throw new ApiError(404, "Document not found");
    }

    const uId = userId.toString();
    const isOwner = document.authorId?.toString() === uId;
    const isCollab = document.collaborators?.some((c: any) => c?.toString() === uId) ?? false;

    if (isOwner || isCollab) {
        return { message: "You already have access to this document", status: "already_granted" };
    }

    const alreadyPending = document.pendingRequests?.some((p: any) => p?.toString() === uId) ?? false;
    if (alreadyPending) {
        return { message: "Access request is already pending", status: "already_pending" };
    }

    const wasRejected = document.rejectedRequests?.some((r: any) => r?.toString() === uId) ?? false;
    if (wasRejected) {
        logger.warn(`Rejected user ${uId} attempted to re-request access to doc ${docId}`);
        throw new ApiError(403, "The document owner has declined your access request.");
    }

    try {
        await Document.updateOne(
            { _id: docId },
            { $addToSet: { pendingRequests: uId } }
        );
    } catch (error: any) {
        logger.error(`Failed to save access request for user ${uId} on doc ${docId}: ${error?.message}`);
        throw new ApiError(500, "Failed to submit access request");
    }

    logger.info(`User ${uId} requested access to doc ${docId}`);
    return { message: "Access request sent to author", status: "pending" };
};

export const approveDocumentAccess = async (docId: string, authorId: string, targetUserId: string) => {
    validateObjectId(docId, "Document ID");
    validateObjectId(targetUserId, "Target User ID");

    const tUserId = targetUserId.toString();
    const authId = authorId.toString();

    let result;
    try {
        result = await Document.updateOne(
            { _id: docId, authorId: authId },
            {
                $pull: { pendingRequests: tUserId, rejectedRequests: tUserId },
                $addToSet: { collaborators: tUserId },
            }
        );
    } catch (error: any) {
        logger.error(`DB error approving user ${tUserId} on doc ${docId}: ${error?.message}`);
        throw new ApiError(500, "Failed to approve access request");
    }

    if (result.matchedCount === 0) {
        const exists = await Document.exists({ _id: docId });
        if (!exists) {
            throw new ApiError(404, "Document not found");
        }
        logger.warn(`Unauthorized approve attempt on doc ${docId} by user ${authId}`);
        throw new ApiError(403, "Only the author can approve access requests");
    }

    logger.info(`Author ${authId} approved user ${tUserId} for doc ${docId}`);
    return { message: "Access granted successfully" };
};

export const rejectDocumentAccess = async (docId: string, authorId: string, targetUserId: string) => {
    validateObjectId(docId, "Document ID");
    validateObjectId(targetUserId, "Target User ID");

    const tUserId = targetUserId.toString();
    const authId = authorId.toString();

    let result;
    try {
        result = await Document.updateOne(
            { _id: docId, authorId: authId },
            {
                $pull: { pendingRequests: tUserId, collaborators: tUserId },
                $addToSet: { rejectedRequests: tUserId },
            }
        );
    } catch (error: any) {
        logger.error(`DB error rejecting user ${tUserId} on doc ${docId}: ${error?.message}`);
        throw new ApiError(500, "Failed to reject access request");
    }

    if (result.matchedCount === 0) {
        const exists = await Document.exists({ _id: docId });
        if (!exists) {
            throw new ApiError(404, "Document not found");
        }
        logger.warn(`Unauthorized reject attempt on doc ${docId} by user ${authId}`);
        throw new ApiError(403, "Only the author can reject access requests");
    }

    logger.info(`Author ${authId} rejected user ${tUserId} for doc ${docId}`);
    return { message: "Access request rejected" };
};

export const getDocumentAccessInfo = async (docId: string, userId: string) => {
    validateObjectId(docId, "Document ID");

    let document;
    try {
        document = await Document.findById(docId).select("-crdtState").lean();
    } catch (error: any) {
        logger.error(`DB error in getDocumentAccessInfo for doc ${docId}: ${error?.message}`);
        throw new ApiError(500, "Failed to fetch document access info");
    }

    if (!document) {
        throw new ApiError(404, "Document not found");
    }

    const uId = userId.toString();
    const isAuthor = document.authorId?.toString() === uId;
    const isCollaborator = document.collaborators?.some((c: any) => c?.toString() === uId) ?? false;
    const isPending = document.pendingRequests?.some((p: any) => p?.toString() === uId) ?? false;
    const isRejected = document.rejectedRequests?.some((r: any) => r?.toString() === uId) ?? false;

    const validPendingIds = (document.pendingRequests || []).filter((id: string) =>
        mongoose.Types.ObjectId.isValid(id)
    );

    const validAuthorId =
        document.authorId && mongoose.Types.ObjectId.isValid(document.authorId)
            ? document.authorId
            : null;

    try {
        const [author, users] = await Promise.all([
            validAuthorId
                ? UserModel.findById(validAuthorId).select("userName email").lean()
                : Promise.resolve(null),
            isAuthor && validPendingIds.length > 0
                ? UserModel.find({ _id: { $in: validPendingIds } })
                    .select("userName email")
                    .lean()
                : Promise.resolve([]),
        ]);

        const pendingUsers = users.map((u: any) => ({
            userId: u._id.toString(),
            userName: u.userName,
            email: u.email,
        }));

        return {
            docId: document._id.toString(),
            documentName: document.documentName,
            isAuthor,
            isCollaborator,
            isPending,
            isRejected,
            hasAccess: isAuthor || isCollaborator,
            author: author ? { userName: author.userName, email: author.email } : null,
            pendingUsers,
        };
    } catch (error: any) {
        logger.error(`Error resolving user details for doc ${docId}: ${error?.message}`);
        throw new ApiError(500, "Failed to load document collaborator details");
    }
};

export const getUserDocumentsService = async (userId: string) => {
    try {
        const uId = userId.toString();
        const docs = await Document.find({
            $or: [
                { authorId: uId },
                { collaborators: uId },
            ],
        })
            .select("documentName authorId collaborators createdAt updatedAt")
            .sort({ updatedAt: -1 })
            .lean();

        const formattedDocs = docs.map((doc: any) => ({
            id: doc._id.toString(),
            documentName: doc.documentName || "Untitled Document",
            authorId: doc.authorId,
            isOwner: doc.authorId?.toString() === uId,
            collaboratorsCount: doc.collaborators?.length || 0,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        }));

        logger.info(`Fetched ${formattedDocs.length} documents for user ${userId}`);
        return formattedDocs;
    } catch (error: any) {
        logger.error(`Failed to fetch documents for user ${userId}: ${error?.message}`);
        throw new ApiError(500, "Failed to fetch user documents", error?.message);
    }
};

export const deleteDocumentService = async (docId: string, userId: string) => {
    validateObjectId(docId, "Document ID");
    const doc = await Document.findById(docId);
    if (!doc) {
        throw new ApiError(404, "Document not found");
    }

    if (doc.authorId?.toString() !== userId.toString()) {
        throw new ApiError(403, "Only the author can delete this document");
    }

    await Document.findByIdAndDelete(docId);
    logger.info(`User ${userId} deleted document ${docId}`);
    return { message: "Document deleted successfully" };
};



