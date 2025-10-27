import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Consumer, EachMessagePayload, KafkaConfig } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private readonly consumers = new Map<string, Consumer>();

  constructor(private readonly configService: ConfigService) {
    const kafkaConfig: KafkaConfig = {
      clientId: 'notification-service',
      brokers: [this.configService.get('KAFKA_BROKER', 'localhost:29092')],
      // Optionally add SSL, SASL, etc., from config
    };
    this.kafka = new Kafka(kafkaConfig);
  }

  onModuleInit() {
    this.logger.log('Notification Service KafkaService initialized');
  }

  async onModuleDestroy() {
    for (const [groupId, consumer] of this.consumers) {
      await consumer.disconnect().catch((e) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.logger.warn(`Failed to disconnect ${groupId}: ${e.message}`),
      );
      this.logger.log(`Consumer "${groupId}" disconnected`);
    }
    this.consumers.clear();
  }

  /**
   * Subscribe to topics and consume messages via handler callback
   */
  async subscribe(
    groupId: string,
    topics: string[],
    handler: (topic: string, message: unknown) => Promise<void>,
  ) {
    if (this.consumers.has(groupId)) {
      this.logger.warn(`Consumer "${groupId}" already exists`);
      return;
    }
    const consumer = this.kafka.consumer({
      groupId,
      sessionTimeout: 30_000,
      heartbeatInterval: 3_000,
    });

    await consumer.connect();
    this.logger.log(`Consumer "${groupId}" connected`);

    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, partition, message } = payload;
        try {
          const value = message.value?.toString() ?? '';
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          const parsed = value ? JSON.parse(value) : null;
          this.logger.debug(
            `Received [${topic}] Partition:${partition} Offset:${message.offset}`,
          );
          await handler(topic, parsed);
        } catch (error) {
          this.logger.error(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            `Error processing message from ${topic}: ${error?.message}`,
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            error?.stack,
          );
          // TODO: Route to DLQ or error topic in production
        }
      },
    });

    this.consumers.set(groupId, consumer);
    this.logger.log(`Consumer "${groupId}" listening to: ${topics.join(', ')}`);
  }
}
