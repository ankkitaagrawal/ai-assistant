import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import axios from 'axios';
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { getCronDetailsById } from '../dbservices/cron';
import { createMessage, sendMessage } from '../utility/aimiddleware';

const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';
async function processMsg(message: any, channel: Channel) {

    try {
        const data = JSON.parse(message.content.toString());
        console.log("event",data.event);
        const crondata = await getCronDetailsById(data.tool);
        const messageFromAI  = (await sendMessage("this is a message from the cron we have setup " , {context : crondata ,system_prompt : "below data is the reminder , that we have set up ,  now take action and drop a message to the user "} ))||""
        await createMessage(crondata?.userId || "",messageFromAI);
        rtlayer.message(messageFromAI,{
            channel :crondata?.userId 
        });
        channel.ack(message);
    } catch (error: any) {
        console.log(error?.response,"error", error)
        logger.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
        channel.nack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}