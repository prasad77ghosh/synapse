import { Injectable } from '@nestjs/common';
import { KAFKA_TOPICS } from '@synapse/shared/dist/kafka-config/src';
import { KafkaService } from 'src/kafka/kafka.service';

@Injectable()
export class NotificationService {
  constructor(private kafkaConsumer: KafkaService) {}

  async onModuleInit() {
    // Subscribe to user registration events
    await this.kafkaConsumer.subscribe(
      'notification-service-group',
      [KAFKA_TOPICS.USER_REGISTERED],
      this.handleMessage.bind(this),
    );
  }

  private handleMessage(topic: string, message: any) {
    console.log(`${topic} --> ${JSON.stringify(message)}`);
  }
}
