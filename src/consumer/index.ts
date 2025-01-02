import dotenv from "dotenv";
dotenv.config();
const args = require('args-parser')(process.argv);
import { Connection, Channel } from "amqplib";
import logger from "../service/logger";
import rabbitmq from "../config/rabbitmq";
import webhook from "./webhook";
import message from "./message";
import agent from "./agent";
import rag from './rag';
import { connectDB } from "../models";
import utility from "./utility";
import { delay } from "../utility";
connectDB();

const CONSUMERS: IConsumer[] = [];
console.log(args, "args");
switch (args?.consumer) {
  case "webhook":
    // Add notification consumer to the consumers array
    CONSUMERS.push(webhook);
    CONSUMERS.push(message);
    CONSUMERS.push(agent);
    CONSUMERS.push(rag);
    CONSUMERS.push(utility);
    break;
  default:
    break;
}

export interface IConsumer {
  queue: string,
  processor: Function,
  batch: number
};

class Consumer {
  private connection?: Connection;
  private channel?: Channel;
  private queue: string;
  private processor: Function;
  private bufferSize: number = 1;
  private rabbitService;
  private shutdown = false;
  constructor(obj: IConsumer, connectionString?: string) {
    this.queue = obj.queue;
    this.processor = obj.processor;
    this.bufferSize = obj.batch;
    this.rabbitService = rabbitmq(connectionString);
    this.setup();
  }
  private setup() {
    this.rabbitService.on("connect", async (connection: Connection) => {
      this.connection = connection;
      this.channel = await this.connection?.createChannel();
      this.channel?.prefetch(this.bufferSize);
      this.channel?.assertQueue(this.queue, { durable: true });
      this.start();
    }).on("error", (error: any) => {
      logger.error(error);
    })
  }
  private start() {
    this.channel?.consume(this.queue, async (message: any) => {
      if (this.shutdown) {
        console.log("This consumer is shutting down, no longer processing messages");
        return;
      }
      try {
        await this.processor(message, this.channel);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }, { noAck: false })
  }
  public stop() {
    this.shutdown = true;
  }
  public async queueStatus() {
    let status = { messageCount: 0, consumerCount: 0 };
    if (this.channel) {
      const queue = await this.channel.assertQueue(this.queue, { durable: true }).catch(error => { return { messageCount: 0, consumerCount: 0 } });
      status = queue;
    }
    return status;
  }
}

const consumers = CONSUMERS.map(consumer => new Consumer(consumer));

process.on('SIGINT', async () => {
  consumers.forEach(consumer => consumer.stop());
  await delay(10000);
});

process.on('SIGTERM', async () => {
  consumers.forEach(consumer => consumer.stop());
  await delay(10000);
});
