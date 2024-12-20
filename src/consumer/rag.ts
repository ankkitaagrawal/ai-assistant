import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { EventSchema, VERSION } from '../type/rag';
import { delay } from '../utility';
import { DocumentLoader } from '../service/document-loader';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import ResourceService from '../dbservices/resource';


const QUEUE_NAME = process.env.RAG_QUEUE || 'rag';
async function processMsg(message: any, channel: Channel) {
    try {
        const msg = JSON.parse(message.content.toString());
        if (msg.version != VERSION) {
            await delay(1000);
            logger.error(`[message] Version mismatch: ${msg.version}`);
            return channel.nack(message);
        }
        const { version, event, data } = EventSchema.parse(msg);
        switch (event) {
            case 'load':
                const loader = new DocumentLoader();
                const content = await loader.getContent(data.url);
                await ResourceService.updateResource(data.resourceId, { content });
                break;
            case 'delete':
                // TODO: Delete the existing chunks because resource has been updated
                break;
            case 'chunk':
                // Chunk the content
                const textSplitter = new RecursiveCharacterTextSplitter({
                    chunkSize: 500,
                    chunkOverlap: 50,
                    // separators: ['\n', '\r\n', '\r', '\t', ' '],
                    // separators: ["|", "##", ">", "-"],
                });
                const splits = await textSplitter.splitDocuments([{ pageContent: data.content, metadata: {} }]);
                // TODO: Save the chunks to the database
                break;
            case 'update':
                // TODO: Change the visibility of the resource
                break;
            default:
                logger.error(`[message] Unknown event type: ${event}`);
                throw new Error(`Unknown event type: ${event}`);
                break;
        }

        channel.ack(message);
    } catch (error: any) {
        // TODO: Add error message to the failed message
        producer.publishToQueue(QUEUE_NAME + "_FAILED", message);
        logger.error(`[message] Error processing message: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}