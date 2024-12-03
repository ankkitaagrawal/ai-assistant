import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import axios from 'axios';
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { getCronDetailsById } from '../dbservices/cron';
import { createMessage, sendMessage } from '../utility/aimiddleware';
import { createOrFindThread } from '../dbservices/thread';

const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';
async function processMsg(message: any, channel: Channel) {

    try {
        const data = JSON.parse(message.content.toString());
        
        const crondata = await getCronDetailsById(data.event);
        if (!crondata) throw new Error("invalid id")
        console.log(crondata,"crondata")
        // const messageFromAI  = (await sendMessage("this is a message from the cron we have setup " , {context : crondata ,system_prompt : "below data is the reminder , that we have set up ,  now take action and drop a message to the user "} ))||"" 
        let threadId = (crondata.to === crondata.from) ? crondata.to : await createOrFindThread(crondata.to, crondata.from);
        await createMessage(threadId ,crondata?.message);
        
        rtlayer.message(message,{
            channel : crondata?.to
        });
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
    processor: processMsg,
    batch: 1
}