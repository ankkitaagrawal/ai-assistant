




import userModel from "../models/users";



export async function getUserDetailsByProxyId(id :String){
    return await userModel.findOne({proxyId:id}).populate('appList.pluginData').lean();
 } 

 export async function createUser({proxyId,channelId}:{proxyId :string ,channelId:string}){
    const user = await userModel.create({
        proxyId,
        channelId,
        appList :[ { pluginData:"674b0066d7097c29597410f6" ,userData : { id :proxyId }}]
    });
    // Step 2: Populate the appList.pluginData field
    const populatedUser = await user.populate('appList.pluginData');
    return populatedUser.toObject();
 } 
 

 export async function updatePrompt ({userId , prompt } :{userId :string , prompt :string }){
    return await userModel.findOneAndUpdate({channelId:userId} ,{
        $set :{prompt : prompt}
    })
 }


export async function addThreadInUserHistory(id :String){
    // return await userModel.findOne({proxyId:id})
 } 
 