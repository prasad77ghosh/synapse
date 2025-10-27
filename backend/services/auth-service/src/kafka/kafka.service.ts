import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CompressionTypes, Kafka, KafkaConfig, Producer } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const kafkaConfig: KafkaConfig = {
      clientId: 'auth-service',
      brokers: ['localhost:29092'],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.kafka = new Kafka(kafkaConfig);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
    });
  }

  async onModuleInit() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.producer.connect();
    this.logger.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.producer.disconnect();
    this.logger.log('Kafka Producer disconnected');
  }

  async publish(topic: string, event: any, key?: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      const result = await this.producer.send({
        topic,
        messages: [
          {
            key: key || null,
            value: JSON.stringify(event),
            timestamp: Date.now().toString(),
          },
        ],
        compression: CompressionTypes.GZIP,
      });

      this.logger.debug(`📤 Event published to ${topic}`, {
        topic,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        partition: result[0].partition,
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to publish to ${topic}`, error);
      throw error;
    }
  }
}
