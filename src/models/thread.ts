const mongoose = require('mongoose');

const threadSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        middleware_id: {
            type: String,
            required: true,
            unique: true
        },
        createdBy: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        versionKey: false, // Remove `__v` field
    }
);

export const Thread = mongoose.model('Thread', threadSchema);
