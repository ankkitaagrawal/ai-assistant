import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import {  deleteCronFromFlow, getCronDetailsById } from '../dbservices/cron';
import {  sendMessage } from '../utility/aimiddleware';
import { getUserByChannelId } from '../dbservices/user';

const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';
async function processWebhook(message: any, channel: Channel) {

    try {
        const data = JSON.parse(message.content.toString());
        const crondata = await getCronDetailsById(data.event);
        if (!crondata) throw new Error("invalid id")
        const  userData = await getUserByChannelId({ channelId :crondata?.from })
        if (crondata.isOnce == true){
            await deleteCronFromFlow(crondata.id)
        }
        await sendMessage( crondata.message ,
        {
            prompt : userData?.prompt,
            system_prompt : "current time " + `${new Date().toISOString()}`  }
        )
        channel.ack(message);

    } catch (error: any) {
        producer.publishToQueue(QUEUE_NAME+"_FAILED",message)
        console.log(error?.response,"error", error)
        logger.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processWebhook,
    batch: 1
}