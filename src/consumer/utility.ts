import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { EventSchema } from '../type/event';
import { generateThreadName } from '../service/thread';
import { updateThreadName } from '../dbservices/thread';



const QUEUE_NAME = process.env.UTILITY_QUEUE || 'assistant-utility';
async function processMsg(message: any, channel: Channel) {
    try {
        const msg = JSON.parse(message.content.toString());
        const { event, data } = EventSchema.parse(msg);
        switch (event) {
            case 'generate-thread-name':
                {
                    const name = await generateThreadName(data.threadId, data.message, data.response);
                    if (!name) break;
                    // Update the thread name in the database
                    await updateThreadName(data.threadId, name);
                    // Send the thread name to the UI
                    rtlayer.message(JSON.stringify({ name: name }), {
                        channel: data.threadId
                    });
                    break;
                }
            default:
                logger.error(`[message] Unknown event type: ${event}`);
                throw new Error(`Unknown event type: ${event}`);
                break;
        }
        channel.ack(message);
    } catch (error: any) {
        console.log(error);
        // TODO: Add error message to the failed message
        producer.publishToQueue(QUEUE_NAME + "_FAILED", message.content.toString());
        logger.error(`[message] Error processing message: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}