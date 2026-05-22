import * as amqp from "amqplib";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || "amqp://guest:guest@localhost:5672";

let connection: any = null;
let channel: any = null;

export const connectRabbitMQ = async () => {
  if (!connection) {
    connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();
    console.log("🐰 Connected to RabbitMQ");
  }
  return channel!;
};

export const publishMessage = async (queue: string, message: any) => {
  const ch = await connectRabbitMQ();
  await ch.assertQueue(queue, { durable: true });
  ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
};

import type { ConsumeMessage } from "amqplib";

export const consumeMessage = async (queue: string, callback: (msg: any) => Promise<void>) => {
  const ch = await connectRabbitMQ();
  await ch.assertQueue(queue, { durable: true });
  
  // prefetch 1 ensures the consumer only gets 1 message at a time, preventing overload
  ch.prefetch(1);
  
  ch.consume(queue, async (msg: ConsumeMessage | null) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        await callback(content);
        ch.ack(msg);
      } catch (error) {
        console.error("Error processing message:", error);
        // Nack without requeue if error is not recoverable, or just ack to drop it
        // For simplicity, we ack it to avoid infinite loop on bad data
        ch.ack(msg);
      }
    }
  });
};
