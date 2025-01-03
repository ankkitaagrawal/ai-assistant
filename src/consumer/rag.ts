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
import { AIMiddlewareBuilder } from '../utility/aimiddleware';
import env from '../config/env';


const QUEUE_NAME = process.env.RAG_QUEUE || 'rag';
async function processMsg(message: any, channel: Channel) {
    let resourceId: string = '';
    try {
        const msg = JSON.parse(message.content.toString());
        const { version, event, data } = EventSchema.parse(msg);
        resourceId = data.resourceId;
        console.log(`Event: ${event}`);
        let pipelineStatus = null;
        switch (event) {
            case 'load':
                const loader = new DocumentLoader();
                const content = await loader.getContent(data.url);
                await ResourceService.updateResource(data.resourceId, { content });
                pipelineStatus = "loaded";
                break;
            case 'delete': {
                const doc = new Doc(data.resourceId);
                await doc.delete(new PineconeStorage()); // WARNING: Pinecone delete is dependent on id from mongo
                await doc.delete(new MongoStorage());
                pipelineStatus = "deleted";
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
                await updateDescription(data?.resourceId, data?.content).catch(error => logger.error(error));
                pipelineStatus = "chunked";
                break;
            }
            case 'update':
                {
                    // TODO: Change the visibility of the resource
                    break;
                }
            default:
                {
                    logger.error(`[message] Unknown event type: ${event}`);
                    throw new Error(`Unknown event type: ${event}`);
                    break;
                }
        }
        if (pipelineStatus) {
            await ResourceService.updateMetadata(data.resourceId, { status: pipelineStatus }).catch(error => console.log(error));
            await rtlayer.message(JSON.stringify({ id: data?.resourceId, status: pipelineStatus }), { channel: "resource" }).catch(error => logger.error(error));
        }
        channel.ack(message);
    } catch (error: any) {
        console.log(error);
        // TODO: Add error message to the failed message
        producer.publishToQueue(QUEUE_NAME + "_FAILED", message.content.toString());
        if (resourceId) {
            await ResourceService.updateMetadata(resourceId, { status: 'error', message: error?.message }).catch(error => console.log(error));
            await rtlayer.message(JSON.stringify({ id: resourceId, status: 'error', message: error?.message }), { channel: "resource" }).catch(error => logger.error(error));
        }
        logger.error(`[message] Error processing message: ${error.message}`);
        channel.ack(message);
    }

}

export default {
    queue: QUEUE_NAME,
    processor: processMsg,
    batch: 1
}


async function updateDescription(resourceId: string, content: string) {
    // Generate description
    const aiMiddleware = new AIMiddlewareBuilder(env.AI_MIDDLEWARE_AUTH_KEY);
    const descriptionGenerator = aiMiddleware.useBridge("676febfe9768bd87271d3e3e").useOpenAI("gpt-4o-mini").build();
    const description = await descriptionGenerator.sendMessage(content);
    await ResourceService.updateResource(resourceId, { description });
}