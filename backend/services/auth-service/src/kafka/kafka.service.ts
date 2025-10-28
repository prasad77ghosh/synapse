import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, KafkaConfig, Producer, RecordMetadata } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(KafkaService.name);
  private readonly kafka: Kafka;
  private readonly producer: Producer;

  constructor(private readonly configService: ConfigService) {
    const kafkaConfig: KafkaConfig = {
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT_ID',
        'auth-service',
      ),
      brokers: this.configService.get<string[]>('KAFKA_BROKERS', [
        'localhost:29092',
      ]),
    };

    this.kafka = new Kafka(kafkaConfig);
    this.producer = this.kafka.producer({
      allowAutoTopicCreation: false,
      idempotent: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.producer.connect();
      this.logger.log('Kafka Producer connected');
    } catch (error) {
      this.logger.error('Failed to connect Kafka Producer', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    } catch (error) {
      this.logger.error('Failed to disconnect Kafka Producer', error);
    }
  }

  async publish(
    topic: string,
    event: unknown,
    key?: string,
  ): Promise<RecordMetadata[]> {
    try {
      const messages = [
        {
          key: key ?? null,
          value: JSON.stringify(event),
          timestamp: Date.now().toString(),
        },
      ];

      const result = await this.producer.send({ topic, messages });

      this.logger.debug(`📤 Event published to ${topic}`, {
        topic,
        partition: result[0]?.partition,
        offset: result[0]?.offset,
      });

      return result;
    } catch (error) {
      this.logger.error(`❌ Failed to publish to ${topic}`, error);
      throw error;
    }
  }
}
