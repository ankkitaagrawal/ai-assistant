import axios from "axios";
import CronModel from "../models/crons";


export async function createCron({ isOnce, userId, message, cronExpression,id ,timezone ,cronJobId , to , from }: { isOnce: boolean, userId: string, message: string, cronExpression: string ,id:string ,timezone :string ,cronJobId :string , to :string  , from :string}) {
   return await CronModel.create({ isOnce, userId, message, cronExpression,id ,timezone,cronJobId , to , from})
} 

export async function getCronDetailsById(id :String){
   return await CronModel.findOne({id:id})
} 

export async function getCronDetailsByUserId(userId :String){
   return await CronModel.find({from:userId})
} 
export async function deleteCronById(id :String){
   return await CronModel.findOneAndDelete({id :id})
} 

export async function deleteCronFromFlow (id :string){
   return await axios.post("http://flow.sokt.io/func/scriwc4lpU2K",{id,type:"delete"})
}