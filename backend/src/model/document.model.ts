import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
    {
        documentName: {
            type: String,
            default: "Untitled Document",
            trim: true,
        }, crdtState: {
            type: Buffer,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

export const Document = mongoose.model("Document", documentSchema);