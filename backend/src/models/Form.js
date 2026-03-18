import mongoose from "mongoose";

const { Schema } = mongoose;

const FormSchema = new Schema(
    {
        formId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        title: {
            type: String,
            default: "Untitled Form",
            trim: true,
        },

        currentVersion: {
            type: Number,
            required: true,
            default: 1,
        },

        isActive: {
            type: Boolean,
            default: false,
        },

        isDeleted: {
            type: Boolean,
            default: false,
        },

        createdBy: {
            type: String,
            required: true,
            index: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Form", FormSchema);
