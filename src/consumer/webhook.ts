import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import axios from 'axios';
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';

const QUEUE_NAME = process.env.WEBHOOK_QUEUE || 'webhook';
async function processMsg(message: any, channel: Channel) {

    try {
        const event = message.content;
        rtlayer.message(event);
        channel.ack(message);
    } catch (error: any) {
        logger.error(`[WEBHOOK] Error processing webhook: ${error.message}`);
        channel.nack(message);
    }

}



export default {
    queue: QUEUE_NAME,
    processor: processMsg
}