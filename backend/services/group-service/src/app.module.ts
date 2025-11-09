import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { GroupController } from './group/group.controller';
import { GroupModule } from './group/group.module';
import { WorkSpaceService } from './work-space/work-space.service';
import { WorkSpaceController } from './work-space/work-space.controller';
import { KafkaService } from './kafka/kafka.service';
import { KafkaModule } from './kafka/kafka.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    GroupModule,
    KafkaModule,
  ],
  controllers: [AppController, GroupController, WorkSpaceController],
  providers: [AppService, WorkSpaceService, KafkaService],
})
export class AppModule {}
