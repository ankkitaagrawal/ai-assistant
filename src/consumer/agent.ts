import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import { getCrawledDataFromSite } from '../service/langchain';

const QUEUE_NAME = process.env.AGENT_QUEUE || 'agent';
async function processAssistantEmbed(message: any, channel: Channel) {

    try {
        const data = JSON.parse(message.content.toString());
        const { url ,assistantId,id} =data ;
        await getCrawledDataFromSite(url ,assistantId , id);
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
    processor: processAssistantEmbed,
    batch: 1
}