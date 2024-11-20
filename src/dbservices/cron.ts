import CronModel from "../models/cron";


export async function createCron({ isOnce, userId, message, cronExpression }: { isOnce: boolean, userId: string, message: string, cronExpression: string }) {
   return await CronModel.create({ isOnce, userId, message, cronExpression })
} 

export async function getCronDetailsById(id :String){
   return await CronModel.findOne({_id:id})
} 

export async function getCronDetailsByUserId(userId :String){
   return await CronModel.findOne({userId:userId})
} 