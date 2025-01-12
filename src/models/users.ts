import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  proxyId: {
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
  email: {
    type: String,
    required: false
  },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'agent',
    required: false
  },


}, {
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
  versionKey: false, // Remove `__v` field
  minimize: false
});



const userModel = mongoose.model('User', userSchema);
export default userModel;
