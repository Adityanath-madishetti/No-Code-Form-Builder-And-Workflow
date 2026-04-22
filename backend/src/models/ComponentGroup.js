import mongoose from "mongoose";

const { Schema } = mongoose;

const ComponentGroupSchema = new Schema(
    {
        groupId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        components: {
            type: Schema.Types.Mixed, // Storing the array of components
            required: true,
        },
        createdBy: {
            type: String, // uid
            required: true,
            index: true,
        },
        sharedWith: {
            type: [String], // Array of emails
            default: []
        },
        isPublic: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model("ComponentGroup", ComponentGroupSchema);
