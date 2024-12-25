import { Channel } from '../config/rabbitmq';
import logger from "../service/logger";
import producer from '../config/producer';
import rtlayer from '../config/rtlayer';
import { EventSchema, VERSION } from '../type/rag';
import { delay } from '../utility';
import { DocumentLoader } from '../service/document-loader';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import ResourceService from '../dbservices/resource';
import { Doc, MongoStorage, OpenAiEncoder, PineconeStorage } from '../service/document';


const QUEUE_NAME = process.env.RAG_QUEUE || 'rag';
async function processMsg(message: any, channel: Channel) {
    let resourceId: string = '';
    try {
        const msg = JSON.parse(message.content.toString());
        const { version, event, data } = EventSchema.parse(msg);
        resourceId = data.resourceId;
        console.log(`Event: ${event}`);
        switch (event) {
            case 'load':
                const loader = new DocumentLoader();
                const content = await loader.getContent(data.url);
                await ResourceService.updateResource(data.resourceId, { content });
                ResourceService.updateMetadata(data.resourceId, { status: 'loaded' }).catch(error => console.log(error));
                break;
            case 'delete': {
                const doc = new Doc(data.resourceId);
                await doc.delete(new PineconeStorage()); // WARNING: Pinecone delete is dependent on id from mongo
                await doc.delete(new MongoStorage());
                ResourceService.updateMetadata(data.resourceId, { status: 'deleted' }).catch(error => console.log(error));
                break;
            }
            case 'chunk': {
                const doc = new Doc(data.resourceId, data.content, { public: data.public, agentId: data.agentId });
                const chunk = await doc.chunk(512, 50);
                await chunk.save(new MongoStorage());
                await chunk.encode(new OpenAiEncoder());
                try {
                    await chunk.save(new PineconeStorage());
                } catch (error) {
                    chunk.delete(new MongoStorage());
                    throw error;
                }
                ResourceService.updateMetadata(data.resourceId, { status: 'chunked' }).catch(error => console.log(error));
                break;
            }
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
        console.log(error);
        // TODO: Add error message to the failed message
        producer.publishToQueue(QUEUE_NAME + "_FAILED", message.content.toString());
        if (resourceId) ResourceService.updateMetadata(resourceId, { status: 'error', message: error?.message }).catch(error => console.log(error));
        logger.error(`[message] Error processing message: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}