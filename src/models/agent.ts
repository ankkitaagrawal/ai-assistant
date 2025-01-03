const mongoose = require('mongoose');

const diarySchema = new mongoose.Schema(
    {
        headingId: {
            type: String, 
            required: true,
            unique: true
        },
        Name: {
            type: String, 
            required: true
        },
        Content: {
            type: String, 
            required: true
        }
    },
    {
        timestamps: false,
        versionKey: false,
    }
);
const agentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        bridgeId: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        logo: {
            type: String,
            required: false
        },
        llm: {
            service: {
                type: String,
                required: true
            },
            model: {
                type: String,
                required: true
            },
        },
        vectorTable: {
            type: String,
            required: false
        },
        instructions: {
            type: String,
            required: false
        },
        privateDiary: {
            type: Map, // Map for structured key-value pairs
            of: diarySchema,
            default: {}
        },
        publicDiary: {
            type: Map, // Map for structured key-value pairs
            of: diarySchema,
            default: {}
        },
        editors: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        ],
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


export const Agent = mongoose.model('Agent', agentSchema);
