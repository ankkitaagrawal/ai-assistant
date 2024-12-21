const mongoose = require('mongoose');
const resourceSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'agent',
            required: true
        },
        content: {
            type: String,
            required: false
        },
        description: {
            type: String,
            required: false
        },
        url: {
            type: String,
            required: false
        },
        public: {
            type: Boolean,
            required: true,
            default: false
        },
        metadata: {
            type: Map,
            of: mongoose.Schema.Types.Mixed,
            required: false
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
            required: true
        }
    },
    {
        timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
        versionKey: false, // Remove `__v` field
    }
);


export const Resource = mongoose.model('Resource', resourceSchema);
