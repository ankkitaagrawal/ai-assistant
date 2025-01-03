const mongoose = require('mongoose');


const diarySchema = new mongoose.Schema(
    {
        info: {
            type: String, // You can change this to the appropriate type
            required: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
    });
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
            type: [diarySchema],
            default: [],
            required: false
        },
        publicDiary: {
            type: [diarySchema],
            default: [],
            required: false
        }
        ,
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
