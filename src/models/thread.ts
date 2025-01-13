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
        },
        agent: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'agent',
            required: true
        },
        type: {
            type: String, // Enum, 'conversation', 'fallback'
            required: false
        }
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        versionKey: false, // Remove `__v` field
    }
);

threadSchema.index({ name: 'text' });

export const Thread = mongoose.model('Thread', threadSchema);
