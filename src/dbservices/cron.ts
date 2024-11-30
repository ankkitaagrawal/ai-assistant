import CronModel from "../models/crons";


export async function createCron({ isOnce, userId, message, cronExpression,id ,timezone ,cronJobId }: { isOnce: boolean, userId: string, message: string, cronExpression: string ,id:string ,timezone :string ,cronJobId :string}) {
   return await CronModel.create({ isOnce, userId, message, cronExpression,id ,timezone,cronJobId})
} 

export async function getCronDetailsById(id :String){
   return await CronModel.findOne({id:id})
} 

export async function getCronDetailsByUserId(userId :String){
   return await CronModel.find({userId:userId})
} 
export async function deleteCronById(id :String){
   return await CronModel.findOneAndDelete({id :id})
} 