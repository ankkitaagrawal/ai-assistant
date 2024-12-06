import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import { getCronDetailsById } from '../dbservices/cron';
import {  sendMessage } from '../utility/aimiddleware';
import { getUserByChannelId } from '../dbservices/user';

const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';
async function processWebhook(message: any, channel: Channel) {

    try {
        const data = JSON.parse(message.content.toString());
        const crondata = await getCronDetailsById(data.event);
        if (!crondata) throw new Error("invalid id")
        console.log(crondata,"crondata")
        const  userData = await getUserByChannelId({ channelId :crondata?.from })
        await sendMessage( crondata.message ,
        {
            prompt : userData?.prompt,
            context : crondata ,
            system_prompt : "The given message is result of an task schudled by you . Please take the appropriate action as per the user message  . Do not schedule any new tasks "}
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