import mongoose from 'mongoose';
import { object } from 'zod';



const userSchema = new mongoose.Schema({
  proxyId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  appList: [{
    pluginData : {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'plugin',
      required: true
    },
    userData :{
      type: Map, // Using Map to store key-value pairs
      of: mongoose.Schema.Types.Mixed, // Allowing any type of value (strings, numbers, objects, etc.)
      required: false
    }
  }]
  
}, { minimize: false });



const userModel = mongoose.model('user', userSchema);
export default userModel;
