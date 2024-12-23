const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema(
    {
        data: {
            type: String,
            required: true
        },
        resourceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Resource',
            required: true
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Agent',
            required: true
        },
        public: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        versionKey: false // Remove `__v` field
    }
);


export const Chunk = mongoose.model('Chunk', chunkSchema);
