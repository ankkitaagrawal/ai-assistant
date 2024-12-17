import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';


const QUEUE_NAME =  process.env.MESSAGE_QUEUE || 'message';
async function processMsg(message: any, channel: Channel) {
    // try {
    //     const data = JSON.parse(message.content.toString());
    //     const {to , from, message : textMessage } = data 
    //     let threadId = (to === from) ? to : await createOrFindThread(to, from);
    //     await createMessage(threadId , textMessage); // need to write logic for message will  passed to assistant and then to human if needed 
    //     rtlayer.message( JSON.stringify({ message : textMessage  , threadId : threadId } ) ,{
    //         channel : to
    //     });
    //     channel.ack(message);
    // } catch (error: any) {
    //     producer.publishToQueue(QUEUE_NAME+"_FAILED",message)
    //     console.log(error?.response,"error", error)
    //     logger.error(`[message] Error processing message: ${error.message}`);
    //     channel.ack(message);
    // }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}