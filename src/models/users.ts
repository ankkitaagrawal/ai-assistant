import mongoose from 'mongoose';



const userSchema = new mongoose.Schema({
  proxyId: {
    type: String,
    required: true
  },
  channelId: {
    type: String,
    required: true
  },
  appList :{
    type :String,
  },
  threads: {
    type: Array
  }
}, { minimize: false });



const userModel = mongoose.model('user', userSchema);
export default userModel;
