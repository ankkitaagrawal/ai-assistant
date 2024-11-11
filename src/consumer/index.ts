const args = require('args-parser')(process.argv);
import { Connection, Channel } from "amqplib";
import logger from "../service/logger";
import rabbitmq from "../db/rabbitmq";


const CONSUMERS: IConsumer[] = [];
switch (args?.consumer) {
  case "notification":
    // Add notification consumer to the consumers array
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
      try {
        await this.processor(message, this.channel);
      } catch (error) {
        logger.error(error);
        throw error;
      }
    }, { noAck: false })
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

export default CONSUMERS.map(consumer => new Consumer(consumer));
