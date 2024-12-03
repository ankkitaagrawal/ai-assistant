import pluginModel from "../models/plugins";



export async function getPluginById(id :String){
    return await pluginModel.findOne({_id:id})
 } 
 