import mongoose from 'mongoose';



const pluginSchema = new mongoose.Schema({
    id :{
        type :String
    },
    description : {
        type :String 
    },
    appName :{
        type : String
    },
    action :{
        type :String
    }
}, { minimize: false });



const pluginModel = mongoose.model('plugin', pluginSchema);
export default pluginModel;
