const mongoose = require('mongoose');
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
        prompt: {
            type: String,
            required: false
        },
        docLinks: {
            type: [
                {
                    title: { type: String }, 
                    url: { type: String, required: true },   
                    id :{type :String,required : true }
                }
            ],
            required: false,
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


export const Agent = mongoose.model('Agent', agentSchema);
