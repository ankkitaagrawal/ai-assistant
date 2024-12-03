import mongoose from 'mongoose';



const threadSchema = new mongoose.Schema({
    users :{
        type :Array
    }
}, { minimize: false });



const threadModel = mongoose.model('thread', threadSchema);
export default threadModel;
