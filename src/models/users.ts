import mongoose from 'mongoose';
import { object } from 'zod';

const userSchema = new mongoose.Schema({
  proxyId: {
    type: String,
    required: true,
    unique: true

  },
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: false,
  },
  avatar: {
    type: String,
    required: false
  },
  appList: [{
    pluginData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'plugin',
      required: true
    },
    userData: {
      type: Map, // Using Map to store key-value pairs
      of: mongoose.Schema.Types.Mixed, // Allowing any type of value (strings, numbers, objects, etc.)
      required: false
    }
  }],

  prompt: {
    type: String
  },
  aiModel: {
    type: String
  },
  aiService: {
    type: String
  }

}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  versionKey: false, // Remove `__v` field
  minimize: false
});



const userModel = mongoose.model('user', userSchema);
export default userModel;
