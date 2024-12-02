




import userModel from "../models/users";



export async function getUserDetails(id :String){
    return await userModel.findOne({proxyId:id})
 } 
 